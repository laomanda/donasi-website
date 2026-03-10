<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\Program;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class MidtransService
{
    /**
     * Validate the Midtrans signature key.
     *
     * @param array $data
     * @return bool
     */
    public function validateSignature(array $data): bool
    {
        // Always skip if explicitly configured (e.g. strict local testing without keys)
        if (config('midtrans.skip_signature')) {
            return true;
        }

        $serverKey = config('midtrans.server_key');
        $orderId = $data['order_id'] ?? '';
        $statusCode = $data['status_code'] ?? '';
        $grossAmount = $data['gross_amount'] ?? '';
        $incomingSignature = $data['signature_key'] ?? '';

        // SHA512: order_id + status_code + gross_amount + ServerKey
        $input = $orderId . $statusCode . $grossAmount . $serverKey;
        $expectedSignature = hash('sha512', $input);

        return hash_equals($expectedSignature, $incomingSignature);
    }

    /**
     * Map Midtrans transaction status to internal Donation status.
     *
     * @param string $transactionStatus
     * @param string|null $fraudStatus
     * @return string
     */
    public function mapTransactionStatus(string $transactionStatus, ?string $fraudStatus = null): string
    {
        // 1. Capture (Credit Card)
        if ($transactionStatus == 'capture') {
             // For credit card, fraud_status can be 'challenge', 'accept', or null.
             // 'challenge' => pending check
             // 'accept' or null => success
            return ($fraudStatus == 'challenge') ? 'pending' : 'paid';
        }

        // 2. Settlement (Bank Transfer, E-Wallet, etc.)
        if ($transactionStatus == 'settlement') {
            return 'paid';
        }

        // 3. Pending
        if ($transactionStatus == 'pending') {
            return 'pending';
        }

        // 4. Failed / Deny / Cancel
        if (in_array($transactionStatus, ['deny', 'cancel', 'failure'])) {
            return 'failed';
        }

        // 5. Expire
        if ($transactionStatus == 'expire') {
            return 'failed';
        }

        // 6. Refund
        if ($transactionStatus == 'refund') {
            return 'refunded';
        }

        // Default to pending for safety
        return 'pending';
    }

    public function createSnapTransaction(Donation $donation, ?Program $program = null): array
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

    public function setupMidtrans(): void
    {
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = (bool) config('midtrans.is_production', false);
        MidtransConfig::$isSanitized = true;
        MidtransConfig::$is3ds = true;
    }
}
