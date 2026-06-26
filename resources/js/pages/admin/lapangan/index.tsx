import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Camera, Info, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Lapangan {
    id: number;
    nama_lapangan: string;
    harga_per_jam: number;
    deskripsi: string | null;
    foto: string | null;
    status_aktif: 'aktif' | 'tidak_aktif';
}

interface Props {
    lapangans: Lapangan[];
}

export default function Index({ lapangans }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLapangan, setEditingLapangan] = useState<Lapangan | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        nama_lapangan: '',
        harga_per_jam: '',
        deskripsi: '',
        foto: null as File | null,
        status_aktif: 'aktif' as 'aktif' | 'tidak_aktif',
    });

    const openAddDialog = () => {
        reset();
        clearErrors();
        setEditingLapangan(null);
        setData({
            nama_lapangan: '',
            harga_per_jam: '',
            deskripsi: '',
            foto: null,
            status_aktif: 'aktif',
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (lapangan: Lapangan) => {
        clearErrors();
        setEditingLapangan(lapangan);
        setData({
            nama_lapangan: lapangan.nama_lapangan,
            harga_per_jam: lapangan.harga_per_jam.toString(),
            deskripsi: lapangan.deskripsi || '',
            foto: null,
            status_aktif: lapangan.status_aktif,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingLapangan) {
            // Laravel requires POST with _method=PUT to upload files on updates
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('nama_lapangan', data.nama_lapangan);
            formData.append('harga_per_jam', data.harga_per_jam);
            formData.append('deskripsi', data.deskripsi);
            formData.append('status_aktif', data.status_aktif);
            if (data.foto) {
                formData.append('foto', data.foto);
            }

            router.post(`/admin/lapangan/${editingLapangan.id}`, formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/lapangan', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menonaktifkan lapangan ini?')) {
            router.delete(`/admin/lapangan/${id}`);
        }
    };

    return (
        <>
            <Head title="Kelola Data Lapangan" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Kelola Lapangan</h1>
                        <p className="text-sm text-neutral-500">Tambah, ubah, dan nonaktifkan lapangan futsal Tawang Alun.</p>
                    </div>
                    <Button onClick={openAddDialog} className="bg-orange-650 hover:bg-orange-700 text-white gap-2 font-medium">
                        <Plus className="h-4 w-4" />
                        Tambah Lapangan
                    </Button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {lapangans.map((lapangan) => (
                        <Card key={lapangan.id} className="overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="aspect-video relative bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                                    {lapangan.foto ? (
                                        <img src={lapangan.foto} alt={lapangan.nama_lapangan} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-neutral-400">
                                            <Camera className="h-8 w-8 mb-2" />
                                            <span className="text-xs">Tidak ada foto</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm border ${
                                            lapangan.status_aktif === 'aktif' 
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30' 
                                                : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-950/20 dark:text-neutral-400 dark:border-neutral-800'
                                        }`}>
                                            {lapangan.status_aktif === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">{lapangan.nama_lapangan}</CardTitle>
                                    <CardDescription className="text-orange-600 dark:text-orange-400 font-semibold text-base mt-1">
                                        Rp {parseFloat(lapangan.harga_per_jam as any).toLocaleString('id-ID')}/jam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-350 line-clamp-3">
                                        {lapangan.deskripsi || 'Tidak ada deskripsi.'}
                                    </p>
                                </CardContent>
                            </div>
                            <CardFooter className="border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/20 p-4 flex gap-3">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(lapangan)} className="flex-1 gap-2 font-medium">
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                                {lapangan.status_aktif === 'aktif' && (
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(lapangan.id)} className="flex-1 gap-2 border-red-200 hover:bg-red-50 text-red-650 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-950/20 font-medium">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Nonaktifkan
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}

                    {lapangans.length === 0 && (
                        <div className="col-span-full border border-dashed border-neutral-300 rounded-xl p-12 text-center text-neutral-400">
                            <Info className="h-12 w-12 mx-auto mb-3" />
                            <p className="font-semibold text-neutral-600 dark:text-neutral-300">Belum ada data lapangan</p>
                            <p className="text-sm mt-1">Silakan tambahkan lapangan baru dengan tombol di atas.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{editingLapangan ? 'Ubah Lapangan' : 'Tambah Lapangan Baru'}</DialogTitle>
                        <DialogDescription>
                            Isi detail lapangan futsal Tawang Alun di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="nama_lapangan">Nama Lapangan</Label>
                            <Input
                                id="nama_lapangan"
                                value={data.nama_lapangan}
                                onChange={(e) => setData('nama_lapangan', e.target.value)}
                                placeholder="Contoh: Lapangan Vinyl A"
                                required
                            />
                            {errors.nama_lapangan && <span className="text-xs text-red-500">{errors.nama_lapangan}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="harga_per_jam">Harga per Jam (Rupiah)</Label>
                            <Input
                                id="harga_per_jam"
                                type="number"
                                value={data.harga_per_jam}
                                onChange={(e) => setData('harga_per_jam', e.target.value)}
                                placeholder="Contoh: 100000"
                                required
                            />
                            {errors.harga_per_jam && <span className="text-xs text-red-500">{errors.harga_per_jam}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="deskripsi">Deskripsi Lapangan</Label>
                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                className="flex min-h-[90px] w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-800"
                                placeholder="Masukkan detail fasilitas lapangan..."
                            />
                            {errors.deskripsi && <span className="text-xs text-red-500">{errors.deskripsi}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="foto">Foto Lapangan (Maks 2MB)</Label>
                            <Input
                                id="foto"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('foto', e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.foto && <span className="text-xs text-red-500">{errors.foto}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status_aktif">Status Aktif</Label>
                            <select
                                id="status_aktif"
                                value={data.status_aktif}
                                onChange={(e) => setData('status_aktif', e.target.value as any)}
                                className="flex h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-800"
                            >
                                <option value="aktif" className="text-neutral-900">Aktif</option>
                                <option value="tidak_aktif" className="text-neutral-900">Tidak Aktif</option>
                            </select>
                            {errors.status_aktif && <span className="text-xs text-red-500">{errors.status_aktif}</span>}
                        </div>

                        <DialogFooter className="pt-4 border-t border-neutral-100 dark:border-neutral-900 mt-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={processing}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-orange-650 hover:bg-orange-700 text-white font-medium" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
