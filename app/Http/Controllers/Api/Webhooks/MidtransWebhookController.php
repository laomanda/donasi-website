<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;

class MidtransWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->all();

        $this->validateSignature($data);

        $donation = Donation::where('midtrans_order_id', $data['order_id'] ?? null)->first();

        if (! $donation) {
            return response()->json(['message' => 'Donation not found.'], 404);
        }

        $previousStatus = $donation->status;
        $newStatus = $this->mapStatus($data['transaction_status'] ?? '');

        $donation->update([
            'status'                  => $newStatus,
            'paid_at'                 => $newStatus === 'paid' ? now() : $donation->paid_at,
            'midtrans_transaction_id' => $data['transaction_id'] ?? $donation->midtrans_transaction_id,
            'midtrans_va_numbers'     => $data['va_numbers'] ?? $donation->midtrans_va_numbers,
            'midtrans_raw_response'   => $data,
        ]);

        $this->syncProgramAmount($donation->fresh(), $previousStatus, $newStatus);

        return response()->json(['message' => 'ok']);
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
            $program->increment('collected_amount', $donation->amount);
        } elseif ($oldStatus === 'paid' && $newStatus !== 'paid') {
            $program->decrement('collected_amount', $donation->amount);
        }
    }

    private function mapStatus(string $status): string
    {
        return match ($status) {
            'capture', 'settlement', 'pending' => 'paid',
            'deny', 'cancel'                  => 'failed',
            'expire'                          => 'expired',
            default                           => 'paid',
        };
    }

    private function validateSignature(array $data): void
    {
        if (config('midtrans.skip_signature') || app()->environment('local')) {
            return;
        }

        $serverKey = config('midtrans.server_key');
        $expectedSignature = hash('sha512', ($data['order_id'] ?? '') . ($data['status_code'] ?? '') . ($data['gross_amount'] ?? '') . $serverKey);

        if (! hash_equals($expectedSignature, $data['signature_key'] ?? '')) {
            abort(403, 'Invalid Midtrans signature.');
        }
    }
}
