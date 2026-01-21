<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminBadgeCountsUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public int $userId;
    public int $pickupCount;
    public int $consultationCount;

    public function __construct(int $userId, int $pickupCount, int $consultationCount)
    {
        $this->userId = $userId;
        $this->pickupCount = $pickupCount;
        $this->consultationCount = $consultationCount;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("admin-badges.{$this->userId}")];
    }

    public function broadcastAs(): string
    {
        return 'admin.badges';
    }

    public function broadcastWith(): array
    {
        return [
            'pickup_count' => $this->pickupCount,
            'consultation_count' => $this->consultationCount,
        ];
    }
}
