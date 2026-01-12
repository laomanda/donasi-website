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
            'donor_phone'  => ['nullable', 'string', 'max:30'],
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
                // Midtrans dianggap langsung lunas sesuai kebutuhan management UI.
                'status'                => 'paid',
                'paid_at'               => now(),
                'notes'                 => $data['notes'] ?? null,
                'midtrans_order_id'     => $orderId,
            ]);

            if ($programId) {
                Program::whereKey($programId)->increment('collected_amount', $created->amount);
            }

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
                'finish'   => $finishUrl,
                'pending'  => $finishUrl,
                'error'    => $finishUrl,
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
}
