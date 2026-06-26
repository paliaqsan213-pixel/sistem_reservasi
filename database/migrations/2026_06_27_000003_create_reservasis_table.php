<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lapangan_id')->constrained('lapangans')->onDelete('cascade');
            $table->foreignId('jadwal_id')->constrained('jadwals')->onDelete('cascade');
            $table->date('tanggal_reservasi');
            $table->time('waktu_mulai');
            $table->time('waktu_selesai');
            $table->decimal('total_harga', 10, 2);
            $table->enum('status', ['pending', 'menunggu_verifikasi', 'dikonfirmasi', 'ditolak'])->default('pending');
            $table->string('kode_booking')->unique();
            $table->text('catatan_admin')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('jadwal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservasis');
    }
};
