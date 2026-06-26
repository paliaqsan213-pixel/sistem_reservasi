import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Slot {
    id: number;
    slot_mulai: string;
    slot_selesai: string;
    status: 'tersedia' | 'dipesan' | 'tidak_tersedia';
    is_optimal: boolean;
}

export default function PilihWaktu({ lapangan }: { lapangan: any }) {
    const today = new Date().toISOString().split('T')[0];
    const [tanggal, setTanggal] = useState(today);
    const [durasi, setDurasi] = useState('1');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const { post, processing } = useForm();

    const fetchSlots = async () => {
        if (!tanggal || !durasi) return;
        
        setLoadingSlots(true);
        try {
            const res = await fetch(`/api/greedy-slots?lapangan_id=${lapangan.id}&tanggal=${tanggal}&durasi=${durasi}`);
            const data = await res.json();
            if (res.ok) {
                setSlots(data.slots);
                if (data.has_optimal) {
                    toast.success('Rekomendasi slot optimal berhasil dimuat berdasarkan algoritma Greedy.');
                }
            } else {
                toast.error('Gagal memuat jadwal.');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan jaringan.');
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [tanggal, durasi]);

    const handlePilihSlot = (jadwal_id: number) => {
        post('/reservasi/pilih-waktu', {
            data: {
                jadwal_id: jadwal_id,
                tanggal: tanggal,
                durasi: parseInt(durasi)
            }
        });
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Head title="Pilih Waktu - Reservasi" />

            {/* Stepper */}
            <div className="mb-8 flex items-center justify-center space-x-4">
                <div className="flex items-center text-green-600 font-bold">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2"><CheckCircle2 className="h-5 w-5" /></div>
                    Pilih Lapangan
                </div>
                <div className="h-1 w-16 bg-green-600"></div>
                <div className="flex items-center text-green-600 font-bold">
                    <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">2</div>
                    Pilih Waktu
                </div>
                <div className="h-1 w-16 bg-neutral-200"></div>
                <div className="flex items-center text-neutral-400 font-medium">
                    <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center mr-2">3</div>
                    Konfirmasi
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Pilih Waktu Main</h2>
                    <p className="text-neutral-500">Lapangan: <strong className="text-neutral-800">{lapangan.nama_lapangan}</strong></p>
                </div>
                <Button variant="outline" asChild>
                    <a href="/reservasi">Kembali ke Pilih Lapangan</a>
                </Button>
            </div>

            <Card className="mb-6 border-green-100 shadow-sm">
                <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Tanggal Main</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                                <Input 
                                    type="date" 
                                    min={today}
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Durasi (Jam)</Label>
                            <Select value={durasi} onValueChange={setDurasi}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih durasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Jam</SelectItem>
                                    <SelectItem value="2">2 Jam</SelectItem>
                                    <SelectItem value="3">3 Jam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ketersediaan Slot Waktu</h3>
                
                {loadingSlots ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                ) : slots.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500 border-2 border-dashed rounded-lg">
                        Tidak ada jadwal yang tersedia untuk tanggal dan durasi ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {slots.map((slot) => {
                            if (slot.status === 'tersedia') {
                                if (slot.is_optimal) {
                                    return (
                                        <button
                                            key={slot.id}
                                            disabled={processing}
                                            onClick={() => handlePilihSlot(slot.id)}
                                            className="relative flex flex-col items-center justify-center p-3 border-2 border-green-500 bg-green-50 rounded-xl hover:bg-green-100 transition-colors shadow-sm"
                                        >
                                            <span className="absolute -top-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Rekomendasi</span>
                                            <span className="font-bold text-green-700">{slot.slot_mulai}</span>
                                            <span className="text-xs text-green-600 font-medium">Tersedia</span>
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        key={slot.id}
                                        disabled={processing}
                                        onClick={() => handlePilihSlot(slot.id)}
                                        className="flex flex-col items-center justify-center p-3 border border-blue-200 bg-white rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
                                    >
                                        <span className="font-bold text-neutral-700">{slot.slot_mulai}</span>
                                        <span className="text-xs text-blue-600 font-medium">Tersedia</span>
                                    </button>
                                );
                            } else {
                                return (
                                    <div
                                        key={slot.id}
                                        className="flex flex-col items-center justify-center p-3 border border-neutral-200 bg-neutral-100 rounded-xl opacity-60 cursor-not-allowed"
                                    >
                                        <span className="font-bold text-neutral-400 line-through">{slot.slot_mulai}</span>
                                        <span className="text-xs text-neutral-400 font-medium">
                                            {slot.status === 'dipesan' ? 'Dipesan' : 'Tidak Tersedia'}
                                        </span>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
