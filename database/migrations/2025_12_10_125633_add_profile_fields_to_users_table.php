<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // data profil basic
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('avatar_path')->nullable()->after('phone');

            // status aktif / nonaktif
            $table->boolean('is_active')->default(true)->after('avatar_path');

            // role label (untuk tampilan cepat: superadmin, admin, editor)
            // authority utamanya tetap pakai Spatie role & permission
            $table->string('role_label', 30)->nullable()->after('is_active');

            // track terakhir login (buat laporan & keamanan)
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'avatar_path',
                'is_active',
                'role_label',
                'last_login_at',
            ]);
        });
    }
};
