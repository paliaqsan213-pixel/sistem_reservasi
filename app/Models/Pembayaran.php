<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pembayaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservasi_id',
        'bukti_transfer',
        'tanggal_upload',
        'status',
    ];

    public function reservasi()
    {
        return $this->belongsTo(Reservasi::class);
    }
}
