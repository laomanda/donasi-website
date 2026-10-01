<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->assertTestDatabaseSafety();
    }

    /**
     * Hard safety guard: fail fast if test environment connects to the development database.
     */
    protected function assertTestDatabaseSafety(): void
    {
        $connection = config('database.default');
        $activeDatabase = config("database.connections.{$connection}.database");
        $devDatabase = env('DB_DATABASE', 'ziswaf_dpf');

        if (app()->environment('testing') && $activeDatabase === $devDatabase && $activeDatabase !== 'ziswaf_dpf_testing') {
            throw new \RuntimeException(
                "TEST ISOLATION DEFECT: Tests are configured to connect to development database [{$activeDatabase}]. " .
                "Testing must use an isolated database (e.g. ziswaf_dpf_testing)."
            );
        }
    }
}
