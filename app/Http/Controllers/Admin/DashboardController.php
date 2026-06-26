<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservasi;
use App\Models\User;
use App\Models\Lapangan;
use App\Models\Pembayaran;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // 1. Stats Calculation
        $totalReservasi = Reservasi::count();

        // Trend calculation
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $countThisMonth = Reservasi::where('created_at', '>=', $thisMonth)->count();
        $countLastMonth = Reservasi::where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $thisMonth)
            ->count();

        $trend = 0;
        if ($countLastMonth > 0) {
            $trend = (($countThisMonth - $countLastMonth) / $countLastMonth) * 100;
        } elseif ($countThisMonth > 0) {
            $trend = 100;
        }

        $menungguVerifikasi = Reservasi::where('status', 'menunggu_verifikasi')->count();
        $lapanganAktif = Lapangan::aktif()->count();
        $memberTerdaftar = User::where('role', 'pelanggan')->count();

        // 2. Panel Kanan: Perlu Verifikasi (max 5)
        $perluVerifikasi = Reservasi::with(['user', 'lapangan'])
            ->where('status', 'menunggu_verifikasi')
            ->orderBy('updated_at', 'asc')
            ->limit(5)
            ->get();

        // 3. Panel Kiri: Aktivitas Terbaru (max 10)
        // We compile a dynamic activity log based on recent reservasi actions
        $recentReservasis = Reservasi::with(['user'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $activities = [];
        foreach ($recentReservasis as $res) {
            $timeString = $res->updated_at->diffForHumans();
            $pelanggan = $res->user->name;

            if ($res->status === 'pending') {
                $aksi = "melakukan reservasi baru";
            } elseif ($res->status === 'menunggu_verifikasi') {
                $aksi = "mengunggah bukti pembayaran";
            } elseif ($res->status === 'dikonfirmasi') {
                $aksi = "pembayarannya dikonfirmasi oleh Admin";
            } else {
                $aksi = "pembayarannya ditolak oleh Admin";
            }

            $activities[] = [
                'time' => $timeString,
                'user' => $pelanggan,
                'action' => $aksi,
                'status' => $res->status,
            ];
        }

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_reservasi' => $totalReservasi,
                'trend' => round($trend, 1),
                'menunggu_verifikasi' => $menungguVerifikasi,
                'lapangan_aktif' => $lapanganAktif,
                'member_terdaftar' => $memberTerdaftar,
            ],
            'perlu_verifikasi' => $perluVerifikasi,
            'activities' => $activities,
        ]);
    }
}
