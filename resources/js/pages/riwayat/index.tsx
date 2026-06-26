import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Upload } from 'lucide-react';
import { useState } from 'react';

export default function RiwayatIndex({ reservasis, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'semua');

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'semua' && key === 'status') delete newFilters.status;
        if (!newFilters.search) delete newFilters.search;

        router.get('/riwayat', newFilters, { preserveState: true });
    };

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
        <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
            <Head title="Riwayat Reservasi" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Riwayat Reservasi</h2>
                    <p className="text-neutral-500">Lihat semua status dan riwayat penyewaan lapangan futsal Anda.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-neutral-50 border-b pb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                            <Input 
                                placeholder="Cari kode booking atau nama lapangan..." 
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter('search', search)}
                            />
                        </div>
                        <Select value={status} onValueChange={(val) => { setStatus(val); handleFilter('status', val); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Status</SelectItem>
                                <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
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
                                    <th className="px-6 py-4">Kode Booking</th>
                                    <th className="px-6 py-4">Lapangan</th>
                                    <th className="px-6 py-4">Waktu Main</th>
                                    <th className="px-6 py-4">Total Bayar</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservasis.data.map((r: any) => (
                                    <tr key={r.id} className="bg-white border-b hover:bg-neutral-50">
                                        <td className="px-6 py-4 font-mono font-medium text-neutral-900">
                                            {r.kode_booking}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {r.lapangan.nama_lapangan}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-neutral-800">{r.tanggal_reservasi}</div>
                                            <div className="text-xs text-neutral-500">{r.waktu_mulai.substring(0,5)} - {r.waktu_selesai.substring(0,5)}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-green-600">
                                            Rp {r.total_harga.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(r.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {r.status === 'pending' && (
                                                <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700" asChild>
                                                    <Link href={`/reservasi/${r.id}/upload-bukti`}>
                                                        <Upload className="h-4 w-4 mr-1" /> Bukti
                                                    </Link>
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/riwayat/${r.id}`}>
                                                    <Eye className="h-4 w-4 mr-1" /> Detail
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}

                                {reservasis.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                                            Tidak ada riwayat reservasi ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination controls can be added here using reservasis.links */}
        </div>
    );
}
