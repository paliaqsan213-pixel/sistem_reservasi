<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Reservasi extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lapangan_id',
        'jadwal_id',
        'tanggal_reservasi',
        'waktu_mulai',
        'waktu_selesai',
        'total_harga',
        'status',
        'kode_booking',
        'catatan_admin',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lapangan()
    {
        return $this->belongsTo(Lapangan::class);
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class);
    }

    public function pembayaran()
    {
        return $this->hasOne(Pembayaran::class);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($reservasi) {
            // Generate booking code: YYYYMMDD-XXXXXX
            $reservasi->kode_booking = date('Ymd') . '-' . strtoupper(Str::random(6));
        });
    }
}
