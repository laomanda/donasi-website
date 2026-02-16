<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;

class MidtransWebhookController extends Controller
{
    public function __invoke(Request $request, \App\Services\MidtransService $midtransService)
    {
        $data = $request->all();
        $orderId = $data['order_id'] ?? null;
        
        \Illuminate\Support\Facades\Log::info('Midtrans Webhook Incoming', ['order_id' => $orderId, 'data' => $data]);

        // 1. Validate Signature
        try {
            if (!$midtransService->validateSignature($data)) {
                 \Illuminate\Support\Facades\Log::warning('Midtrans Webhook: Invalid Signature', ['order_id' => $orderId]);
                 return response()->json(['message' => 'Invalid Signature'], 403);
            }
        } catch (\Exception $e) {
             \Illuminate\Support\Facades\Log::error('Midtrans Webhook: Validation Error', ['error' => $e->getMessage()]);
             return response()->json(['message' => 'Validation Error'], 400);
        }

        // 2. Find Donation
        $donation = Donation::where('midtrans_order_id', $orderId)->first();
        if (!$donation) {
            \Illuminate\Support\Facades\Log::error('Midtrans Webhook: Donation not found', ['order_id' => $orderId]);
            return response()->json(['message' => 'Donation not found'], 404);
        }

        // 3. Idempotency Check
        // If already paid, we generally don't want to revert to pending or fail easily
        if ($donation->status === 'paid') {
             \Illuminate\Support\Facades\Log::info('Midtrans Webhook: Ignored because already paid', ['order_id' => $orderId]);
             return response()->json(['message' => 'Donation already paid']);
        }

        // 4. Map Status
        $transactionStatus = $data['transaction_status'] ?? '';
        $fraudStatus = $data['fraud_status'] ?? null;
        $newStatus = $midtransService->mapTransactionStatus($transactionStatus, $fraudStatus);
        
        $previousStatus = $donation->status;

        // 5. Update Donation
        if ($newStatus !== $previousStatus) {
            \Illuminate\Support\Facades\Log::info("Midtrans Webhook: Updating status", [
                'order_id' => $orderId,
                'old_status' => $previousStatus,
                'new_status' => $newStatus,
                'midtrans_status' => $transactionStatus,
                'fraud_status' => $fraudStatus
            ]);

            $donation->update([
                'status'                  => $newStatus,
                'paid_at'                 => $newStatus === 'paid' ? now() : $donation->paid_at,
                'midtrans_transaction_id' => $data['transaction_id'] ?? $donation->midtrans_transaction_id,
                'midtrans_va_numbers'     => $data['va_numbers'] ?? $donation->midtrans_va_numbers,
                'midtrans_raw_response'   => $data,
            ]);

            // 6. Sync Program Amount
            $this->syncProgramAmount($donation->fresh(), $previousStatus, $newStatus);
        } else {
             \Illuminate\Support\Facades\Log::info("Midtrans Webhook: Status unchanged ($newStatus)", ['order_id' => $orderId]);
        }

        return response()->json(['message' => 'ok']);
    }

    private function syncProgramAmount(Donation $donation, ?string $oldStatus, string $newStatus): void
    {
        if (!$donation->program_id) return;
        
        $program = $donation->program;
        if (!$program) return;

        // Logic: Only add if becoming paid. Remove if formerly paid and now isn't.
        if ($oldStatus !== 'paid' && $newStatus === 'paid') {
            $program->increment('collected_amount', $donation->amount);
        } elseif ($oldStatus === 'paid' && $newStatus !== 'paid') {
             // This case covers refunds or cancellations after settlement (rare but possible)
            $program->decrement('collected_amount', $donation->amount);
        }
    }
}
