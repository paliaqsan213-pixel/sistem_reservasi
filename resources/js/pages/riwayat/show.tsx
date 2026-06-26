import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

export default function RiwayatShow({ reservasi }: any) {
    const getStatusBadge = (s: string) => {
        switch(s) {
            case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Menunggu Pembayaran</Badge>;
            case 'menunggu_verifikasi': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Menunggu Verifikasi</Badge>;
            case 'dikonfirmasi': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Dikonfirmasi</Badge>;
            case 'ditolak': return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Ditolak</Badge>;
            default: return <Badge variant="outline">{s}</Badge>;
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Head title={`Detail Reservasi - ${reservasi.kode_booking}`} />

            <div className="mb-6">
                <Button variant="ghost" className="mb-4 -ml-4" asChild>
                    <Link href="/riwayat">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Link>
                </Button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            Detail Reservasi
                            {getStatusBadge(reservasi.status)}
                        </h2>
                        <p className="text-neutral-500 font-mono mt-1">Kode Booking: {reservasi.kode_booking}</p>
                    </div>
                    {reservasi.status === 'pending' && (
                        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href={`/reservasi/${reservasi.id}/upload-bukti`}>
                                Upload Bukti Pembayaran
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {reservasi.status === 'dikonfirmasi' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 flex gap-4 text-green-800">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
                    <div>
                        <h4 className="font-bold mb-1">Reservasi Berhasil Dikonfirmasi!</h4>
                        <p className="text-sm opacity-90">Silakan tunjukkan detail reservasi ini (atau kode booking) kepada petugas lapangan futsal saat Anda datang. Harap tiba 15 menit sebelum waktu main dimulai.</p>
                    </div>
                </div>
            )}

            {reservasi.status === 'ditolak' && reservasi.catatan_admin && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex gap-4 text-red-800">
                    <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
                    <div>
                        <h4 className="font-bold mb-1">Reservasi Ditolak</h4>
                        <p className="text-sm opacity-90">Alasan: {reservasi.catatan_admin}</p>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="bg-neutral-50 border-b pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-neutral-500" />
                            Informasi Jadwal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <p className="text-sm text-neutral-500">Lapangan</p>
                            <p className="font-bold text-lg">{reservasi.lapangan.nama_lapangan}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-neutral-500">Tanggal</p>
                                <p className="font-semibold">{reservasi.tanggal_reservasi}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Waktu</p>
                                <p className="font-semibold">{reservasi.waktu_mulai.substring(0,5)} - {reservasi.waktu_selesai.substring(0,5)} WIB</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-neutral-50 border-b pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-neutral-500" />
                            Informasi Pembayaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-neutral-500">Total Harga</span>
                            <span className="text-xl font-bold text-green-600">Rp {reservasi.total_harga.toLocaleString('id-ID')}</span>
                        </div>
                        
                        {reservasi.pembayaran ? (
                            <div>
                                <p className="text-sm text-neutral-500 mb-2">Bukti Transfer (Diupload: {new Date(reservasi.pembayaran.tanggal_upload).toLocaleString('id-ID')})</p>
                                <div className="border rounded-lg p-2 bg-neutral-50">
                                    <a href={`/storage/${reservasi.pembayaran.bukti_transfer}`} target="_blank" rel="noreferrer" className="block w-full h-40 overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-medium">Klik untuk perbesar</span>
                                        </div>
                                        <img 
                                            src={`/storage/${reservasi.pembayaran.bukti_transfer}`} 
                                            alt="Bukti Transfer" 
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 border border-dashed rounded-lg text-neutral-500 text-sm">
                                Belum ada bukti pembayaran yang diupload.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
