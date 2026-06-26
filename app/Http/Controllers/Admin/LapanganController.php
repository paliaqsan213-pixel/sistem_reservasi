<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lapangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LapanganController extends Controller
{
    public function index(): Response
    {
        $lapangans = Lapangan::all();
        return Inertia::render('admin/lapangan/index', [
            'lapangans' => $lapangans,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_lapangan' => ['required', 'string', 'max:255', 'unique:lapangans,nama_lapangan'],
            'harga_per_jam' => ['required', 'numeric', 'min:0'],
            'deskripsi' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'max:2048'],
            'status_aktif' => ['required', 'in:aktif,tidak_aktif'],
        ]);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('lapangan', 'public');
            $data['foto'] = '/storage/' . $path;
        }

        Lapangan::create($data);

        return redirect()->route('admin.lapangan.index')->with('success', 'Lapangan berhasil ditambahkan.');
    }

    public function update(Request $request, Lapangan $lapangan)
    {
        $data = $request->validate([
            'nama_lapangan' => ['required', 'string', 'max:255', 'unique:lapangans,nama_lapangan,' . $lapangan->id],
            'harga_per_jam' => ['required', 'numeric', 'min:0'],
            'deskripsi' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'max:2048'],
            'status_aktif' => ['required', 'in:aktif,tidak_aktif'],
        ]);

        if ($request->hasFile('foto')) {
            // Delete old file if exists
            if ($lapangan->foto && str_starts_with($lapangan->foto, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $lapangan->foto);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('foto')->store('lapangan', 'public');
            $data['foto'] = '/storage/' . $path;
        }

        $lapangan->update($data);

        return redirect()->route('admin.lapangan.index')->with('success', 'Lapangan berhasil diperbarui.');
    }

    public function destroy(Lapangan $lapangan)
    {
        // Soft delete: change status_aktif to tidak_aktif
        $lapangan->update(['status_aktif' => 'tidak_aktif']);

        return redirect()->route('admin.lapangan.index')->with('success', 'Lapangan berhasil dinonaktifkan.');
    }
}
