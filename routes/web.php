<?php

use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\Pelanggan\ReservasiController;
use App\Http\Controllers\Pelanggan\RiwayatController;
use App\Http\Controllers\Pelanggan\JadwalController as PelangganJadwalController;
use App\Http\Controllers\Admin\LapanganController as AdminLapanganController;
use App\Http\Controllers\Admin\JadwalController as AdminJadwalController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MonitoringController as AdminMonitoringController;
use App\Http\Controllers\Admin\VerifikasiController as AdminVerifikasiController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Admin Login Routes (Guest only)
Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AdminLoginController::class, 'show'])->name('admin.login');
    Route::post('/admin/login', [AdminLoginController::class, 'store'])->name('admin.login.store');
});

// Auth & Verified Shared Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        if (request()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return Inertia\Inertia::render('dashboard');
    })->name('dashboard');
});

// Pelanggan Routes (Customer)
Route::middleware(['auth', 'verified', 'pelanggan'])->group(function () {
    Route::get('/reservasi', [ReservasiController::class, 'step1'])->name('reservasi.step1');
    Route::post('/reservasi/pilih-lapangan', [ReservasiController::class, 'pilihLapangan'])->name('reservasi.pilih-lapangan');
    Route::get('/reservasi/pilih-waktu', [ReservasiController::class, 'step2'])->name('reservasi.step2');
    Route::post('/reservasi/pilih-waktu', [ReservasiController::class, 'pilihWaktu'])->name('reservasi.pilih-waktu');
    Route::get('/reservasi/konfirmasi', [ReservasiController::class, 'step3'])->name('reservasi.step3');
    Route::post('/reservasi/konfirmasi', [ReservasiController::class, 'store'])->name('reservasi.store');

    Route::get('/reservasi/{id}/upload-bukti', [RiwayatController::class, 'showUploadBukti'])->name('reservasi.upload-bukti');
    Route::post('/reservasi/{id}/upload-bukti', [RiwayatController::class, 'uploadBukti'])->name('reservasi.upload-bukti.store');

    Route::get('/riwayat', [RiwayatController::class, 'index'])->name('riwayat.index');
    Route::get('/riwayat/{id}', [RiwayatController::class, 'show'])->name('riwayat.show');

    Route::get('/jadwal', [PelangganJadwalController::class, 'index'])->name('jadwal.index');

    Route::get('/api/greedy-slots', [ReservasiController::class, 'apiGreedySlots'])->name('api.greedy-slots');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    Route::resource('/admin/lapangan', AdminLapanganController::class)->names('admin.lapangan');

    Route::get('/admin/jadwal', [AdminJadwalController::class, 'index'])->name('admin.jadwal.index');
    Route::post('/admin/jadwal', [AdminJadwalController::class, 'store'])->name('admin.jadwal.store');
    Route::delete('/admin/jadwal/{id}', [AdminJadwalController::class, 'destroy'])->name('admin.jadwal.destroy');

    Route::get('/admin/monitoring', [AdminMonitoringController::class, 'index'])->name('admin.monitoring.index');
    Route::get('/admin/reservasi/{id}', [AdminMonitoringController::class, 'show'])->name('admin.reservasi.show');

    Route::get('/admin/verifikasi', [AdminVerifikasiController::class, 'index'])->name('admin.verifikasi.index');
    Route::post('/admin/verifikasi/{id}/konfirmasi', [AdminVerifikasiController::class, 'konfirmasi'])->name('admin.verifikasi.konfirmasi');
    Route::post('/admin/verifikasi/{id}/tolak', [AdminVerifikasiController::class, 'tolak'])->name('admin.verifikasi.tolak');
});

require __DIR__.'/settings.php';
