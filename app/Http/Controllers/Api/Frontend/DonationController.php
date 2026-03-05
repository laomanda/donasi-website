<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class DonationController extends Controller
{
    public function summary()
    {
        $generalQuery = Donation::paid()->whereNull('program_id');

        return response()->json([
            'general' => [
                'count'  => (clone $generalQuery)->count(),
                'amount' => (clone $generalQuery)->sum('amount'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'program_id'   => ['nullable', 'exists:programs,id'],
            'donor_name'   => ['required', 'string', 'max:255'],
            'donor_email'  => ['nullable', 'email'],
            'donor_phone'  => ['required', 'string', 'max:30'],
            'amount'       => ['required', 'numeric', 'min:1000'],
            'is_anonymous' => ['required', 'boolean'],
            'notes'        => ['nullable', 'string'],
        ]);

        $orderId = $this->generateMidtransOrderId();
        $programId = $data['program_id'] ?? null;
        $program = $programId ? Program::find($programId) : null;

        $donation = DB::transaction(function () use ($data, $orderId, $programId) {
            $created = Donation::create([
                'program_id'            => $programId,
                'donation_code'         => $this->generateDonationCode(),
                'donor_name'            => $data['donor_name'],
                'donor_email'           => $data['donor_email'] ?? null,
                'donor_phone'           => $data['donor_phone'] ?? null,
                'amount'                => $data['amount'],
                'is_anonymous'          => $data['is_anonymous'],
                'payment_source'        => 'midtrans',
                'payment_method'        => 'snap',
                'status'                => 'pending', 
                'paid_at'               => null,
                'notes'                 => $data['notes'] ?? null,
                'midtrans_order_id'     => $orderId,
                'user_id'               => auth('sanctum')->id(),
            ]);

            // Removed optimistic increment logic here. 
            // The collected_amount will be incremented in the webhook when status becomes 'paid'.

            return $created;
        });

        try {
            $snapResponse = $this->createMidtransTransaction($donation, $program);
        } catch (\Throwable $th) {
            report($th);
            $donation->delete();

            return response()->json([
                'message' => 'Gagal membuat transaksi Midtrans.',
            ], 500);
        }

        $donation->update([
            'midtrans_transaction_id' => $snapResponse['transaction_id'] ?? null,
            'midtrans_raw_response'   => $snapResponse,
        ]);

        return response()->json([
            'snap_token'  => $snapResponse['token'] ?? null,
            'redirect_url'=> $snapResponse['redirect_url'] ?? null,
            'donation'    => $donation->fresh(),
        ], 201);
    }

    private function createMidtransTransaction(Donation $donation, ?Program $program = null): array
    {
        $this->setupMidtrans();

        $finishUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url') ?? url('/'))), '/');
        // Midtrans kadang tidak melampirkan parameter secara otomatis jika callbacks dire-define. 
        // Jadi kita tambahkan manual agar front-end selalu menerima parameter yang dibutuhkan.
        $baseUrl = $finishUrl . '/donate?order_id=' . urlencode($donation->midtrans_order_id);

        $payload = [
            'transaction_details' => [
                'order_id'     => $donation->midtrans_order_id,
                'gross_amount' => (int) round($donation->amount),
            ],
            'customer_details' => [
                'first_name' => $donation->donor_name,
                'email'      => $donation->donor_email,
                'phone'      => $donation->donor_phone,
            ],
            'item_details' => [
                [
                    'id'       => $donation->program_id ?? 'general',
                    'price'    => (int) round($donation->amount),
                    'quantity' => 1,
                    'name'     => $program?->title ?? 'Donasi Umum',
                ],
            ],
            'callbacks' => [
                'finish'   => $baseUrl . '&transaction_status=settlement',
                'pending'  => $baseUrl . '&transaction_status=pending',
                'error'    => $baseUrl . '&transaction_status=deny',
            ],
            'custom_expiry' => [
                'expiry_duration' => 5,
                'unit'            => 'minute'
            ],
        ];

        $response = Snap::createTransaction($payload);

        return json_decode(json_encode($response), true, 512, JSON_THROW_ON_ERROR);
    }

    private function setupMidtrans(): void
    {
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = (bool) config('midtrans.is_production', false);
        MidtransConfig::$isSanitized = true;
        MidtransConfig::$is3ds = true;
    }

    private function generateMidtransOrderId(): string
    {
        return 'DPF-' . now()->format('YmdHis') . '-' . Str::random(5);
    }

    private function generateDonationCode(): string
    {
        $prefix = 'DPF-' . now()->format('Ymd');

        $lastCode = Donation::where('donation_code', 'like', "{$prefix}%")
            ->orderByDesc('donation_code')
            ->value('donation_code');

        $sequence = $lastCode ? (int) substr($lastCode, -4) : 0;
        $sequence++;

        return sprintf('%s-%04d', $prefix, $sequence);
    }

    public function cancel(Donation $donation)
    {
        if ($donation->status === 'paid') {
            return response()->json(['message' => 'Donasi sudah dibayar, tidak dapat dibatalkan.'], 400);
        }

        $donation->update([
            'status' => 'failed', // or 'cancelled'
        ]);

        return response()->json(['message' => 'Donasi berhasil dibatalkan.']);
    }

    public function checkStatusByOrder(Request $request, \App\Services\MidtransService $midtransService)
    {
        $orderId = $request->input('order_id');
        if (!$orderId) {
            return response()->json(['message' => 'Order ID is required'], 400);
        }

        $donation = Donation::where('midtrans_order_id', $orderId)->first();
        if (!$donation) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        return $this->checkStatus($request, $donation, $midtransService);
    }

    public function checkStatus(Request $request, Donation $donation, \App\Services\MidtransService $midtransService)
    {
        $this->setupMidtrans();
        $isProduction = (bool) config('midtrans.is_production', false);

        $snapResult = $request->input('snap_result'); // Payload dari onSuccess Frontend
        $forcePaid  = $request->boolean('force_paid', false);

        // Fast path: frontend says payment was completed in the redirect flow — trust it
        if ($forcePaid && $donation->status !== 'paid') {
            \Illuminate\Support\Facades\Log::info('DonationController::checkStatus force_paid', [
                'order_id' => $donation->midtrans_order_id,
            ]);
            $donation->update([
                'status'               => 'paid',
                'paid_at'              => now(),
                'midtrans_raw_response' => ['transaction_status' => 'settlement', 'fraud_status' => 'accept', 'source' => 'frontend_redirect_force'],
            ]);
            $this->syncProgramAmount($donation->fresh(), 'pending', 'paid');
            return response()->json([
                'message'  => 'Status berhasil diperbarui via redirect.',
                'status'   => 'paid',
                'donation' => $donation->fresh(),
            ]);
        }

        // Jika Snap frontend mengirimkan payload → gunakan langsung, bypass Midtrans API call
        if ($snapResult && isset($snapResult['transaction_status'])) {
            $transactionStatus = $snapResult['transaction_status'];
            $fraudStatus = $snapResult['fraud_status'] ?? null;

            $newStatus = $midtransService->mapTransactionStatus($transactionStatus, $fraudStatus);

            \Illuminate\Support\Facades\Log::info('DonationController::checkStatus using Snap Frontend Payload', [
                'order_id'                => $donation->midtrans_order_id,
                'snap_transaction_status' => $transactionStatus,
                'mapped_new_status'       => $newStatus,
                'current_status'          => $donation->status,
            ]);

            // Update for ANY status change (paid, failed, cancelled, etc.)
            if ($newStatus !== $donation->status) {
                $previousStatus = $donation->status;
                $donation->update([
                    'status'               => $newStatus,
                    'paid_at'             => $newStatus === 'paid' ? now() : $donation->paid_at,
                    'midtrans_raw_response' => $snapResult,
                ]);
                $this->syncProgramAmount($donation->fresh(), $previousStatus, $newStatus);
            }

            // Always return early — don't fall through to Midtrans API
            return response()->json([
                'message'  => 'Status berhasil diperbarui via Frontend Snap Callback.',
                'status'   => $newStatus,
                'donation' => $donation->fresh(),
            ]);
        }

        try {
            $status = (object) \Midtrans\Transaction::status($donation->midtrans_order_id);
            \Illuminate\Support\Facades\Log::info('DonationController::checkStatus Result', [
                'order_id' => $donation->midtrans_order_id,
                'midtrans_response' => (array) $status
            ]);
        } catch (\Exception $e) {
            $msg = $e->getMessage();
            if (strpos($msg, '404') !== false) {
                 \Illuminate\Support\Facades\Log::warning('DonationController::checkStatus: Transaction not found (404)', ['order_id' => $donation->midtrans_order_id]);
                 return response()->json([
                     'message' => 'Transaksi belum ditemukan di sistem pembayaran (atau belum dibayar).',
                     'status' => $donation->status,
                     'donation' => $donation
                 ]);
            }

            \Illuminate\Support\Facades\Log::error('DonationController::checkStatus Error', ['message' => $msg]);
            return response()->json(['message' => 'Gagal mengecek status ke Midtrans: ' . $msg], 500);
        }

        $transactionStatus = $status->transaction_status;
        $fraudStatus       = $status->fraud_status ?? null;
        $paymentType       = $status->payment_type ?? '';

        $newStatus = $midtransService->mapTransactionStatus($transactionStatus, $fraudStatus);
        $previousStatus = $donation->status;

        \Illuminate\Support\Facades\Log::info('DonationController::checkStatus Mapping', [
            'order_id'           => $donation->midtrans_order_id,
            'transaction_status' => $transactionStatus,
            'fraud_status'       => $fraudStatus,
            'payment_type'       => $paymentType,
            'mapped_new_status'  => $newStatus,
            'previous_status'    => $previousStatus,
        ]);

        // Jika status tidak berubah, tidak perlu update berat
        if ($newStatus === $previousStatus) {
            return response()->json([
                'message' => 'Status belum berubah.',
                'status'  => $newStatus,
                'donation' => $donation
            ]);
        }

        $donation->update([
            'status' => $newStatus,
            'paid_at' => $newStatus === 'paid' ? now() : $donation->paid_at,
            'midtrans_raw_response' => (array) $status,
        ]);

        $this->syncProgramAmount($donation->fresh(), $previousStatus, $newStatus);

        return response()->json([
            'message' => 'Status berhasil diperbarui.',
            'status' => $newStatus,
            'donation' => $donation->fresh()
        ]);
    }


    private function syncProgramAmount(Donation $donation, ?string $oldStatus, string $newStatus): void
    {
        if (! $donation->program_id) {
            return;
        }

        $program = $donation->program;

        if (! $program) {
            return;
        }

        if ($oldStatus !== 'paid' && $newStatus === 'paid') {
            \Illuminate\Support\Facades\Log::info('SyncProgramAmount: Incrementing', ['program_id' => $program->id, 'amount' => $donation->amount]);
            $program->increment('collected_amount', $donation->amount);
        } elseif ($oldStatus === 'paid' && $newStatus !== 'paid') {
            \Illuminate\Support\Facades\Log::info('SyncProgramAmount: Decrementing', ['program_id' => $program->id, 'amount' => $donation->amount]);
            $program->decrement('collected_amount', $donation->amount);
        } else {
             \Illuminate\Support\Facades\Log::info('SyncProgramAmount: No change', ['old' => $oldStatus, 'new' => $newStatus]);
        }
    }
}
