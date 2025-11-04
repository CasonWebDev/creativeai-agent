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
        Schema::create('usage_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('year_month', 7); // YYYY-MM format
            $table->enum('metric_type', ['images', 'videos', 'api_calls']);
            $table->integer('count')->default(0);
            $table->integer('tier_limit');
            $table->timestamp('last_reset_at');
            $table->timestamps();
            
            // Composite unique constraint
            $table->unique(['user_id', 'year_month', 'metric_type']);
            
            // Indexes
            $table->index(['user_id', 'year_month']);
            $table->index('year_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usage_metrics');
    }
};
