'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
    first_name: string;
    last_name: string;
    role: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    async function fetchProfile(userId: string) {
        const supabase = createClient();
        const { data } = await supabase
            .from('users')
            .select('first_name, last_name, role, email')
            .eq('id', userId)
            .single();
        if (data) setProfile(data);
    }

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);

            // Refresh the page data when auth state changes
            router.refresh();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
