<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Lapangan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $lapangans = Lapangan::where('status_aktif', 'aktif')->get();
        
        $selectedLapanganId = $request->lapangan_id;
        $tanggal = $request->tanggal ?? now()->toDateString();
        
        $jadwals = [];
        $selectedLapangan = null;

        if ($selectedLapanganId) {
            $selectedLapangan = Lapangan::find($selectedLapanganId);
            if ($selectedLapangan) {
                $jadwals = Jadwal::where('lapangan_id', $selectedLapanganId)
                    ->whereDate('tanggal', $tanggal)
                    ->orderBy('slot_mulai')
                    ->get()
                    ->map(function ($jadwal) {
                        return [
                            'id' => $jadwal->id,
                            'jam_mulai' => $jadwal->slot_mulai ? $jadwal->slot_mulai->format('H:i') : null,
                            'jam_selesai' => $jadwal->slot_selesai ? $jadwal->slot_selesai->format('H:i') : null,
                            'status' => $jadwal->status,
                            'durasi_label' => $jadwal->durasi_label,
                        ];
                    });
            }
        }

        return Inertia::render('jadwal/index', [
            'lapangans' => $lapangans,
            'jadwals' => $jadwals,
            'filters' => [
                'lapangan_id' => $selectedLapanganId,
                'tanggal' => $tanggal,
            ],
            'selectedLapangan' => $selectedLapangan
        ]);
    }
}
