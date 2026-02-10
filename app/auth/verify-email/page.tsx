import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 text-6xl">📧</div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Check Your Email
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        We&apos;ve sent you a verification link
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-300">
                        Click the link in your email to verify your account.
                        Once verified, you can sign in.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/auth/login">
                            Back to Login
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
