import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { User, Calendar, Home, Settings, Bell, Briefcase, LayoutDashboard } from 'lucide-react';

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('first_name, last_name, avatar_url, role')
        .eq('id', user.id)
        .single();

    const navItems: { href: string; label: string; icon: typeof Home }[] = [
        { href: '/account', label: 'Dashboard', icon: Home },
        { href: '/account/bookings', label: 'My Bookings', icon: Calendar },
        { href: '/account/notifications', label: 'Notifications', icon: Bell },
        { href: '/account/settings', label: 'Settings', icon: Settings },
    ];

    if (profile?.role === 'guide' || profile?.role === 'admin') {
        navItems.push({ href: '/dashboard', label: 'Operator Dashboard', icon: LayoutDashboard });
    } else if (profile?.role === 'customer') {
        navItems.push({ href: '/account/become-operator', label: 'Become Operator', icon: Briefcase });
    }

    return (
        <div className="pt-24 lg:pt-28 pb-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <aside className="md:w-64 flex-shrink-0">
                        {/* User info */}
                        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-card border border-border/50">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    {profile?.first_name || 'Guest'} {profile?.last_name || ''}
                                </p>
                                <p className="text-sm text-muted-foreground">Personal Account</p>
                            </div>
                        </div>

                        {/* Nav links */}
                        <nav className="relative flex md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 [-webkit-overflow-scrolling:touch] [mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent)] md:[mask-image:none]">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all whitespace-nowrap"
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

