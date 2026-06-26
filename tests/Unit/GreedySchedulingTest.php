<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\GreedySchedulingService;
use App\Models\Lapangan;
use App\Models\Jadwal;
use Illuminate\Foundation\Testing\RefreshDatabase;

class GreedySchedulingTest extends TestCase
{
    use RefreshDatabase;

    public function test_eftf_sorting_consistency()
    {
        $service = new GreedySchedulingService();

        $slots = [
            ['id' => 1, 'slot_mulai' => '10:00:00', 'slot_selesai' => '12:00:00'],
            ['id' => 2, 'slot_mulai' => '08:00:00', 'slot_selesai' => '09:00:00'],
            ['id' => 3, 'slot_mulai' => '09:00:00', 'slot_selesai' => '11:00:00'],
        ];

        $optimal = $service->getOptimalSlots($slots);

        $this->assertCount(2, $optimal);
        $this->assertEquals(2, $optimal[0]->id);
        $this->assertEquals(3, $optimal[1]->id);
    }

    public function test_conflict_resolution_proposal_case()
    {
        $service = new GreedySchedulingService();

        $slots = [
            ['id' => 1, 'slot_mulai' => '08:00:00', 'slot_selesai' => '10:00:00'], // R1
            ['id' => 2, 'slot_mulai' => '09:00:00', 'slot_selesai' => '11:00:00'], // R2
            ['id' => 3, 'slot_mulai' => '10:00:00', 'slot_selesai' => '12:00:00'], // R3
            ['id' => 4, 'slot_mulai' => '11:00:00', 'slot_selesai' => '13:00:00'], // R4
            ['id' => 5, 'slot_mulai' => '12:00:00', 'slot_selesai' => '14:00:00'], // R5
        ];

        $optimal = $service->getOptimalSlots($slots);

        $this->assertCount(3, $optimal);
        $this->assertEquals(1, $optimal[0]->id);
        $this->assertEquals(3, $optimal[1]->id);
        $this->assertEquals(5, $optimal[2]->id);
    }

    public function test_fallback_slot()
    {
        $service = new GreedySchedulingService();

        $lapangan = Lapangan::create([
            'nama_lapangan' => 'Test Lapangan',
            'harga_per_jam' => 10000.00,
            'status_aktif' => 'aktif',
        ]);

        $slot1 = Jadwal::create([
            'lapangan_id' => $lapangan->id,
            'tanggal' => '2026-06-27',
            'slot_mulai' => '08:00:00',
            'slot_selesai' => '09:00:00',
            'durasi_menit' => 60,
            'status' => 'dipesan',
        ]);

        $slot2 = Jadwal::create([
            'lapangan_id' => $lapangan->id,
            'tanggal' => '2026-06-27',
            'slot_mulai' => '09:00:00',
            'slot_selesai' => '10:00:00',
            'durasi_menit' => 60,
            'status' => 'tersedia',
        ]);

        $slot3 = Jadwal::create([
            'lapangan_id' => $lapangan->id,
            'tanggal' => '2026-06-27',
            'slot_mulai' => '10:00:00',
            'slot_selesai' => '11:00:00',
            'durasi_menit' => 60,
            'status' => 'tersedia',
        ]);

        $fallback = $service->getFallbackSlot($lapangan->id, '2026-06-27', '08:00:00');

        $this->assertNotNull($fallback);
        $this->assertEquals('09:00:00', $fallback->slot_mulai);
    }
}
