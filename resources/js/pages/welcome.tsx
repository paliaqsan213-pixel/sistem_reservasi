import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Sistem Reservasi Lapangan Olahraga" />

            <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
                {/* Navbar */}
                <nav className="fixed top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-white">
                                    <img
                                        src="/logo/logo.png"
                                        alt="Tawang Alun Futsal Logo"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                    Tawang Alun{' '}
                                    <span className="text-green-600">
                                        Futsal
                                    </span>
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Button
                                        asChild
                                        variant="default"
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Link href={dashboard()}>
                                            Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="ghost">
                                            <Link href={login()}>Masuk</Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="default"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Link href={register()}>
                                                Daftar
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-24 pb-16 text-center sm:px-6 sm:pt-32 sm:pb-24 lg:px-8 lg:pb-32">
                    <div className="mb-8 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
                        🚀 Platform Reservasi Olahraga Terpercaya
                    </div>

                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl dark:text-white">
                        Booking Lapangan Olahraga{' '}
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                            Jadi Lebih Mudah
                        </span>
                    </h1>

                    <p className="mb-10 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-neutral-400">
                        Pesan lapangan futsal hanya dalam beberapa klik. Cek jadwal ketersediaan
                        real-time dan amankan jam mainmu sekarang.
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="h-14 bg-green-600 px-8 text-lg hover:bg-green-700"
                        >
                            <Link
                                href={auth.user ? '/reservasi' : register()}
                                className="gap-2"
                            >
                                Pesan Lapangan Sekarang
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 text-lg"
                        >
                            <Link href={login()}>Lihat Jadwal Kosong</Link>
                        </Button>
                    </div>

                    {/* Feature Cards */}
                    <div className="mt-24 grid w-full gap-8 text-left sm:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">
                                Jadwal Real-time
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Lihat slot waktu yang masih kosong dengan
                                akurat. Tidak ada lagi kejadian bentrok jam
                                main.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">
                                Booking Multi-Jam
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Pesan untuk 1, 2, atau bahkan 5 jam sekaligus.
                                Sistem algoritma kami mencarikan slot paling
                                optimal.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">
                                Banyak Pilihan
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Mulai dari lapangan indoor kualitas premium
                                hingga outdoor yang sejuk. Semua tersedia di
                                sini.
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <p>
                        &copy; {new Date().getFullYear()} ArenaBooking. Hak
                        cipta dilindungi.
                    </p>
                </footer>
            </div>
        </>
    );
}
