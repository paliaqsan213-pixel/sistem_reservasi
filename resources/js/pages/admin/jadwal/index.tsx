import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Calendar, Clock, Trash2, Plus, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Lapangan {
    id: number;
    nama_lapangan: string;
}

interface Jadwal {
    id: number;
    lapangan_id: number;
    tanggal: string;
    slot_mulai: string;
    slot_selesai: string;
    jam_mulai: string;
    jam_selesai: string;
    durasi_menit: number;
    status: 'tersedia' | 'dipesan' | 'tidak_tersedia';
}

interface Props {
    lapangans: Lapangan[];
    jadwals: Jadwal[];
    filters: {
        lapangan_id: number | null;
        tanggal: string;
    };
    errors: Record<string, string>;
}

export default function Index({ lapangans, jadwals, filters, errors }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        lapangan_id: filters.lapangan_id || (lapangans[0]?.id || ''),
        tanggal: filters.tanggal,
        slot_mulai: '',
        slot_selesai: '',
    });

    const handleFilterChange = (lapanganId: any, tanggal: string) => {
        router.get('/admin/jadwal', {
            lapangan_id: lapanganId,
            tanggal: tanggal,
        }, {
            preserveState: true,
        });
    };

    const handleAddSlot = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/jadwal', {
            onSuccess: () => {
                reset('slot_mulai', 'slot_selesai');
            },
        });
    };

    const handleDeleteSlot = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus slot jadwal ini?')) {
            router.delete(`/admin/jadwal/${id}`);
        }
    };

    return (
        <>
            <Head title="Kelola Slot Jadwal" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Kelola Slot Jadwal</h1>
                    <p className="text-sm text-neutral-500">Kelola ketersediaan waktu dan slot operasional per lapangan.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Filter and Create form */}
                    <div className="space-y-6">
                        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-bold">Filter Jadwal</CardTitle>
                                <CardDescription>Pilih lapangan dan tanggal untuk mengelola slot.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="filter_lapangan">Lapangan</Label>
                                    <select
                                        id="filter_lapangan"
                                        value={data.lapangan_id}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('lapangan_id', val);
                                            handleFilterChange(val, data.tanggal);
                                        }}
                                        className="flex h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-800"
                                    >
                                        {lapangans.map((l) => (
                                            <option key={l.id} value={l.id} className="text-neutral-900">{l.nama_lapangan}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="filter_tanggal">Tanggal</Label>
                                    <Input
                                        id="filter_tanggal"
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('tanggal', val);
                                            handleFilterChange(data.lapangan_id, val);
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-bold">Tambah Slot Waktu</CardTitle>
                                <CardDescription>Masukkan rentang waktu operasional. Sistem akan otomatis membuat slot per-jam.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddSlot} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="slot_mulai">Jam Mulai</Label>
                                        <Input
                                            id="slot_mulai"
                                            type="time"
                                            step="3600"
                                            value={data.slot_mulai}
                                            onChange={(e) => setData('slot_mulai', e.target.value)}
                                            required
                                        />
                                        {errors.slot_mulai && <span className="text-xs text-red-500">{errors.slot_mulai}</span>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="slot_selesai">Jam Selesai</Label>
                                        <Input
                                            id="slot_selesai"
                                            type="time"
                                            step="3600"
                                            value={data.slot_selesai}
                                            onChange={(e) => setData('slot_selesai', e.target.value)}
                                            required
                                        />
                                        {errors.slot_selesai && <span className="text-xs text-red-500">{errors.slot_selesai}</span>}
                                    </div>

                                    {errors.error && (
                                        <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 flex gap-2 text-xs text-red-600 dark:text-red-400">
                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                            <span>{errors.error}</span>
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full bg-orange-650 hover:bg-orange-700 text-white font-medium gap-2" disabled={processing}>
                                        <Plus className="h-4 w-4" />
                                        Tambah Slot
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Slot listings */}
                    <div className="lg:col-span-2">
                        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-lg font-bold">Daftar Slot Waktu</CardTitle>
                                    <CardDescription>
                                        Menampilkan jadwal tanggal: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{new Date(data.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </CardDescription>
                                </div>
                                <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                    {jadwals.length} Slot
                                </span>
                            </CardHeader>
                            <CardContent>
                                <div className="relative overflow-x-auto rounded-lg border border-neutral-100 dark:border-neutral-900">
                                    <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
                                        <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">Waktu Mulai</th>
                                                <th scope="col" className="px-6 py-3">Waktu Selesai</th>
                                                <th scope="col" className="px-6 py-3">Durasi</th>
                                                <th scope="col" className="px-6 py-3">Status</th>
                                                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                                            {jadwals.map((j) => (
                                                <tr key={j.id} className="bg-white dark:bg-neutral-950 hover:bg-neutral-50/50">
                                                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                                        {j.jam_mulai}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                                                        {j.jam_selesai}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {j.durasi_menit / 60} jam
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                                                            j.status === 'tersedia'
                                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                                                                : j.status === 'dipesan'
                                                                ? 'bg-red-50 text-red-750 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                                                                : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-950/20 dark:text-neutral-400'
                                                        }`}>
                                                            {j.status === 'tersedia' ? 'Tersedia' : j.status === 'dipesan' ? 'Dipesan' : 'Tidak Tersedia'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={j.status !== 'tersedia'}
                                                            onClick={() => handleDeleteSlot(j.id)}
                                                            className="text-neutral-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-30"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {jadwals.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center p-12 text-neutral-400">
                                                        <Info className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                                                        <p className="font-medium text-neutral-500">Belum ada slot waktu terjadwal</p>
                                                        <p className="text-xs mt-1">Buat slot jadwal baru menggunakan formulir di sebelah kiri.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
