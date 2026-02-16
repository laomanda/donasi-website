<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    /**
     * Send a WhatsApp message to a specific number.
     *
     * @param string $phone
     * @param string $message
     * @param string|null $imageUrl Optional image URL to send
     * @return bool
     */
    public function sendMessage(string $phone, string $message, ?string $imageUrl = null): bool
    {
        // 1. Sanitize Phone Number (Ensure it starts with 62 or country code)
        $phone = $this->sanitizePhone($phone);

        // 2. Log the attempt (Placeholder for actual API call)
        Log::info("WHATSAPP SERVICE: Sending message", [
            'to' => $phone,
            'message' => $message,
            'image' => $imageUrl
        ]);

        // 3. Fonnte Integration (Example)
        $token = env('FONNTE_TOKEN'); // Add this to .env
        
        if ($token) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => $token,
                ])->post('https://api.fonnte.com/send', [
                    'target' => $phone,
                    'message' => $message,
                    'url' => $imageUrl,
                ]);

                Log::info("WHATSAPP SERVICE: Fonnte Response", $response->json());
                
                return $response->successful();
            } catch (\Exception $e) {
                Log::error("WHATSAPP SERVICE: Fonnte Error: " . $e->getMessage());
                return false;
            }
        }

        // Fallback or Simulation mode (if no token)
        Log::info("WHATSAPP SERVICE: Simulated Success (No Token Configured)");
        return true;
    }

    /**
     * Sanitize phone number to standard format (e.g. 62812...)
     */
    private function sanitizePhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        return $phone;
    }
}
