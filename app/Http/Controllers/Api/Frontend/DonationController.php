<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Http\Requests\Frontend\StoreMidtransDonationRequest;
use App\Services\DonationService;
use App\Services\MidtransService;
use Illuminate\Support\Facades\Log;

class DonationController extends Controller
{
    public function __construct(
        private DonationService $donationService,
        private MidtransService $midtransService
    ) {}

    public function summary()
    {
        $data = Cache::remember('frontend_donation_summary', 600, function () {
            $generalQuery = Donation::paid()->whereNull('program_id');
            return [
                'general' => [
                    'count'  => (clone $generalQuery)->count(),
                    'amount' => (clone $generalQuery)->sum('amount'),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(StoreMidtransDonationRequest $request)
    {
        $donation = $this->donationService->createMidtransDonation($request->validated());
        $program = $donation->program_id ? Program::find($donation->program_id) : null;

        try {
            $snapResponse = $this->midtransService->createSnapTransaction($donation, $program);
        } catch (\Throwable $th) {
            report($th);
            $this->donationService->deleteDonation($donation);

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

    public function checkStatusByOrder(Request $request)
    {
        $orderId = $request->input('order_id');
        if (!$orderId) {
            return response()->json(['message' => 'Order ID is required'], 400);
        }

        $donation = Donation::where('midtrans_order_id', $orderId)->first();
        if (!$donation) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        return $this->checkStatus($request, $donation);
    }

    public function checkStatus(Request $request, Donation $donation)
    {
        $this->midtransService->setupMidtrans();

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
            $this->donationService->syncProgramAmount($donation->fresh(), 'pending', 'paid');
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

            $newStatus = $this->midtransService->mapTransactionStatus($transactionStatus, $fraudStatus);

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
                $this->donationService->syncProgramAmount($donation->fresh(), $previousStatus, $newStatus);
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

        $newStatus = $this->midtransService->mapTransactionStatus($transactionStatus, $fraudStatus);
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

        $this->donationService->syncProgramAmount($donation->fresh(), $previousStatus, $newStatus);

        return response()->json([
            'message' => 'Status berhasil diperbarui.',
            'status' => $newStatus,
            'donation' => $donation->fresh()
        ]);
    }


}
