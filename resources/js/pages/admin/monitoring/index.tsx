import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye } from 'lucide-react';
import { useState } from 'react';

export default function MonitoringIndex({ reservasis, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'semua');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'semua' && key === 'status') delete newFilters.status;
        if (!newFilters.search) delete newFilters.search;

        router.get('/admin/monitoring', newFilters, { preserveState: true });
    };

    const getStatusBadge = (s: string) => {
        switch(s) {
            case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Pending / Blm Bayar</Badge>;
            case 'menunggu_verifikasi': return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Verifikasi Menunggu</Badge>;
            case 'dikonfirmasi': return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Dikonfirmasi</Badge>;
            case 'ditolak': return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">Ditolak</Badge>;
            default: return <Badge variant="outline">{s}</Badge>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
            <Head title="Monitoring Reservasi" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Monitoring Reservasi</h2>
                    <p className="text-neutral-500">Pantau semua transaksi dan status reservasi masuk.</p>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="bg-neutral-50/80 border-b pb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                            <Input 
                                placeholder="Cari kode booking, nama, email..." 
                                className="pl-9 bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter('search', search)}
                            />
                        </div>
                        <Select value={status} onValueChange={(val) => { setStatus(val); handleFilter('status', val); }}>
                            <SelectTrigger className="w-[200px] bg-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="menunggu_verifikasi">Menunggu Verifikasi</SelectItem>
                                <SelectItem value="dikonfirmasi">Dikonfirmasi</SelectItem>
                                <SelectItem value="ditolak">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Booking & Pelanggan</th>
                                    <th className="px-6 py-4">Lapangan & Waktu</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservasis.data.map((r: any) => (
                                    <tr key={r.id} className="bg-white border-b hover:bg-neutral-50">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-orange-600 text-xs mb-1">{r.kode_booking}</div>
                                            <div className="font-semibold">{r.user.name}</div>
                                            <div className="text-xs text-neutral-500">{r.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold">{r.lapangan.nama_lapangan}</div>
                                            <div className="text-xs text-neutral-500">{r.tanggal_reservasi}</div>
                                            <div className="text-xs text-neutral-600 font-medium bg-neutral-100 inline-block px-1 rounded mt-1">
                                                {r.waktu_mulai.substring(0,5)} - {r.waktu_selesai.substring(0,5)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-neutral-800">
                                            Rp {r.total_harga.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(r.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" asChild>
                                                <Link href={`/admin/reservasi/${r.id}`}>
                                                    <Eye className="h-4 w-4 mr-1" /> Lihat
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {reservasis.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                            Tidak ada data reservasi ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
