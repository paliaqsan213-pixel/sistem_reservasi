import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Check, X, FileText, Download, User, Calendar, Clock, Landmark, AlertCircle, Inbox, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserData {
    name: string;
    email: string;
    phone: string;
}

interface Lapangan {
    nama_lapangan: string;
}

interface Jadwal {
    slot_mulai: string;
    slot_selesai: string;
}

interface Pembayaran {
    bukti_transfer: string;
    tanggal_upload: string;
    status: string;
}

interface Reservasi {
    id: number;
    kode_booking: string;
    tanggal_reservasi: string;
    waktu_mulai: string;
    waktu_selesai: string;
    total_harga: number;
    status: string;
    user: UserData;
    lapangan: Lapangan;
    jadwal: Jadwal;
    pembayaran: Pembayaran | null;
}

interface Props {
    reservasis: Reservasi[];
}

export default function Index({ reservasis }: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        alasan_penolakan: '',
    });

    useEffect(() => {
        if (reservasis.length > 0 && selectedId === null) {
            setSelectedId(reservasis[0].id);
        } else if (reservasis.length === 0) {
            setSelectedId(null);
        }
    }, [reservasis]);

    const active = reservasis.find((r) => r.id === selectedId) || null;

    const handleConfirm = () => {
        if (!active) return;
        router.post(`/admin/verifikasi/${active.id}/konfirmasi`, {}, {
            onSuccess: () => {
                setIsConfirmOpen(false);
            }
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!active) return;
        post(`/admin/verifikasi/${active.id}/tolak`, {
            onSuccess: () => {
                setIsRejectOpen(false);
                reset();
            }
        });
    };

    const isPdf = (url: string) => {
        return url.toLowerCase().endsWith('.pdf');
    };

    return (
        <>
            <Head title="Verifikasi Pembayaran" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Verifikasi Pembayaran</h1>
                    <p className="text-sm text-neutral-500">Tinjau bukti transfer pelanggan untuk mengonfirmasi pemesanan lapangan.</p>
                </div>

                {reservasis.length === 0 ? (
                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="h-16 w-16 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                                <Inbox className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Semua Pembayaran Terverifikasi</h3>
                            <p className="text-sm text-neutral-500 mt-1 max-w-sm">
                                Tidak ada antrean verifikasi pembayaran saat ini. Semua pesanan sudah diproses! ✓
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-5 h-[calc(100vh-220px)] min-h-[500px]">
                        {/* Left List Pane */}
                        <div className="md:col-span-2 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 divide-y divide-neutral-100 dark:divide-neutral-900 shadow-sm pr-1">
                            <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/30 sticky top-0 backdrop-blur z-10 border-b border-neutral-100 dark:border-neutral-900">
                                <h3 className="font-semibold text-sm">Antrean Verifikasi ({reservasis.length})</h3>
                            </div>
                            {reservasis.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setSelectedId(r.id)}
                                    className={`w-full p-4 text-left transition-colors flex flex-col gap-1 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/10 ${
                                        selectedId === r.id ? 'bg-orange-50/40 border-l-4 border-orange-600 dark:bg-orange-950/10' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{r.kode_booking}</span>
                                        <span className="text-xs text-neutral-400 font-medium">
                                            {r.pembayaran ? new Date(r.pembayaran.tanggal_upload).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{r.user.name}</span>
                                    <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        <span>{r.lapangan.nama_lapangan}</span>
                                        <span className="font-bold text-orange-650 dark:text-orange-400">
                                            Rp {parseFloat(r.total_harga as any).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Right Detail Pane */}
                        <div className="md:col-span-3 flex flex-col h-full border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 shadow-sm overflow-hidden">
                            {active ? (
                                <>
                                    <div className="p-5 border-b border-neutral-100 dark:border-neutral-900 flex justify-between items-center bg-neutral-50/20 dark:bg-neutral-900/10">
                                        <div>
                                            <h3 className="font-bold text-lg">{active.kode_booking}</h3>
                                            <p className="text-xs text-neutral-500">Pemesanan untuk {active.user.name}</p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
                                            Menunggu Verifikasi
                                        </span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                        {/* Grid Details */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Detail Lapangan & Waktu</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300">
                                                        <Landmark className="h-4 w-4 text-neutral-400 shrink-0" />
                                                        <span>{active.lapangan.nama_lapangan}</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300">
                                                        <Calendar className="h-4 w-4 text-neutral-400 shrink-0" />
                                                        <span>{new Date(active.tanggal_reservasi).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300">
                                                        <Clock className="h-4 w-4 text-neutral-400 shrink-0" />
                                                        <span>{active.waktu_mulai.substring(0, 5)} - {active.waktu_selesai.substring(0, 5)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Detail Pelanggan</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300">
                                                        <User className="h-4 w-4 text-neutral-400 shrink-0" />
                                                        <span>{active.user.name}</span>
                                                    </div>
                                                    <div className="text-xs text-neutral-500 pl-6">
                                                        Email: {active.user.email} <br />
                                                        Telp: {active.user.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nominal Billing */}
                                        <div className="rounded-lg bg-neutral-55 dark:bg-neutral-900/40 p-4 border border-neutral-100 dark:border-neutral-900 flex justify-between items-center">
                                            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Total Nominal Pembayaran</span>
                                            <span className="text-lg font-extrabold text-orange-650 dark:text-orange-400">
                                                Rp {parseFloat(active.total_harga as any).toLocaleString('id-ID')}
                                            </span>
                                        </div>

                                        {/* Proof File Preview */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Bukti Pembayaran</Label>
                                            {active.pembayaran ? (
                                                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 bg-neutral-50/50 dark:bg-neutral-900/20 max-w-lg">
                                                    {isPdf(active.pembayaran.bukti_transfer) ? (
                                                        <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 rounded-md">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-8 w-8 text-red-500" />
                                                                <div className="text-left">
                                                                    <p className="text-sm font-semibold">Bukti_Transfer.pdf</p>
                                                                    <p className="text-xs text-neutral-400">Dokumen PDF Pembayaran</p>
                                                                </div>
                                                            </div>
                                                            <Button asChild size="sm" variant="outline" className="gap-2">
                                                                <a href={active.pembayaran.bukti_transfer} download target="_blank" rel="noopener noreferrer">
                                                                    <Download className="h-4 w-4" />
                                                                    Unduh
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative overflow-hidden rounded-md border border-neutral-100 dark:border-neutral-900 flex justify-center bg-black/5">
                                                            <img
                                                                src={active.pembayaran.bukti_transfer}
                                                                alt="Bukti Transfer"
                                                                className="max-h-[300px] object-contain hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-neutral-500 italic">Belum ada bukti pembayaran yang diunggah.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-4 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-900/10 flex justify-end gap-3 sticky bottom-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsRejectOpen(true)}
                                            className="border-red-200 hover:bg-red-50 text-red-650 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-950/20 font-medium"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Tolak Pembayaran
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setIsConfirmOpen(true)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-medium"
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Konfirmasi Pembayaran
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center p-12 text-center text-neutral-400">
                                    Pilih antrean verifikasi untuk melihat rincian detail.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Konfirmasi Pembayaran?
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-sm text-neutral-500">
                            Apakah Anda yakin ingin menyetujui bukti pembayaran untuk pesanan ini? Aksi ini akan mengunci slot lapangan secara permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)}>
                            Batal
                        </Button>
                        <Button type="button" onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 text-white font-medium">
                            Ya, Konfirmasi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={(open) => {
                setIsRejectOpen(open);
                if (!open) {
                    reset();
                    clearErrors();
                }
            }}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-650" />
                            Tolak Pembayaran
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-sm text-neutral-500">
                            Berikan alasan penolakan secara jelas. Pesan ini akan dikirimkan kepada pelanggan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRejectSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="alasan_penolakan">Alasan Penolakan</Label>
                            <textarea
                                id="alasan_penolakan"
                                value={data.alasan_penolakan}
                                onChange={(e) => setData('alasan_penolakan', e.target.value)}
                                className="flex min-h-[110px] w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-neutral-450 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-neutral-800"
                                placeholder="Contoh: Nominal transfer kurang, atau foto bukti transfer blur/tidak jelas..."
                                required
                            />
                            {errors.alasan_penolakan && <span className="text-xs text-red-500">{errors.alasan_penolakan}</span>}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)} disabled={processing}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-red-650 hover:bg-red-700 text-white font-medium" disabled={processing}>
                                {processing ? 'Menolak...' : 'Kirim Penolakan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
