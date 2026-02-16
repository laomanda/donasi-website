<?php

namespace App\Services;

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
            return 'expired';
        }

        // 6. Refund
        if ($transactionStatus == 'refund') {
            return 'refunded';
        }

        // Default to pending for safety
        return 'pending';
    }
}
