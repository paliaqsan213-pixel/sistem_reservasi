import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Map } from 'lucide-react';
import { useState } from 'react';

export default function JadwalIndex({ lapangans, jadwals, filters, selectedLapangan }: any) {
    const today = new Date().toISOString().split('T')[0];
    const [lapanganId, setLapanganId] = useState(filters.lapangan_id || '');
    const [tanggal, setTanggal] = useState(filters.tanggal || today);

    const handleFilter = () => {
        router.get('/jadwal', {
            lapangan_id: lapanganId,
            tanggal: tanggal
        }, { preserveState: true });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
            <Head title="Lihat Jadwal Lapangan" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Cek Ketersediaan Jadwal</h2>
                    <p className="text-neutral-500">Lihat jadwal yang kosong sebelum melakukan pemesanan.</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-5 space-y-2">
                            <Label>Pilih Lapangan</Label>
                            <Select value={lapanganId} onValueChange={setLapanganId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Lapangan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lapangans.map((l: any) => (
                                        <SelectItem key={l.id} value={l.id.toString()}>{l.nama_lapangan}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-5 space-y-2">
                            <Label>Tanggal</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                                <Input 
                                    type="date" 
                                    className="pl-9"
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    min={today}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <Button className="w-full bg-neutral-800 hover:bg-neutral-900" onClick={handleFilter}>
                                <Search className="h-4 w-4 mr-2" /> Cari
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!selectedLapangan ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl border-neutral-200">
                    <Map className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-600">Pilih lapangan terlebih dahulu</h3>
                    <p className="text-neutral-400">Silakan pilih lapangan pada form di atas untuk melihat jadwalnya.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                        <div>
                            <h3 className="font-bold text-lg">{selectedLapangan.nama_lapangan}</h3>
                            <p className="text-green-600 font-medium text-sm">Rp {selectedLapangan.harga_per_jam.toLocaleString('id-ID')} / jam</p>
                        </div>
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                            <Link href="/reservasi">Buat Reservasi Sekarang</Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Jadwal Tanggal {tanggal}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {jadwals.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500">
                                    Belum ada jadwal yang dikonfigurasi untuk tanggal ini.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {jadwals.map((jadwal: any) => (
                                        <div 
                                            key={jadwal.id} 
                                            className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
                                                jadwal.status === 'tersedia' 
                                                    ? 'border-green-200 bg-green-50 text-green-700' 
                                                    : jadwal.status === 'dipesan'
                                                        ? 'border-red-200 bg-red-50 text-red-700 opacity-75'
                                                        : 'border-neutral-200 bg-neutral-100 text-neutral-500 opacity-60'
                                            }`}
                                        >
                                            <span className="font-bold text-lg">{jadwal.slot_mulai.substring(0,5)}</span>
                                            <span className="text-xs mt-1 font-medium">
                                                {jadwal.status === 'tersedia' ? 'Tersedia' : 
                                                 jadwal.status === 'dipesan' ? 'Dipesan' : 'Tdk Tersedia'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
