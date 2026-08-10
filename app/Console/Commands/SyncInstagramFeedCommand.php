<?php

namespace App\Console\Commands;

use App\Services\InstagramService;
use Illuminate\Console\Command;

class SyncInstagramFeedCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'social:sync-instagram-feed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch and cache the latest Instagram feed snapshot in the background';

    /**
     * Execute the console command.
     */
    public function handle(InstagramService $instagram): int
    {
        $this->info('Fetching latest Instagram feed...');
        $items = $instagram->fetchAndSnapshot();

        $count = count($items);
        if ($count > 0) {
            $this->info("Successfully synced {$count} Instagram posts.");
            return Command::SUCCESS;
        }

        $this->warn('Sync finished with 0 posts. Check logs if there was an issue.');
        return Command::FAILURE;
    }
}
