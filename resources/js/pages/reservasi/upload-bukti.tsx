import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt, UploadCloud, Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface Props {
    reservasi: {
        id: number;
        kode_booking: string;
        total_harga: number;
        status: string;
        tanggal_reservasi: string;
        waktu_mulai: string;
        waktu_selesai: string;
        lapangan: {
            nama_lapangan: string;
        };
    };
}

export default function UploadBukti({ reservasi }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        bukti_pembayaran: null as File | null,
    });
    
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('bukti_pembayaran', file);
            if (file.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(file));
            } else {
                setPreview(null);
            }
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/reservasi/${reservasi.id}/upload-bukti`);
    };

    const copyRekening = () => {
        navigator.clipboard.writeText('123456789012');
        toast.success('Nomor rekening berhasil disalin!');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Head title="Upload Bukti Pembayaran" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold">Pembayaran</h2>
                <p className="text-neutral-500">Selesaikan pembayaran Anda untuk mengkonfirmasi reservasi.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Kiri: Detail & Rekening */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="bg-neutral-50 pb-4">
                            <CardTitle className="text-lg flex items-center">
                                <Receipt className="h-5 w-5 mr-2 text-neutral-500" />
                                Detail Tagihan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Kode Booking</span>
                                <span className="font-mono font-bold text-neutral-800">{reservasi.kode_booking}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Lapangan</span>
                                <span className="font-semibold text-neutral-800">{reservasi.lapangan.nama_lapangan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Waktu</span>
                                <span className="font-semibold text-neutral-800">{reservasi.waktu_mulai.substring(0,5)} - {reservasi.waktu_selesai.substring(0,5)}</span>
                            </div>
                            <div className="pt-3 border-t flex justify-between items-center">
                                <span className="font-bold">Total</span>
                                <span className="text-lg font-bold text-green-600">Rp {reservasi.total_harga.toLocaleString('id-ID')}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-100 bg-blue-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-blue-900">Info Rekening</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-16 bg-white border rounded flex items-center justify-center font-bold text-blue-600">
                                    BRI
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase">Bank Rakyat Indonesia</p>
                                    <p className="font-semibold">A.N. Tawang Alun Futsal Arena</p>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border flex justify-between items-center">
                                <span className="font-mono text-lg tracking-wider font-bold">1234-5678-9012</span>
                                <Button variant="ghost" size="icon" onClick={copyRekening} title="Salin Rekening">
                                    <Copy className="h-4 w-4 text-neutral-500" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Kanan: Form Upload */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Bukti Transfer</CardTitle>
                        </CardHeader>
                        <form onSubmit={submit}>
                            <CardContent className="space-y-6">
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex gap-3 text-sm">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p>Mohon upload foto atau screenshot bukti transfer yang jelas (maks 2MB). Reservasi Anda akan otomatis dibatalkan jika tidak ada pembayaran dalam waktu 1 jam.</p>
                                </div>

                                <div className="space-y-3">
                                    <Label>File Bukti Pembayaran (JPG/PNG/PDF)</Label>
                                    <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center bg-neutral-50 transition-colors hover:bg-neutral-100">
                                        <UploadCloud className="h-12 w-12 text-neutral-400 mb-4" />
                                        <Input 
                                            type="file" 
                                            className="max-w-xs" 
                                            accept=".jpg,.jpeg,.png,.pdf" 
                                            onChange={handleFileChange}
                                        />
                                        <p className="text-xs text-neutral-500 mt-2">Maksimal ukuran file: 2MB</p>
                                    </div>
                                    {errors.bukti_pembayaran && <p className="text-red-500 text-sm">{errors.bukti_pembayaran}</p>}
                                </div>

                                {preview && (
                                    <div className="mt-4 border rounded-lg p-2 max-w-sm">
                                        <p className="text-sm font-medium mb-2 text-neutral-500">Preview:</p>
                                        <img src={preview} alt="Preview Bukti" className="w-full rounded" />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-neutral-50 border-t justify-end">
                                <Button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700" 
                                    disabled={processing || !data.bukti_pembayaran}
                                >
                                    {processing ? 'Mengupload...' : 'Upload & Konfirmasi'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
