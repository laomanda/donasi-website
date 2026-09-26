<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('financial_notes', function (Blueprint $table) {
            if (Schema::hasColumn('financial_notes', 'period_id')) {
                $table->dropForeign(['period_id']);
                $table->dropColumn('period_id');
            }

            if (!Schema::hasColumn('financial_notes', 'accounting_period_id')) {
                $table->foreignId('accounting_period_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('accounting_periods')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('financial_notes', 'category')) {
                $table->string('category', 50)->default('general_note')->after('title');
            }

            if (!Schema::hasColumn('financial_notes', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('content');
            }

            if (!Schema::hasColumn('financial_notes', 'status')) {
                $table->enum('status', ['draft', 'published'])->default('draft')->after('sort_order');
            }

            if (!Schema::hasColumn('financial_notes', 'created_by')) {
                $table->foreignId('created_by')
                    ->nullable()
                    ->after('status')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            $table->index('accounting_period_id');
            $table->index('category');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_notes', function (Blueprint $table) {
            if (Schema::hasColumn('financial_notes', 'accounting_period_id')) {
                $table->dropForeign(['accounting_period_id']);
                $table->dropColumn('accounting_period_id');
            }
            if (Schema::hasColumn('financial_notes', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }
            $table->dropColumn(['category', 'sort_order', 'status']);

            $table->foreignId('period_id')->constrained('accounting_periods')->cascadeOnDelete();
        });
    }
};
