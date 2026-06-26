<?php

namespace App\Services;

use App\Models\Jadwal;
use App\Models\Reservasi;
use Illuminate\Support\Str;

class GreedySchedulingService
{
    /**
     * Get the optimal non-overlapping slots using Earliest Finish Time First (EFTF).
     *
     * @param array $slots Array of slot objects/arrays
     * @return array Selected optimal slots
     */
    public function getOptimalSlots(array $slots): array
    {
        if (empty($slots)) {
            return [];
        }

        // Normalize slot elements to objects
        $normalized = [];
        foreach ($slots as $slot) {
            if (is_array($slot)) {
                $normalized[] = (object) $slot;
            } elseif (is_object($slot)) {
                $normalized[] = $slot;
            }
        }

        // Sort ascending based on slot_selesai (EFTF)
        usort($normalized, function ($a, $b) {
            return strcmp($a->slot_selesai, $b->slot_selesai);
        });

        $selected = [];
        $selected[] = $normalized[0];
        $finishTime = $normalized[0]->slot_selesai;

        for ($i = 1; $i < count($normalized); $i++) {
            $slot = $normalized[$i];
            // If slot_mulai >= finish_time, no conflict, pick it
            if (strcmp($slot->slot_mulai, $finishTime) >= 0) {
                $selected[] = $slot;
                $finishTime = $slot->slot_selesai;
            }
        }

        return $selected;
    }

    /**
     * Get available slots with 'optimal' flag based on durasi.
     */
    public function getAvailableRecommendations(int $lapanganId, string $tanggal, int $durasiJam): array
    {
        $slots = Jadwal::where('lapangan_id', $lapanganId)
            ->where('tanggal', $tanggal)
            ->where('status', 'tersedia')
            ->where('durasi_menit', $durasiJam * 60)
            ->orderBy('slot_mulai')
            ->get();

        if ($slots->isEmpty()) {
            return [];
        }

        $optimalSlots = $this->getOptimalSlots($slots->toArray());
        $optimalIds = array_column($optimalSlots, 'id');

        $result = [];
        foreach ($slots as $slot) {
            $slotArray = $slot->toArray();
            $slotArray['optimal'] = in_array($slot->id, $optimalIds);
            $result[] = (object) $slotArray;
        }

        return $result;
    }

    /**
     * Detect if a schedule slot conflicts with any existing active reservation.
     */
    public function detectConflict(int $jadwalId): bool
    {
        return Reservasi::where('jadwal_id', $jadwalId)
            ->whereIn('status', ['pending', 'menunggu_verifikasi', 'dikonfirmasi'])
            ->exists();
    }

    /**
     * Get a fallback slot if the chosen one is already booked.
     */
    public function getFallbackSlot(int $lapanganId, string $tanggal, string $slotMulai): ?object
    {
        $targetTime = strtotime($slotMulai);

        // Find duration from the requested slot (even if it is now booked/inactive)
        $requestedSlot = Jadwal::where('lapangan_id', $lapanganId)
            ->where('tanggal', $tanggal)
            ->where('slot_mulai', $slotMulai)
            ->first();

        $durasiMenit = $requestedSlot ? $requestedSlot->durasi_menit : 60;

        // Get available slots of same duration
        $availableSlots = Jadwal::where('lapangan_id', $lapanganId)
            ->where('tanggal', $tanggal)
            ->where('status', 'tersedia')
            ->where('durasi_menit', $durasiMenit)
            ->get();

        if ($availableSlots->isEmpty()) {
            return null;
        }

        // Run greedy
        $optimalSlots = $this->getOptimalSlots($availableSlots->toArray());

        if (empty($optimalSlots)) {
            return null;
        }

        // Find closest
        $closestSlot = null;
        $minDiff = null;

        foreach ($optimalSlots as $slot) {
            $diff = abs(strtotime($slot->slot_mulai) - $targetTime);
            if ($minDiff === null || $diff < $minDiff) {
                $minDiff = $diff;
                $closestSlot = $slot;
            }
        }

        return $closestSlot;
    }
}
