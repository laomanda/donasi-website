<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EditorTaskCountUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public int $userId;
    public int $count;

    public function __construct(int $userId, int $count)
    {
        $this->userId = $userId;
        $this->count = $count;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("editor-tasks.{$this->userId}")];
    }

    public function broadcastAs(): string
    {
        return 'tasks.count';
    }

    public function broadcastWith(): array
    {
        return [
            'count' => $this->count,
        ];
    }
}
