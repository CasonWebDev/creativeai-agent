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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique()->index();
            $table->string('name');
            $table->string('password');
            $table->enum('tier', ['free', 'pro', 'enterprise'])->default('free');
            $table->timestamp('email_confirmed_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('profile_photo_url', 500)->nullable();
            $table->softDeletes()->index();
            $table->timestamps();
            
            // Composite index for active users
            $table->index(['id', 'deleted_at']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
