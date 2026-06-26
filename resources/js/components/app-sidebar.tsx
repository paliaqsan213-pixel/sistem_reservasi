import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Calendar, Map, ClipboardList, CheckSquare, Home } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const mainNavItems: NavItem[] = [];

    if (user?.role === 'admin') {
        mainNavItems.push(
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Kelola Lapangan',
                href: '/admin/lapangan',
                icon: Map,
            },
            {
                title: 'Kelola Jadwal',
                href: '/admin/jadwal',
                icon: Calendar,
            },
            {
                title: 'Monitoring Reservasi',
                href: '/admin/monitoring',
                icon: ClipboardList,
            },
            {
                title: 'Verifikasi Pembayaran',
                href: '/admin/verifikasi',
                icon: CheckSquare,
            }
        );
    } else {
        mainNavItems.push(
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Lihat Jadwal',
                href: '/jadwal',
                icon: Calendar,
            },
            {
                title: 'Pesan Lapangan',
                href: '/reservasi',
                icon: Map,
            },
            {
                title: 'Riwayat Reservasi',
                href: '/riwayat',
                icon: ClipboardList,
            }
        );
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Beranda Utama',
            href: '/',
            icon: Home,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
