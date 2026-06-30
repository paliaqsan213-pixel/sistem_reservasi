<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Jadwal extends Model
{
    use HasFactory;

    protected $fillable = [
        'lapangan_id',
        'tanggal',
        'slot_mulai',
        'slot_selesai',
        'durasi_menit',
        'status',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'slot_mulai' => 'datetime',
        'slot_selesai' => 'datetime',
    ];

    protected $appends = ['durasi_label', 'jam_mulai', 'jam_selesai'];

    public function lapangan()
    {
        return $this->belongsTo(Lapangan::class);
    }

    public function reservasi()
    {
        return $this->hasOne(Reservasi::class);
    }

    public function scopeTersedia($query)
    {
        return $query->where('status', 'tersedia');
    }

    public function getDurasiLabelAttribute(): string
    {
        $jam = $this->durasi_menit / 60;
        if ($jam == 1) {
            return '1 jam';
        }
        return $jam . ' jam';
    }

    public function getJamMulaiAttribute(): string
    {
        return $this->slot_mulai ? $this->slot_mulai->format('H:i') : '';
    }

    public function getJamSelesaiAttribute(): string
    {
        return $this->slot_selesai ? $this->slot_selesai->format('H:i') : '';
    }

    public function getStatusAttribute($value)
    {
        if ($value === 'tersedia') {
            $now = now();
            
            // Check if date is strictly in the past
            if ($this->tanggal->isPast() && !$this->tanggal->isToday()) {
                return 'tidak_tersedia';
            }
            
            // Check if date is today and time has passed
            if ($this->tanggal->isToday() && $this->slot_mulai && $this->slot_mulai->format('H:i:s') <= $now->format('H:i:s')) {
                return 'tidak_tersedia';
            }
        }

        return $value;
    }
}
