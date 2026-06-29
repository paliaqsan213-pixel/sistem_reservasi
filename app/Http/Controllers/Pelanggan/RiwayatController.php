<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Reservasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class RiwayatController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservasi::with(['lapangan'])
            ->where('user_id', $request->user()->id)
            ->latest('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_booking', 'like', "%{$search}%")
                  ->orWhereHas('lapangan', function ($q2) use ($search) {
                      $q2->where('nama_lapangan', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        $reservasis = $query->paginate(10)->withQueryString();

        return Inertia::render('riwayat/index', [
            'reservasis' => $reservasis,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function show(Request $request, $id)
    {
        $reservasi = Reservasi::with(['lapangan', 'jadwal', 'pembayaran'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return Inertia::render('riwayat/show', [
            'reservasi' => $reservasi
        ]);
    }

    public function showUploadBukti(Request $request, $id)
    {
        $reservasi = Reservasi::with(['lapangan'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->findOrFail($id);

        return Inertia::render('reservasi/upload-bukti', [
            'reservasi' => $reservasi
        ]);
    }

    public function uploadBukti(Request $request, $id)
    {
        $reservasi = Reservasi::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->findOrFail($id);

        $request->validate([
            'bukti_pembayaran' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $file = $request->file('bukti_pembayaran');
        
        $year = date('Y');
        $month = date('m');
        $path = $file->storeAs(
            "bukti_pembayaran/{$year}/{$month}",
            $reservasi->kode_booking . '_' . time() . '.' . $file->extension(),
            'public'
        );

        Pembayaran::create([
            'reservasi_id' => $reservasi->id,
            'bukti_transfer' => $path,
            'tanggal_upload' => now(),
            'status' => 'menunggu'
        ]);

        $reservasi->update(['status' => 'menunggu_verifikasi']);

        return redirect()->route('riwayat.index')
            ->with('success', 'Bukti pembayaran berhasil diupload. Silakan tunggu verifikasi dari Admin.');
    }
}
