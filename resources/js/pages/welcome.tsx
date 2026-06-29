import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Sistem Reservasi Lapangan Olahraga" />
            
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100">
                {/* Navbar */}
                <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-md bg-white">
                                    <img src="/logo/logo.png" alt="Tawang Alun Futsal Logo" className="h-full w-full object-contain" />
                                </div>
                                <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-white">
                                    Tawang Alun <span className="text-green-600">Futsal</span>
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
                                        <Link href={dashboard()}>
                                            Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="ghost">
                                            <Link href={login()}>Masuk</Link>
                                        </Button>
                                        <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
                                            <Link href={register()}>Daftar</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                    <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 mb-8">
                        🚀 Platform Reservasi Olahraga Terpercaya
                    </div>
                    
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6">
                        Booking Lapangan Olahraga <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                            Jadi Lebih Mudah
                        </span>
                    </h1>
                    
                    <p className="max-w-2xl text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-10">
                        Pesan lapangan futsal, basket, badminton, dan tenis meja hanya dalam beberapa klik. 
                        Cek jadwal ketersediaan real-time dan amankan jam mainmu sekarang.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700">
                            <Link href={auth.user ? '/reservasi' : register()} className="gap-2">
                                Pesan Lapangan Sekarang
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg">
                            <Link href={login()}>
                                Lihat Jadwal Kosong
                            </Link>
                        </Button>
                    </div>
                    
                    {/* Feature Cards */}
                    <div className="grid sm:grid-cols-3 gap-8 mt-24 text-left w-full">
                        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Jadwal Real-time</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Lihat slot waktu yang masih kosong dengan akurat. Tidak ada lagi kejadian bentrok jam main.
                            </p>
                        </div>
                        
                        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Booking Multi-Jam</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Pesan untuk 1, 2, atau bahkan 5 jam sekaligus. Sistem algoritma kami mencarikan slot paling optimal.
                            </p>
                        </div>
                        
                        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                                <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Banyak Pilihan</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Mulai dari lapangan indoor kualitas premium hingga outdoor yang sejuk. Semua tersedia di sini.
                            </p>
                        </div>
                    </div>
                </main>
                
                <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} ArenaBooking. Hak cipta dilindungi.</p>
                </footer>
            </div>
        </>
    );
}
