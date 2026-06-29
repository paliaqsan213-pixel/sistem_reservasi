<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Lapangan;
use Illuminate\Support\Facades\Hash;

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

        foreach ($lapangans as $lapangan) {
            Lapangan::create($lapangan);
        }
    }
}
