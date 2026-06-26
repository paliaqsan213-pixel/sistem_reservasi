<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Lapangan;
use App\Models\Reservasi;
use App\Services\GreedySchedulingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ReservasiController extends Controller
{
    public function step1()
    {
        $lapangans = Lapangan::where('status_aktif', 'aktif')->get();
        return Inertia::render('reservasi/index', [
            'lapangans' => $lapangans
        ]);
    }

    public function pilihLapangan(Request $request)
    {
        $request->validate([
            'lapangan_id' => 'required|exists:lapangans,id',
        ]);

        $request->session()->put('reservasi.lapangan_id', $request->lapangan_id);
        
        return redirect()->route('reservasi.step2');
    }

    public function step2(Request $request)
    {
        $lapangan_id = $request->session()->get('reservasi.lapangan_id');

        if (!$lapangan_id) {
            return redirect()->route('reservasi.step1')->with('error', 'Silakan pilih lapangan terlebih dahulu.');
        }

        $lapangan = Lapangan::findOrFail($lapangan_id);

        return Inertia::render('reservasi/pilih-waktu', [
            'lapangan' => $lapangan
        ]);
    }

    public function apiGreedySlots(Request $request, GreedySchedulingService $schedulingService)
    {
        $request->validate([
            'lapangan_id' => 'required|exists:lapangans,id',
            'tanggal' => 'required|date|after_or_equal:today',
            'durasi' => 'required|integer|min:1|max:3',
        ]);

        $durasi_menit = $request->durasi * 60;
        
        // Get recommendations from greedy algorithm
        $recommendations = $schedulingService->getAvailableRecommendations(
            $request->lapangan_id,
            $request->tanggal,
            $durasi_menit
        );

        // Get all slots for visual grid
        $all_slots = Jadwal::where('lapangan_id', $request->lapangan_id)
            ->where('tanggal', $request->tanggal)
            ->where('durasi_menit', $durasi_menit)
            ->orderBy('slot_mulai')
            ->get();

        $recommended_ids = $recommendations->pluck('id')->toArray();

        $slots_data = $all_slots->map(function($slot) use ($recommended_ids) {
            return [
                'id' => $slot->id,
                'slot_mulai' => $slot->slot_mulai->format('H:i'),
                'slot_selesai' => $slot->slot_selesai->format('H:i'),
                'status' => $slot->status, // tersedia, dipesan, tidak_tersedia
                'is_optimal' => in_array($slot->id, $recommended_ids)
            ];
        });

        return response()->json([
            'slots' => $slots_data,
            'has_optimal' => count($recommended_ids) > 0
        ]);
    }

    public function pilihWaktu(Request $request)
    {
        $request->validate([
            'jadwal_id' => 'required|exists:jadwals,id',
            'tanggal' => 'required|date',
            'durasi' => 'required|integer'
        ]);

        $request->session()->put('reservasi.jadwal_id', $request->jadwal_id);
        $request->session()->put('reservasi.tanggal', $request->tanggal);
        $request->session()->put('reservasi.durasi', $request->durasi);

        return redirect()->route('reservasi.step3');
    }

    public function step3(Request $request)
    {
        $lapangan_id = $request->session()->get('reservasi.lapangan_id');
        $jadwal_id = $request->session()->get('reservasi.jadwal_id');

        if (!$lapangan_id || !$jadwal_id) {
            return redirect()->route('reservasi.step1')->with('error', 'Sesi reservasi tidak lengkap. Silakan ulangi.');
        }

        $lapangan = Lapangan::findOrFail($lapangan_id);
        $jadwal = Jadwal::findOrFail($jadwal_id);
        
        $durasi_jam = $request->session()->get('reservasi.durasi');
        $total_harga = $lapangan->harga_per_jam * $durasi_jam;

        return Inertia::render('reservasi/konfirmasi', [
            'lapangan' => $lapangan,
            'jadwal' => [
                'id' => $jadwal->id,
                'tanggal' => $jadwal->tanggal->format('Y-m-d'),
                'waktu_mulai' => $jadwal->slot_mulai->format('H:i'),
                'waktu_selesai' => $jadwal->slot_selesai->format('H:i'),
            ],
            'durasi_label' => $durasi_jam . ' Jam',
            'total_harga' => $total_harga
        ]);
    }

    public function store(Request $request)
    {
        $lapangan_id = $request->session()->get('reservasi.lapangan_id');
        $jadwal_id = $request->session()->get('reservasi.jadwal_id');
        
        if (!$lapangan_id || !$jadwal_id) {
            return redirect()->route('reservasi.step1')->with('error', 'Sesi reservasi telah berakhir.');
        }

        try {
            DB::beginTransaction();

            // Select for update to prevent double booking race conditions
            $jadwal = Jadwal::where('id', $jadwal_id)->lockForUpdate()->first();

            if (!$jadwal || $jadwal->status !== 'tersedia') {
                DB::rollBack();
                return redirect()->route('reservasi.step2')
                    ->with('error', 'Maaf, jadwal ini baru saja dipesan oleh orang lain. Silakan pilih jadwal lain.');
            }

            $lapangan = Lapangan::findOrFail($lapangan_id);
            $durasi_jam = $request->session()->get('reservasi.durasi');
            $total_harga = $lapangan->harga_per_jam * $durasi_jam;

            // Create Reservasi
            $reservasi = Reservasi::create([
                'user_id' => $request->user()->id,
                'lapangan_id' => $lapangan_id,
                'jadwal_id' => $jadwal_id,
                'kode_booking' => 'RSV-' . strtoupper(Str::random(6)) . '-' . time(),
                'tanggal_reservasi' => now()->toDateString(),
                'waktu_mulai' => $jadwal->slot_mulai,
                'waktu_selesai' => $jadwal->slot_selesai,
                'total_harga' => $total_harga,
                'status' => 'pending'
            ]);

            // Update Jadwal Status
            $jadwal->update(['status' => 'dipesan']);

            DB::commit();

            // Clear session
            $request->session()->forget(['reservasi.lapangan_id', 'reservasi.jadwal_id', 'reservasi.tanggal', 'reservasi.durasi']);

            return redirect()->route('reservasi.upload-bukti', $reservasi->id)
                ->with('success', 'Reservasi berhasil dibuat! Silakan upload bukti pembayaran.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reservasi Error: ' . $e->getMessage());
            return redirect()->route('reservasi.step1')->with('error', 'Terjadi kesalahan sistem.');
        }
    }
}
