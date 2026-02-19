import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';

export default async function AdminLayout({
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
        .select('*')
        .eq('id', user.id)
        .single();

    // Enforce admin role - non-admins cannot access admin area
    if (profile?.role !== 'admin') {
        redirect('/account');
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Background gradient effect */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main content */}
            <div className="lg:pl-72">
                <AdminHeader user={profile} />
                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
