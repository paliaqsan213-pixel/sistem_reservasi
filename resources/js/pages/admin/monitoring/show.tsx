import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Clock, Map, User, CreditCard, AlertCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function MonitoringShow({ reservasi }: any) {
    const { post, processing, data, setData } = useForm({
        catatan_admin: '',
    });
    
    const [showTolak, setShowTolak] = useState(false);

    const getStatusBadge = (s: string) => {
        switch(s) {
            case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Pending</Badge>;
            case 'menunggu_verifikasi': return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Menunggu Verifikasi</Badge>;
            case 'dikonfirmasi': return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Dikonfirmasi</Badge>;
            case 'ditolak': return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">Ditolak</Badge>;
            default: return <Badge variant="outline">{s}</Badge>;
        }
    };

    const handleKonfirmasi = () => {
        if(confirm('Apakah Anda yakin ingin mengkonfirmasi pembayaran ini?')) {
            post(`/admin/verifikasi/${reservasi.id}/konfirmasi`);
        }
    };

    const handleTolak = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/verifikasi/${reservasi.id}/tolak`);
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6">
            <Head title={`Detail Reservasi - ${reservasi.kode_booking}`} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/monitoring">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            Detail Reservasi
                            {getStatusBadge(reservasi.status)}
                        </h2>
                        <p className="text-neutral-500 font-mono mt-1">{reservasi.kode_booking}</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="bg-neutral-50 border-b pb-4">
                            <CardTitle className="text-lg text-neutral-800 flex items-center">
                                <User className="mr-2 h-5 w-5 text-orange-500" /> Informasi Pelanggan & Jadwal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-neutral-500">Nama Pelanggan</p>
                                        <p className="font-semibold">{reservasi.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500">Email</p>
                                        <p className="font-semibold">{reservasi.user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-neutral-500 flex items-center"><Map className="mr-1 h-3 w-3" /> Lapangan</p>
                                        <p className="font-bold text-orange-700">{reservasi.lapangan.nama_lapangan}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                        <div>
                                            <p className="text-xs text-orange-600/70 font-semibold uppercase">Tanggal</p>
                                            <p className="font-bold text-orange-900 text-sm mt-0.5">{reservasi.tanggal_reservasi}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-orange-600/70 font-semibold uppercase">Waktu Main</p>
                                            <p className="font-bold text-orange-900 text-sm mt-0.5">{reservasi.waktu_mulai.substring(0,5)} - {reservasi.waktu_selesai.substring(0,5)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {reservasi.status === 'menunggu_verifikasi' && (
                        <Card className="border-orange-200 shadow-md">
                            <CardHeader className="bg-orange-50 border-b border-orange-100 pb-4">
                                <CardTitle className="text-lg text-orange-800 flex items-center">
                                    <AlertCircle className="mr-2 h-5 w-5" /> Tindakan Verifikasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {!showTolak ? (
                                    <div className="flex gap-4">
                                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleKonfirmasi} disabled={processing}>
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Konfirmasi Pembayaran Valid
                                        </Button>
                                        <Button variant="destructive" className="flex-1" onClick={() => setShowTolak(true)} disabled={processing}>
                                            <XCircle className="mr-2 h-4 w-4" /> Tolak Pembayaran
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleTolak} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="catatan_admin" className="text-red-700 font-semibold">Alasan Penolakan</Label>
                                            <Textarea 
                                                id="catatan_admin" 
                                                placeholder="Contoh: Bukti transfer buram atau nominal tidak sesuai..." 
                                                className="border-red-200 focus-visible:ring-red-500"
                                                required
                                                value={data.catatan_admin}
                                                onChange={e => setData('catatan_admin', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button type="button" variant="outline" onClick={() => setShowTolak(false)} disabled={processing}>
                                                Batal
                                            </Button>
                                            <Button type="submit" variant="destructive" disabled={processing || !data.catatan_admin}>
                                                Konfirmasi Tolak
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {reservasi.catatan_admin && (
                        <Card className="border-red-200 bg-red-50/50">
                            <CardContent className="pt-6">
                                <h4 className="font-semibold text-red-800 flex items-center mb-2"><AlertCircle className="h-4 w-4 mr-2" /> Catatan Admin</h4>
                                <p className="text-sm text-red-900">{reservasi.catatan_admin}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="bg-neutral-50 border-b pb-4">
                            <CardTitle className="text-lg flex items-center">
                                <CreditCard className="mr-2 h-5 w-5 text-neutral-500" /> Bukti Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b">
                                <span className="text-neutral-500">Total Harga</span>
                                <span className="text-xl font-bold text-green-600">Rp {reservasi.total_harga.toLocaleString('id-ID')}</span>
                            </div>

                            {reservasi.pembayaran ? (
                                <div>
                                    <p className="text-xs text-neutral-500 mb-2 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" /> Diupload: {new Date(reservasi.pembayaran.tanggal_upload).toLocaleString('id-ID')}
                                    </p>
                                    <a href={`/storage/${reservasi.pembayaran.bukti_transfer}`} target="_blank" rel="noreferrer" className="block w-full border rounded-lg overflow-hidden group relative">
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm font-medium border border-white/40 px-3 py-1.5 rounded bg-black/40 backdrop-blur-sm">Lihat Penuh</span>
                                        </div>
                                        <img 
                                            src={`/storage/${reservasi.pembayaran.bukti_transfer}`} 
                                            alt="Bukti Transfer" 
                                            className="w-full object-cover"
                                            style={{ maxHeight: '300px' }}
                                        />
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center p-8 border-2 border-dashed rounded-lg bg-neutral-50">
                                    <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                                    <p className="text-sm text-neutral-500">Pelanggan belum mengupload bukti pembayaran.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
