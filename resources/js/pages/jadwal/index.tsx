import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Map, Clock } from 'lucide-react';
import { useState } from 'react';

interface Props {
    lapangans: Array<{ id: number; nama_lapangan: string; harga_per_jam: number }>;
    jadwals: Array<{
        id: number;
        jam_mulai: string;
        jam_selesai: string;
        status: 'tersedia' | 'dipesan' | 'tidak_tersedia';
        durasi_label: string;
    }>;
    filters: { lapangan_id: string | null; tanggal: string };
    selectedLapangan: { id: number; nama_lapangan: string; harga_per_jam: number } | null;
}

export default function JadwalIndex({ lapangans, jadwals, filters, selectedLapangan }: Props) {
    const today = new Date().toISOString().split('T')[0];
    const [lapanganId, setLapanganId] = useState(filters.lapangan_id || '');
    const [tanggal, setTanggal] = useState(filters.tanggal || today);

    const handleFilter = () => {
        router.get('/jadwal', {
            lapangan_id: lapanganId,
            tanggal: tanggal,
        }, { preserveState: true });
    };

    const tersediaCount = jadwals.filter((j) => j.status === 'tersedia').length;
    const dipesanCount = jadwals.filter((j) => j.status === 'dipesan').length;
    const tidakTersediaCount = jadwals.filter((j) => j.status === 'tidak_tersedia').length;

    const formatTanggal = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <Head title="Lihat Jadwal Lapangan" />

            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTIgMGgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Cek Ketersediaan Jadwal
                        </h1>
                    </div>
                    <p className="text-emerald-100 text-sm sm:text-base max-w-xl ml-[52px]">
                        Lihat jadwal yang tersedia sebelum melakukan pemesanan lapangan olahraga.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 space-y-6">
                {/* Filter Card */}
                <Card className="shadow-lg shadow-black/5 border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6 pb-6">
                        <div className="grid md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-5 space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    <Map className="h-3.5 w-3.5 text-emerald-600" />
                                    Pilih Lapangan
                                </Label>
                                <Select value={lapanganId} onValueChange={setLapanganId}>
                                    <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20">
                                        <SelectValue placeholder="Semua Lapangan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lapangans.map((l) => (
                                            <SelectItem key={l.id} value={l.id.toString()}>
                                                {l.nama_lapangan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-5 space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                                    Tanggal
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="h-11 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                                        value={tanggal}
                                        onChange={(e) => setTanggal(e.target.value)}
                                        min={today}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Button
                                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/25 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/30"
                                    onClick={handleFilter}
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Cari
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Area */}
                {!selectedLapangan ? (
                    /* Placeholder when no lapangan selected */
                    <div className="text-center py-20 border-2 border-dashed rounded-2xl border-slate-200 bg-white/50">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-5">
                            <Map className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            Pilih lapangan terlebih dahulu
                        </h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                            Silakan pilih lapangan dan tanggal pada form di atas, lalu klik &quot;Cari&quot; untuk melihat ketersediaan jadwal.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Selected Lapangan Info Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
                                    <Map className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">
                                        {selectedLapangan.nama_lapangan}
                                    </h3>
                                    <p className="text-emerald-600 font-semibold text-sm flex items-center gap-1">
                                        Rp {selectedLapangan.harga_per_jam.toLocaleString('id-ID')}
                                        <span className="text-slate-400 font-normal">/ jam</span>
                                    </p>
                                </div>
                            </div>
                            <Button
                                asChild
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/25 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/30 h-11 px-6"
                            >
                                <Link href="/reservasi">Buat Reservasi Sekarang</Link>
                            </Button>
                        </div>

                        {/* Jadwal Grid */}
                        <Card className="shadow-lg shadow-black/5 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-emerald-600" />
                                            Jadwal Tersedia
                                        </CardTitle>
                                        <p className="text-sm text-slate-500 mt-1 ml-7">
                                            {formatTanggal(tanggal)}
                                        </p>
                                    </div>

                                    {/* Slot Count Summary */}
                                    {jadwals.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                {tersediaCount} Tersedia
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                {dipesanCount} Dipesan
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                {tidakTersediaCount} Tidak Tersedia
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {jadwals.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-4">
                                            <Clock className="h-7 w-7 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">
                                            Belum ada jadwal yang dikonfigurasi untuk tanggal ini.
                                        </p>
                                        <p className="text-slate-400 text-sm mt-1">
                                            Silakan coba tanggal lain atau hubungi admin.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {jadwals.map((jadwal) => {
                                            const isAvailable = jadwal.status === 'tersedia';
                                            const isBooked = jadwal.status === 'dipesan';

                                            let cardClasses = 'relative p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all duration-200 ';

                                            if (isAvailable) {
                                                cardClasses += 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-green-50/80 text-emerald-700 hover:shadow-md hover:shadow-emerald-100 hover:border-emerald-300 hover:-translate-y-0.5';
                                            } else if (isBooked) {
                                                cardClasses += 'border-red-200 bg-gradient-to-b from-red-50 to-rose-50/80 text-red-600 opacity-75';
                                            } else {
                                                cardClasses += 'border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 text-slate-400 opacity-60';
                                            }

                                            const statusLabel = isAvailable
                                                ? 'Tersedia'
                                                : isBooked
                                                    ? 'Dipesan'
                                                    : 'Tidak Tersedia';

                                            const statusDotColor = isAvailable
                                                ? 'bg-emerald-500'
                                                : isBooked
                                                    ? 'bg-red-500'
                                                    : 'bg-slate-400';

                                            return (
                                                <div key={jadwal.id} className={cardClasses}>
                                                    <Clock className={`h-4 w-4 mb-2 ${isAvailable ? 'text-emerald-500' : isBooked ? 'text-red-400' : 'text-slate-400'}`} />
                                                    <span className="font-bold text-sm leading-tight">
                                                        {jadwal.jam_mulai} - {jadwal.jam_selesai}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[11px] mt-2 font-semibold uppercase tracking-wide">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`}></span>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
