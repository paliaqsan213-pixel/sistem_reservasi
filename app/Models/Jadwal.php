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
}
