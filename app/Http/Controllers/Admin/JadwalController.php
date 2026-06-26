<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Lapangan;
use App\Models\Reservasi;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class JadwalController extends Controller
{
    public function index(Request $request): Response
    {
        $lapangans = Lapangan::aktif()->get();

        $lapanganId = $request->input('lapangan_id', $lapangans->first()?->id);
        $tanggal = $request->input('tanggal', Carbon::today()->toDateString());

        $jadwals = [];
        if ($lapanganId) {
            $jadwals = Jadwal::where('lapangan_id', $lapanganId)
                ->where('tanggal', $tanggal)
                ->orderBy('slot_mulai')
                ->get();
        }

        return Inertia::render('admin/jadwal/index', [
            'lapangans' => $lapangans,
            'filters' => [
                'lapangan_id' => $lapanganId ? (int) $lapanganId : null,
                'tanggal' => $tanggal,
            ],
            'jadwals' => $jadwals,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'lapangan_id' => ['required', 'exists:lapangans,id'],
            'tanggal' => ['required', 'date'],
            'slot_mulai' => ['required', 'string'],
            'slot_selesai' => ['required', 'string'],
        ]);

        $slotMulai = Carbon::parse($data['slot_mulai']);
        $slotSelesai = Carbon::parse($data['slot_selesai']);

        if ($slotSelesai->lte($slotMulai)) {
            return back()->withErrors(['slot_selesai' => 'Waktu selesai harus setelah waktu mulai.']);
        }

        $durasiMenit = $slotMulai->diffInMinutes($slotSelesai);

        // Check overlapping slots on the same court + date
        $overlap = Jadwal::where('lapangan_id', $data['lapangan_id'])
            ->where('tanggal', $data['tanggal'])
            ->where(function ($query) use ($data) {
                $query->where(function ($q) use ($data) {
                    $q->where('slot_mulai', '<', $data['slot_selesai'])
                      ->where('slot_selesai', '>', $data['slot_mulai']);
                });
            })
            ->first();

        if ($overlap) {
            // Check if conflict is with active reservation
            $hasReservation = Reservasi::where('jadwal_id', $overlap->id)
                ->whereIn('status', ['pending', 'menunggu_verifikasi', 'dikonfirmasi'])
                ->exists();

            if ($hasReservation) {
                return back()->withErrors(['slot_mulai' => 'Jadwal bentrok dengan reservasi yang sudah ada.']);
            }

            return back()->withErrors(['slot_mulai' => 'Slot waktu bertumpukan dengan jadwal lain.']);
        }

        Jadwal::create([
            'lapangan_id' => $data['lapangan_id'],
            'tanggal' => $data['tanggal'],
            'slot_mulai' => $data['slot_mulai'],
            'slot_selesai' => $data['slot_selesai'],
            'durasi_menit' => $durasiMenit,
            'status' => 'tersedia',
        ]);

        return back()->with('success', 'Slot jadwal berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        $jadwal = Jadwal::findOrFail($id);

        // Check if there is an active reservation
        $hasReservation = Reservasi::where('jadwal_id', $jadwal->id)
            ->whereIn('status', ['pending', 'menunggu_verifikasi', 'dikonfirmasi'])
            ->exists();

        if ($hasReservation || $jadwal->status !== 'tersedia') {
            return back()->withErrors(['error' => 'Slot jadwal tidak dapat dihapus karena sudah dipesan atau memiliki reservasi aktif.']);
        }

        $jadwal->delete();

        return back()->with('success', 'Slot jadwal berhasil dihapus.');
    }
}
