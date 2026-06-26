<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lapangan_id')->constrained('lapangans')->onDelete('cascade');
            $table->date('tanggal');
            $table->time('slot_mulai');
            $table->time('slot_selesai');
            $table->integer('durasi_menit');
            $table->enum('status', ['tersedia', 'dipesan', 'tidak_tersedia'])->default('tersedia');
            $table->timestamps();

            $table->unique(['lapangan_id', 'tanggal', 'slot_mulai']);
            $table->index(['lapangan_id', 'tanggal', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwals');
    }
};
