import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Clock, Landmark, Users, ArrowRight, Activity, Bell, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard({ stats, perlu_verifikasi, activities }: any) {
    return (
        <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto">
            <Head title="Admin Dashboard" />

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard Utama</h1>
                <p className="text-neutral-500">Ringkasan sistem reservasi Tawang Alun Futsal Arena hari ini.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Total Reservasi</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_reservasi || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1">Bulan ini</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 shadow-sm ${stats?.menunggu_verifikasi > 0 ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-neutral-300'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Perlu Verifikasi</CardTitle>
                        <Clock className={`h-4 w-4 ${stats?.menunggu_verifikasi > 0 ? 'text-amber-500 animate-pulse' : 'text-neutral-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.menunggu_verifikasi || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1">Menunggu persetujuan</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Lapangan Aktif</CardTitle>
                        <Landmark className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.lapangan_aktif || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1">Siap disewa</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Member Terdaftar</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.member_terdaftar || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1">Total pelanggan</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
                {/* Aktivitas Terbaru */}
                <Card className="col-span-4 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-neutral-50/50 pb-4">
                        <CardTitle className="text-lg flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-neutral-500" /> Aktivitas Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-8">
                            {activities?.length > 0 ? activities.map((activity: any, idx: number) => (
                                <div key={idx} className="flex items-start">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold border border-orange-200">
                                        {activity.user.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.user} <span className="font-normal text-neutral-500">{activity.action}</span>
                                        </p>
                                        <div className="flex items-center text-xs text-neutral-500">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {activity.time}
                                            <Badge variant="secondary" className="ml-2 text-[10px] bg-neutral-100">{activity.status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-neutral-500 text-sm">
                                    Belum ada aktivitas terekam hari ini.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Perlu Verifikasi Panel */}
                <Card className="col-span-3 shadow-sm border-amber-200">
                    <CardHeader className="border-b bg-amber-50 pb-4">
                        <CardTitle className="text-lg flex items-center text-amber-900">
                            <Bell className="h-5 w-5 mr-2 text-amber-600" /> Perhatian: Menunggu Verifikasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {perlu_verifikasi?.length > 0 ? perlu_verifikasi.map((item: any) => (
                                <div key={item.id} className="flex flex-col rounded-lg border border-neutral-200 p-4 hover:border-amber-300 transition-colors bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded">{item.kode_booking}</span>
                                        <span className="text-xs font-semibold text-green-600">Rp {item.total_harga.toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-sm font-semibold">{item.user.name}</p>
                                    <p className="text-xs text-neutral-500 mb-3">{item.lapangan.nama_lapangan} • {item.tanggal_reservasi}</p>
                                    
                                    <Button asChild size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                        <Link href="/admin/verifikasi">
                                            Tinjau & Verifikasi <ArrowRight className="ml-2 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            )) : (
                                <div className="text-center py-12 text-neutral-500 text-sm flex flex-col items-center">
                                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    </div>
                                    Semua pembayaran telah diverifikasi.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
