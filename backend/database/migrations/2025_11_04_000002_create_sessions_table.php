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
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('refresh_token', 500);
            $table->string('device_type'); // 'browser', 'mobile', 'desktop'
            $table->string('browser_name', 100)->nullable();
            $table->string('os_name', 100)->nullable();
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->boolean('device_remember')->default(false);
            $table->timestamp('last_accessed_at');
            $table->timestamp('expires_at');
            $table->timestamp('created_at');
            
            // Indexes
            $table->index(['user_id', 'expires_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['ip_address', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
