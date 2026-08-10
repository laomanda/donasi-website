<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule Instagram feed background sync every 3 hours
Schedule::command('social:sync-instagram-feed')->everyThreeHours();

// Schedule Instagram long-lived access token renewal weekly
Schedule::command('social:refresh-instagram-token')->weekly();

