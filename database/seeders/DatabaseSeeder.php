<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Lapangan;
use App\Models\Jadwal;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@tawangalun.com',
            'password' => Hash::make('password'),
            'phone' => '081234567890',
            'address' => 'Kendari',
            'role' => 'admin',
        ]);

        // 2. Create 3 Futsal fields
        $lapangans = [
            [
                'nama_lapangan' => 'Lapangan Vinyl A',
                'harga_per_jam' => 80000.00,
                'deskripsi' => 'Lapangan futsal dengan lantai vinyl standar nasional, nyaman untuk bermain santai.',
                'status_aktif' => 'aktif',
            ],
            [
                'nama_lapangan' => 'Lapangan Rumput Sintetis B',
                'harga_per_jam' => 100000.00,
                'deskripsi' => 'Lapangan futsal rumput sintetis premium, meminimalkan resiko cedera.',
                'status_aktif' => 'aktif',
            ],
            [
                'nama_lapangan' => 'Lapangan Interlock C',
                'harga_per_jam' => 120000.00,
                'deskripsi' => 'Lapangan interlock profesional kelas turnamen dengan pencahayaan LED terang.',
                'status_aktif' => 'aktif',
            ],
        ];

        $createdLapangans = [];
        foreach ($lapangans as $lapangan) {
            $createdLapangans[] = Lapangan::create($lapangan);
        }

        // 3. Create schedule slots for 7 days into the future (08:00 - 22:00, 1-hour interval)
        for ($i = 0; $i < 7; $i++) {
            $tanggal = Carbon::today()->addDays($i)->toDateString();
            foreach ($createdLapangans as $lapangan) {
                for ($hour = 8; $hour < 22; $hour++) {
                    $slotMulai = sprintf('%02d:00:00', $hour);
                    $slotSelesai = sprintf('%02d:00:00', $hour + 1);

                    Jadwal::create([
                        'lapangan_id' => $lapangan->id,
                        'tanggal' => $tanggal,
                        'slot_mulai' => $slotMulai,
                        'slot_selesai' => $slotSelesai,
                        'durasi_menit' => 60,
                        'status' => 'tersedia',
                    ]);
                }
            }
        }
    }
}
