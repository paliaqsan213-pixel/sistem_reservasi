<?php

namespace App\Services;

use App\Models\Jadwal;
use App\Models\Reservasi;
use Illuminate\Support\Collection;

class GreedySchedulingService
{
    /**
     * Get all hourly slots for a given lapangan and date, with greedy recommendation.
     * Greedy algorithm: Earliest Start Time first - recommends the earliest contiguous
     * block of available slots that fits the requested duration.
     *
     * @param int $lapanganId
     * @param string $tanggal
     * @param int $durasiJam Number of hours the customer wants to book
     * @return array
     */
    public function getAvailableSlots(int $lapanganId, string $tanggal, int $durasiJam = 1): array
    {
        // Get ALL slots for this lapangan + date, ordered by start time
        $allSlots = Jadwal::where('lapangan_id', $lapanganId)
            ->where('tanggal', $tanggal)
            ->orderBy('slot_mulai')
            ->get();

        if ($allSlots->isEmpty()) {
            return [
                'slots' => [],
                'recommended_ids' => [],
            ];
        }

        // Find contiguous blocks of available slots using greedy approach
        $recommendedIds = $this->findGreedyRecommendation($allSlots, $durasiJam);

        $slotsData = $allSlots->map(function ($slot) use ($recommendedIds) {
            return [
                'id' => $slot->id,
                'slot_mulai' => $slot->slot_mulai->format('H:i'),
                'slot_selesai' => $slot->slot_selesai->format('H:i'),
                'status' => $slot->status,
                'is_optimal' => in_array($slot->id, $recommendedIds),
            ];
        });

        return [
            'slots' => $slotsData->values()->toArray(),
            'recommended_ids' => $recommendedIds,
        ];
    }

    /**
     * Greedy Algorithm: Earliest Start Time First
     * Find the earliest contiguous block of `$durasiJam` available slots.
     * This is the core greedy scheduling logic.
     *
     * Strategy: Iterate through slots sorted by start time. Find the first
     * sequence of N consecutive available slots where each slot's end time
     * matches the next slot's start time.
     *
     * @param Collection $allSlots All slots sorted by slot_mulai
     * @param int $durasiJam Number of consecutive hours needed
     * @return array IDs of recommended slots
     */
    private function findGreedyRecommendation(Collection $allSlots, int $durasiJam): array
    {
        // Filter only available slots
        $availableSlots = $allSlots->filter(fn($s) => $s->status === 'tersedia')->values();

        if ($availableSlots->count() < $durasiJam) {
            // Not enough available slots for requested duration
            // Return all available slots as recommendation
            return $availableSlots->pluck('id')->toArray();
        }

        // Greedy: Find the earliest contiguous block of $durasiJam slots
        for ($i = 0; $i <= $availableSlots->count() - $durasiJam; $i++) {
            $block = [];
            $isContiguous = true;

            for ($j = 0; $j < $durasiJam; $j++) {
                $block[] = $availableSlots[$i + $j];

                if ($j > 0) {
                    $prevEnd = $availableSlots[$i + $j - 1]->slot_selesai->format('H:i');
                    $currStart = $availableSlots[$i + $j]->slot_mulai->format('H:i');

                    if ($prevEnd !== $currStart) {
                        $isContiguous = false;
                        break;
                    }
                }
            }

            if ($isContiguous) {
                // Found the earliest contiguous block - greedy choice!
                return collect($block)->pluck('id')->toArray();
            }
        }

        // No contiguous block found, recommend the first available slots
        return $availableSlots->take($durasiJam)->pluck('id')->toArray();
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
}
