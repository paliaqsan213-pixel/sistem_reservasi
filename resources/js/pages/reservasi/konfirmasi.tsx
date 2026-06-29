import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MapPin, Calendar, Clock, CreditCard, Banknote } from 'lucide-react';

interface Props {
    lapangan: {
        nama_lapangan: string;
        harga_per_jam: number;
    };
    jadwal: {
        ids: number[];
        tanggal: string;
        waktu_mulai: string;
        waktu_selesai: string;
    };
    durasi_label: string;
    total_harga: number;
}

export default function Konfirmasi({ lapangan, jadwal, durasi_label, total_harga }: Props) {
    const { post, processing } = useForm();

    const submit = () => {
        post('/reservasi/konfirmasi');
    };

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
        <div className="p-6 max-w-5xl mx-auto">
            <Head title="Konfirmasi Reservasi" />

            {/* Stepper */}
            <div className="mb-8 flex items-center justify-center space-x-4">
                <div className="flex items-center text-green-600 font-bold">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2"><CheckCircle2 className="h-5 w-5" /></div>
                    Pilih Lapangan
                </div>
                <div className="h-1 w-16 bg-green-600"></div>
                <div className="flex items-center text-green-600 font-bold">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2"><CheckCircle2 className="h-5 w-5" /></div>
                    Pilih Waktu
                </div>
                <div className="h-1 w-16 bg-green-600"></div>
                <div className="flex items-center text-green-600 font-bold">
                    <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">3</div>
                    Konfirmasi
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Konfirmasi Reservasi</h2>
                    <p className="text-neutral-500">Pastikan detail reservasi Anda sudah benar sebelum melanjutkan.</p>
                </div>
            </div>

            <Card className="max-w-2xl mx-auto shadow-md border-green-100">
                <CardHeader className="bg-green-50/50 border-b border-green-100 pb-4">
                    <CardTitle className="text-xl text-green-800">Detail Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-neutral-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm text-neutral-500">Lapangan</p>
                                <p className="font-semibold text-neutral-800">{lapangan.nama_lapangan}</p>
                                <p className="text-sm text-neutral-500 mt-1">Rp {lapangan.harga_per_jam.toLocaleString('id-ID')} / jam</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Calendar className="h-5 w-5 text-neutral-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm text-neutral-500">Tanggal Main</p>
                                <p className="font-semibold text-neutral-800">{formatTanggal(jadwal.tanggal)}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Clock className="h-5 w-5 text-neutral-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm text-neutral-500">Waktu & Durasi</p>
                                <p className="font-semibold text-neutral-800">{jadwal.waktu_mulai} - {jadwal.waktu_selesai} WIB</p>
                                <p className="text-sm text-neutral-500 mt-1">{durasi_label}</p>
                            </div>
                        </div>

                        {/* Info Rekening */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Banknote className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-800">Info Pembayaran</p>
                                    <p className="text-sm text-blue-700 mt-1">Bank <strong>BRI</strong> - A.N. <strong>Tawang Alun Futsal Arena</strong></p>
                                    <p className="text-sm font-mono font-bold text-blue-900 mt-1">1234-5678-9012</p>
                                    <p className="text-xs text-blue-600 mt-2">Setelah konfirmasi, Anda akan diminta untuk upload bukti pembayaran.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t flex justify-between items-center">
                            <div className="flex items-center">
                                <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                                <p className="text-lg font-bold text-neutral-800">Total Pembayaran</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">Rp {total_harga.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-neutral-50/50 flex gap-4 pt-6 pb-6">
                    <Button variant="outline" className="w-full" asChild disabled={processing}>
                        <a href="/reservasi/pilih-waktu">Kembali</a>
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={submit} disabled={processing}>
                        Ya, Konfirmasi Reservasi
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
