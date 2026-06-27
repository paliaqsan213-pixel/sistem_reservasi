import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    ArrowRight,
    MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Slot {
    id: number;
    slot_mulai: string;
    slot_selesai: string;
    status: 'tersedia' | 'dipesan' | 'tidak_tersedia';
    is_optimal: boolean;
}

interface Lapangan {
    id: number;
    nama_lapangan: string;
    harga_per_jam: number;
}

interface Props {
    lapangan: Lapangan;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Format number as Indonesian Rupiah */
function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/** Check whether two slot arrays form a contiguous block when a new
 *  slot is appended / prepended. We work purely with indices inside
 *  the full `slots` array so "consecutive" means adjacent indices
 *  whose statuses are both 'tersedia'. */
function isConsecutiveSelection(
    currentIndices: number[],
    candidateIndex: number,
): boolean {
    if (currentIndices.length === 0) return true;
    const min = Math.min(...currentIndices);
    const max = Math.max(...currentIndices);
    return candidateIndex === min - 1 || candidateIndex === max + 1;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PilihWaktu({ lapangan }: Props) {
    const today = new Date().toISOString().split('T')[0];

    const [tanggal, setTanggal] = useState(today);
    const [durasi, setDurasi] = useState('1');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    /* ---------- Derived values ---------- */

    const selectedSlots = selectedIndices
        .sort((a, b) => a - b)
        .map((i) => slots[i]);

    const timeRangeStart = selectedSlots.length
        ? selectedSlots[0].slot_mulai
        : null;
    const timeRangeEnd = selectedSlots.length
        ? selectedSlots[selectedSlots.length - 1].slot_selesai
        : null;
    const totalHours = selectedSlots.length;
    const totalPrice = totalHours * lapangan.harga_per_jam;

    /* ---------- Fetch slots ---------- */

    const fetchSlots = async () => {
        if (!tanggal || !durasi) return;

        setLoadingSlots(true);
        setSelectedIndices([]);

        try {
            const res = await fetch(
                `/api/greedy-slots?lapangan_id=${lapangan.id}&tanggal=${tanggal}&durasi=${durasi}`,
            );
            const data = await res.json();

            if (res.ok) {
                setSlots(data.slots ?? []);
                if (data.has_optimal) {
                    toast.success(
                        'Rekomendasi slot optimal berhasil dimuat berdasarkan algoritma Greedy.',
                    );
                }
            } else {
                toast.error('Gagal memuat jadwal.');
                setSlots([]);
            }
        } catch {
            toast.error('Terjadi kesalahan jaringan.');
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [tanggal, durasi]);

    /* ---------- Selection logic ---------- */

    const handleSlotClick = (index: number) => {
        const slot = slots[index];
        if (!slot || slot.status !== 'tersedia') return;

        setSelectedIndices((prev) => {
            // If already selected → deselect (only if it's at the edge)
            if (prev.includes(index)) {
                const sorted = [...prev].sort((a, b) => a - b);
                const isEdge =
                    index === sorted[0] || index === sorted[sorted.length - 1];
                if (isEdge) {
                    return prev.filter((i) => i !== index);
                }
                // Clicking a middle item resets selection to just that item
                return [index];
            }

            // New selection
            if (isConsecutiveSelection(prev, index)) {
                return [...prev, index];
            }

            // Not consecutive → restart selection
            return [index];
        });
    };

    /* ---------- Submission ---------- */

    const handleSubmit = () => {
        if (selectedSlots.length === 0) {
            toast.error('Pilih minimal satu slot waktu.');
            return;
        }

        setSubmitting(true);

        router.post(
            '/reservasi/pilih-waktu',
            {
                jadwal_ids: selectedSlots.map((s) => s.id),
                tanggal,
            },
            {
                onError: () => {
                    toast.error('Gagal memproses reservasi.');
                    setSubmitting(false);
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            },
        );
    };

    /* ---------- Slot styling ---------- */

    const getSlotClasses = (slot: Slot, index: number): string => {
        const base =
            'relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ease-in-out border-2 shadow-sm';

        const isUnavailable =
            slot.status === 'dipesan' || slot.status === 'tidak_tersedia';
        const isSelected = selectedIndices.includes(index);

        if (isUnavailable) {
            return `${base} border-neutral-200 bg-neutral-100 opacity-50 cursor-not-allowed`;
        }

        if (isSelected) {
            return `${base} border-green-500 bg-green-500 text-white cursor-pointer ring-2 ring-green-300 ring-offset-1 scale-[1.02]`;
        }

        if (slot.is_optimal) {
            return `${base} border-green-400 bg-green-50 cursor-pointer hover:bg-green-100 hover:border-green-500 hover:shadow-md`;
        }

        return `${base} border-blue-200 bg-white cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:shadow-md`;
    };

    /* ================================================================ */
    /*  Render                                                          */
    /* ================================================================ */

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/60 via-white to-blue-50/40">
            <Head title="Pilih Waktu - Reservasi" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* ===== Stepper ===== */}
                <nav className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
                    {/* Step 1 – completed */}
                    <div className="flex items-center gap-2 text-green-600">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 shadow-sm">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <span className="hidden font-semibold sm:inline">
                            Pilih Lapangan
                        </span>
                    </div>

                    <div className="h-0.5 w-10 rounded bg-green-500 sm:w-16" />

                    {/* Step 2 – active */}
                    <div className="flex items-center gap-2 text-green-700">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow">
                            2
                        </div>
                        <span className="font-bold sm:inline">Pilih Waktu</span>
                    </div>

                    <div className="h-0.5 w-10 rounded bg-neutral-200 sm:w-16" />

                    {/* Step 3 – inactive */}
                    <div className="flex items-center gap-2 text-neutral-400">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold shadow-sm">
                            3
                        </div>
                        <span className="hidden font-medium sm:inline">
                            Konfirmasi
                        </span>
                    </div>
                </nav>

                {/* ===== Lapangan info card ===== */}
                <Card className="mb-6 border-green-100 bg-white/80 shadow-sm backdrop-blur">
                    <CardContent className="flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-neutral-800">
                                    {lapangan.nama_lapangan}
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    {formatRupiah(lapangan.harga_per_jam)}{' '}
                                    <span className="text-neutral-400">
                                        / jam
                                    </span>
                                </p>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" asChild>
                            <a href="/reservasi">Ganti Lapangan</a>
                        </Button>
                    </CardContent>
                </Card>

                {/* ===== Filter: Tanggal & Durasi ===== */}
                <Card className="mb-8 border-green-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Date picker */}
                            <div className="space-y-2">
                                <Label htmlFor="tanggal">Tanggal Main</Label>
                                <div className="relative">
                                    <CalendarIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        min={today}
                                        value={tanggal}
                                        onChange={(e) =>
                                            setTanggal(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Duration selector */}
                            <div className="space-y-2">
                                <Label>Durasi (Jam)</Label>
                                <Select
                                    value={durasi}
                                    onValueChange={setDurasi}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih durasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">
                                            1 Jam
                                        </SelectItem>
                                        <SelectItem value="2">
                                            2 Jam
                                        </SelectItem>
                                        <SelectItem value="3">
                                            3 Jam
                                        </SelectItem>
                                        <SelectItem value="4">
                                            4 Jam
                                        </SelectItem>
                                        <SelectItem value="5">
                                            5 Jam
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ===== Slot Grid ===== */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-neutral-800">
                            Ketersediaan Slot Waktu
                        </h3>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-3 w-3 rounded border-2 border-blue-200 bg-white" />
                            Tersedia
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-3 w-3 rounded border-2 border-green-400 bg-green-50" />
                            Rekomendasi
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-3 w-3 rounded bg-green-500" />
                            Dipilih
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-3 w-3 rounded bg-neutral-200" />
                            Tidak Tersedia
                        </span>
                    </div>

                    {loadingSlots ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 p-16">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            <p className="text-sm text-neutral-400">
                                Memuat jadwal…
                            </p>
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 p-16 text-neutral-400">
                            <CalendarIcon className="h-10 w-10" />
                            <p className="text-sm font-medium">
                                Tidak ada jadwal tersedia untuk tanggal dan
                                durasi ini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {slots.map((slot, index) => {
                                const isUnavailable =
                                    slot.status === 'dipesan' ||
                                    slot.status === 'tidak_tersedia';
                                const isSelected =
                                    selectedIndices.includes(index);

                                return (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        disabled={isUnavailable || submitting}
                                        onClick={() => handleSlotClick(index)}
                                        className={getSlotClasses(slot, index)}
                                    >
                                        {/* Rekomendasi badge */}
                                        {slot.is_optimal &&
                                            !isSelected &&
                                            !isUnavailable && (
                                                <span className="absolute -top-2.5 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                                    Rekomendasi
                                                </span>
                                            )}

                                        {/* Selected check */}
                                        {isSelected && (
                                            <CheckCircle2 className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full bg-white text-green-600 shadow" />
                                        )}

                                        {/* Time */}
                                        <span
                                            className={`text-sm font-bold ${
                                                isUnavailable
                                                    ? 'text-neutral-400 line-through'
                                                    : isSelected
                                                      ? 'text-white'
                                                      : slot.is_optimal
                                                        ? 'text-green-700'
                                                        : 'text-neutral-700'
                                            }`}
                                        >
                                            {slot.slot_mulai} -{' '}
                                            {slot.slot_selesai}
                                        </span>

                                        {/* Status label */}
                                        <span
                                            className={`mt-0.5 text-[11px] font-medium ${
                                                isUnavailable
                                                    ? 'text-neutral-400'
                                                    : isSelected
                                                      ? 'text-green-100'
                                                      : slot.is_optimal
                                                        ? 'text-green-600'
                                                        : 'text-blue-500'
                                            }`}
                                        >
                                            {isUnavailable
                                                ? slot.status === 'dipesan'
                                                    ? 'Dipesan'
                                                    : 'Tidak Tersedia'
                                                : isSelected
                                                  ? 'Dipilih'
                                                  : 'Tersedia'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ===== Summary Card ===== */}
                <div
                    className={`mt-8 transition-all duration-300 ${
                        selectedSlots.length > 0
                            ? 'translate-y-0 opacity-100'
                            : 'pointer-events-none translate-y-4 opacity-0'
                    }`}
                >
                    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
                        <CardContent className="pt-6">
                            <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-green-800">
                                <CheckCircle2 className="h-5 w-5" />
                                Ringkasan Reservasi
                            </h4>

                            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                {/* Lapangan */}
                                <div className="rounded-lg bg-white/70 p-3">
                                    <p className="text-xs font-medium text-neutral-400">
                                        Lapangan
                                    </p>
                                    <p className="font-semibold text-neutral-800">
                                        {lapangan.nama_lapangan}
                                    </p>
                                </div>

                                {/* Tanggal */}
                                <div className="rounded-lg bg-white/70 p-3">
                                    <p className="text-xs font-medium text-neutral-400">
                                        Tanggal
                                    </p>
                                    <p className="font-semibold text-neutral-800">
                                        {new Date(tanggal).toLocaleDateString(
                                            'id-ID',
                                            {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            },
                                        )}
                                    </p>
                                </div>

                                {/* Waktu */}
                                <div className="rounded-lg bg-white/70 p-3">
                                    <p className="text-xs font-medium text-neutral-400">
                                        Waktu
                                    </p>
                                    <p className="font-semibold text-neutral-800">
                                        {timeRangeStart} – {timeRangeEnd}{' '}
                                        <span className="text-neutral-400">
                                            ({totalHours} Jam)
                                        </span>
                                    </p>
                                </div>

                                {/* Total */}
                                <div className="rounded-lg bg-white/70 p-3">
                                    <p className="text-xs font-medium text-neutral-400">
                                        Total Harga
                                    </p>
                                    <p className="text-lg font-bold text-green-600">
                                        {formatRupiah(totalPrice)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <Button
                                    size="lg"
                                    disabled={
                                        submitting ||
                                        selectedSlots.length === 0
                                    }
                                    onClick={handleSubmit}
                                    className="gap-2 bg-green-600 text-white shadow-md hover:bg-green-700"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memproses…
                                        </>
                                    ) : (
                                        <>
                                            Lanjut Konfirmasi
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
