<?php

namespace App\Console\Commands;

use App\Services\InstagramService;
use Illuminate\Console\Command;

class RefreshInstagramTokenCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'social:refresh-instagram-token';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically refresh Meta Instagram Long-Lived Access Token';

    /**
     * Execute the console command.
     */
    public function handle(InstagramService $instagram): int
    {
        $this->info('Refreshing Instagram Access Token via Meta Graph API...');

        if ($instagram->refreshToken()) {
            $this->info('Successfully refreshed Instagram Access Token and saved to database.');
            return Command::SUCCESS;
        }

        $this->error('Failed to refresh Instagram Access Token. Check logs for details.');
        return Command::FAILURE;
    }
}
