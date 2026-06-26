<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitoringController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Reservasi::with(['user', 'lapangan', 'jadwal', 'pembayaran']);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_booking', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('lapangan', function ($lq) use ($search) {
                      $lq->where('nama_lapangan', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Order and paginate
        $reservasis = $query->orderBy('tanggal_reservasi', 'desc')
            ->orderBy('waktu_mulai', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/monitoring/index', [
            'reservasis' => $reservasis,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function show($id): Response
    {
        $reservasi = Reservasi::with(['user', 'lapangan', 'jadwal', 'pembayaran'])->findOrFail($id);

        return Inertia::render('admin/monitoring/show', [
            'reservasi' => $reservasi,
        ]);
    }
}
