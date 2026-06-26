import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    return (
        <>
            <Head title="Dashboard Pelanggan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Welcome Header */}
                <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold">Selamat Datang, {user?.name}! 👋</h1>
                    <p className="mt-1 text-green-100 text-sm">
                        Kelola reservasi lapangan futsal Anda di Tawang Alun Futsal Arena.
                    </p>
                    <div className="mt-4 flex gap-3">
                        <Button asChild className="bg-white text-green-700 hover:bg-green-50 font-semibold shadow-sm">
                            <Link href="/reservasi">
                                <CalendarCheck className="h-4 w-4 mr-2" />
                                Pesan Lapangan
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10 font-medium">
                            <Link href="/jadwal">
                                <Clock className="h-4 w-4 mr-2" />
                                Lihat Jadwal
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="group cursor-pointer border-neutral-200 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                        <Link href="/reservasi" className="block">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Reservasi Baru</CardTitle>
                                <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                    <CalendarCheck className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-neutral-500">Pesan lapangan futsal sekarang melalui proses reservasi multi-langkah.</p>
                                <span className="mt-3 inline-flex items-center text-xs font-semibold text-green-600 group-hover:underline dark:text-green-400">
                                    Mulai Reservasi <ArrowRight className="h-3 w-3 ml-1" />
                                </span>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="group cursor-pointer border-neutral-200 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                        <Link href="/riwayat" className="block">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Riwayat & Status</CardTitle>
                                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-neutral-500">Pantau status reservasi Anda, upload bukti bayar, dan lihat riwayat pemesanan.</p>
                                <span className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
                                    Lihat Riwayat <ArrowRight className="h-3 w-3 ml-1" />
                                </span>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="group cursor-pointer border-neutral-200 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                        <Link href="/jadwal" className="block">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Jadwal Lapangan</CardTitle>
                                <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-neutral-500">Cek ketersediaan slot waktu lapangan futsal sebelum melakukan reservasi.</p>
                                <span className="mt-3 inline-flex items-center text-xs font-semibold text-purple-600 group-hover:underline dark:text-purple-400">
                                    Cek Jadwal <ArrowRight className="h-3 w-3 ml-1" />
                                </span>
                            </CardContent>
                        </Link>
                    </Card>
                </div>

                {/* Info Card */}
                <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Cara Memesan Lapangan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-4">
                            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/30">
                                <div className="rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 h-10 w-10 flex items-center justify-center text-sm font-bold mb-2">1</div>
                                <h4 className="text-sm font-semibold">Pilih Lapangan</h4>
                                <p className="text-xs text-neutral-500 mt-1">Pilih lapangan futsal yang tersedia.</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/30">
                                <div className="rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 h-10 w-10 flex items-center justify-center text-sm font-bold mb-2">2</div>
                                <h4 className="text-sm font-semibold">Pilih Waktu</h4>
                                <p className="text-xs text-neutral-500 mt-1">Pilih tanggal dan slot waktu yang optimal.</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/30">
                                <div className="rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 h-10 w-10 flex items-center justify-center text-sm font-bold mb-2">3</div>
                                <h4 className="text-sm font-semibold">Konfirmasi</h4>
                                <p className="text-xs text-neutral-500 mt-1">Periksa detail dan konfirmasi reservasi.</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/30">
                                <div className="rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 h-10 w-10 flex items-center justify-center text-sm font-bold mb-2">4</div>
                                <h4 className="text-sm font-semibold">Upload Bukti</h4>
                                <p className="text-xs text-neutral-500 mt-1">Transfer dan upload bukti pembayaran.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
