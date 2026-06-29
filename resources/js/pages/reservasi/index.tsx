import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Lapangan {
    id: number;
    nama_lapangan: string;
    harga_per_jam: number;
    deskripsi: string;
    foto: string | null;
}

export default function ReservasiIndex({ lapangans }: { lapangans: Lapangan[] }) {
    const [processing, setProcessing] = useState(false);

    const submit = (id: number) => {
        setProcessing(true);
        router.post('/reservasi/pilih-lapangan', {
            lapangan_id: id
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6">
            <Head title="Pilih Lapangan - Reservasi" />

            {/* Stepper */}
            <div className="mb-8 flex items-center justify-center space-x-4">
                <div className="flex items-center text-green-600 font-bold">
                    <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">1</div>
                    Pilih Lapangan
                </div>
                <div className="h-1 w-16 bg-neutral-200"></div>
                <div className="flex items-center text-neutral-400 font-medium">
                    <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center mr-2">2</div>
                    Pilih Waktu
                </div>
                <div className="h-1 w-16 bg-neutral-200"></div>
                <div className="flex items-center text-neutral-400 font-medium">
                    <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center mr-2">3</div>
                    Konfirmasi
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-bold">Pilih Lapangan Futsal</h2>
                <p className="text-neutral-500">Silakan pilih lapangan yang ingin Anda sewa.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lapangans.map((lapangan) => (
                    <Card key={lapangan.id} className="overflow-hidden flex flex-col">
                        <div className="h-48 bg-neutral-100 flex items-center justify-center">
                            {lapangan.foto ? (
                                <img src={`/storage/${lapangan.foto}`} alt={lapangan.nama_lapangan} className="h-full w-full object-cover" />
                            ) : (
                                <Map className="h-16 w-16 text-neutral-300" />
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle>{lapangan.nama_lapangan}</CardTitle>
                            <CardDescription className="text-green-600 font-bold">
                                Rp {lapangan.harga_per_jam.toLocaleString('id-ID')} / Jam
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-neutral-600">{lapangan.deskripsi || 'Tidak ada deskripsi.'}</p>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full bg-green-600 hover:bg-green-700" 
                                onClick={() => submit(lapangan.id)}
                                disabled={processing}
                            >
                                Pesan Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {lapangans.length === 0 && (
                    <div className="col-span-full py-12 text-center text-neutral-500 border-2 border-dashed rounded-lg">
                        Saat ini tidak ada lapangan yang aktif/tersedia.
                    </div>
                )}
            </div>
        </div>
    );
}
