<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lapangan extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_lapangan',
        'harga_per_jam',
        'deskripsi',
        'foto',
        'status_aktif',
    ];

    public function jadwals()
    {
        return $this->hasMany(Jadwal::class);
    }

    public function reservasis()
    {
        return $this->hasMany(Reservasi::class);
    }

    public function scopeAktif($query)
    {
        return $query->where('status_aktif', 'aktif');
    }
}
