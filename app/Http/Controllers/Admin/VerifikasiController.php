<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservasi;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VerifikasiController extends Controller
{
    public function index(): Response
    {
        $reservasis = Reservasi::with(['user', 'lapangan', 'jadwal', 'pembayaran'])
            ->where('status', 'menunggu_verifikasi')
            ->get();

        return Inertia::render('admin/verifikasi/index', [
            'reservasis' => $reservasis,
        ]);
    }

    public function konfirmasi(Request $request, $id)
    {
        DB::transaction(function () use ($id) {
            $reservasi = Reservasi::findOrFail($id);

            // Update reservasi status
            $reservasi->update(['status' => 'dikonfirmasi']);

            // Update pembayaran status
            if ($reservasi->pembayaran) {
                $reservasi->pembayaran->update(['status' => 'dikonfirmasi']);
            }

            // Lock ALL scheduling slots permanently (dipesan)
            \App\Models\Jadwal::where('lapangan_id', $reservasi->lapangan_id)
                ->where('tanggal', $reservasi->tanggal_reservasi)
                ->where('slot_mulai', '>=', $reservasi->waktu_mulai)
                ->where('slot_selesai', '<=', $reservasi->waktu_selesai)
                ->update(['status' => 'dipesan']);
        });

        return redirect()->route('admin.verifikasi.index')->with('success', 'Pembayaran berhasil dikonfirmasi.');
    }

    public function tolak(Request $request, $id)
    {
        $data = $request->validate([
            'alasan_penolakan' => ['required', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($id, $data) {
            $reservasi = Reservasi::findOrFail($id);

            // Update reservasi status and set admin notes
            $reservasi->update([
                'status' => 'ditolak',
                'catatan_admin' => $data['alasan_penolakan'],
            ]);

            // Update pembayaran status
            if ($reservasi->pembayaran) {
                $reservasi->pembayaran->update(['status' => 'ditolak']);
            }

            // Open ALL scheduling slots again (tersedia)
            \App\Models\Jadwal::where('lapangan_id', $reservasi->lapangan_id)
                ->where('tanggal', $reservasi->tanggal_reservasi)
                ->where('slot_mulai', '>=', $reservasi->waktu_mulai)
                ->where('slot_selesai', '<=', $reservasi->waktu_selesai)
                ->update(['status' => 'tersedia']);
        });

        return redirect()->route('admin.verifikasi.index')->with('success', 'Pembayaran berhasil ditolak.');
    }
}
