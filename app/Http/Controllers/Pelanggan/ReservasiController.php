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

    /**
     * API endpoint for fetching available slots using Greedy Scheduling.
     */
    public function apiGreedySlots(Request $request, GreedySchedulingService $schedulingService)
    {
        $request->validate([
            'lapangan_id' => 'required|exists:lapangans,id',
            'tanggal' => 'required|date|after_or_equal:today',
            'durasi' => 'required|integer|min:1|max:5',
        ]);

        $result = $schedulingService->getAvailableSlots(
            $request->lapangan_id,
            $request->tanggal,
            $request->durasi
        );

        return response()->json([
            'slots' => $result['slots'],
            'has_optimal' => count($result['recommended_ids']) > 0,
        ]);
    }

    /**
     * Handle multi-slot selection from pilih-waktu page.
     * Receives an array of jadwal_ids for consecutive slot booking.
     */
    public function pilihWaktu(Request $request)
    {
        $request->validate([
            'jadwal_ids' => 'required|array|min:1',
            'jadwal_ids.*' => 'required|integer|exists:jadwals,id',
            'tanggal' => 'required|date',
        ]);

        $request->session()->put('reservasi.jadwal_ids', $request->jadwal_ids);
        $request->session()->put('reservasi.tanggal', $request->tanggal);

        return redirect()->route('reservasi.step3');
    }

    public function step3(Request $request)
    {
        $lapangan_id = $request->session()->get('reservasi.lapangan_id');
        $jadwal_ids = $request->session()->get('reservasi.jadwal_ids');

        if (!$lapangan_id || !$jadwal_ids || !is_array($jadwal_ids)) {
            return redirect()->route('reservasi.step1')->with('error', 'Sesi reservasi tidak lengkap. Silakan ulangi.');
        }

        $lapangan = Lapangan::findOrFail($lapangan_id);

        // Get the slots in order
        $jadwals = Jadwal::whereIn('id', $jadwal_ids)
            ->orderBy('slot_mulai')
            ->get();

        if ($jadwals->isEmpty()) {
            return redirect()->route('reservasi.step2')->with('error', 'Jadwal tidak ditemukan.');
        }

        $durasi_jam = $jadwals->count();
        $total_harga = $lapangan->harga_per_jam * $durasi_jam;
        $waktu_mulai = $jadwals->first()->slot_mulai->format('H:i');
        $waktu_selesai = $jadwals->last()->slot_selesai->format('H:i');

        return Inertia::render('reservasi/konfirmasi', [
            'lapangan' => $lapangan,
            'jadwal' => [
                'ids' => $jadwal_ids,
                'tanggal' => $jadwals->first()->tanggal->format('Y-m-d'),
                'waktu_mulai' => $waktu_mulai,
                'waktu_selesai' => $waktu_selesai,
            ],
            'durasi_label' => $durasi_jam . ' Jam',
            'total_harga' => $total_harga
        ]);
    }

    public function store(Request $request)
    {
        $lapangan_id = $request->session()->get('reservasi.lapangan_id');
        $jadwal_ids = $request->session()->get('reservasi.jadwal_ids');

        if (!$lapangan_id || !$jadwal_ids || !is_array($jadwal_ids)) {
            return redirect()->route('reservasi.step1')->with('error', 'Sesi reservasi telah berakhir.');
        }

        try {
            DB::beginTransaction();

            // Lock all selected slots to prevent double booking
            $jadwals = Jadwal::whereIn('id', $jadwal_ids)
                ->lockForUpdate()
                ->orderBy('slot_mulai')
                ->get();

            // Verify all slots are still available
            foreach ($jadwals as $jadwal) {
                if ($jadwal->status !== 'tersedia') {
                    DB::rollBack();
                    return redirect()->route('reservasi.step2')
                        ->with('error', 'Maaf, slot ' . $jadwal->slot_mulai->format('H:i') . ' - ' . $jadwal->slot_selesai->format('H:i') . ' baru saja dipesan oleh orang lain. Silakan pilih jadwal lain.');
                }
            }

            $lapangan = Lapangan::findOrFail($lapangan_id);
            $durasi_jam = $jadwals->count();
            $total_harga = $lapangan->harga_per_jam * $durasi_jam;

            $waktu_mulai = $jadwals->first()->slot_mulai;
            $waktu_selesai = $jadwals->last()->slot_selesai;

            // Create Reservasi
            $reservasi = Reservasi::create([
                'user_id' => $request->user()->id,
                'lapangan_id' => $lapangan_id,
                'jadwal_id' => $jadwals->first()->id, // Primary jadwal reference
                'kode_booking' => 'RSV-' . strtoupper(Str::random(6)) . '-' . time(),
                'tanggal_reservasi' => $jadwals->first()->tanggal->toDateString(),
                'waktu_mulai' => $waktu_mulai,
                'waktu_selesai' => $waktu_selesai,
                'total_harga' => $total_harga,
                'status' => 'pending'
            ]);

            // Mark ALL selected slots as booked
            foreach ($jadwals as $jadwal) {
                $jadwal->update(['status' => 'dipesan']);
            }

            DB::commit();

            // Clear session
            $request->session()->forget(['reservasi.lapangan_id', 'reservasi.jadwal_ids', 'reservasi.tanggal']);

            return redirect()->route('reservasi.upload-bukti', $reservasi->id)
                ->with('success', 'Reservasi berhasil dibuat! Silakan upload bukti pembayaran.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reservasi Error: ' . $e->getMessage());
            return redirect()->route('reservasi.step1')->with('error', 'Terjadi kesalahan sistem.');
        }
    }
}
