import { useState, useEffect } from 'react';
import { Users, Lock, UserPlus, LogIn, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getAdmin, saveAdmin, isAdminLoggedIn, setAdminLoggedIn } from '../utils/storage';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if admin is registered
        const admin = getAdmin();
        if (admin) {
            setIsRegistered(true);
            setIsLoginView(true);
        } else {
            setIsRegistered(false);
            setIsLoginView(false);
        }

        // Check if admin is already logged in
        if (isAdminLoggedIn()) {
            setIsAuthorized(true);
        }
    }, []);

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        saveAdmin({ email, password });
        setAdminLoggedIn(true);
        setIsAuthorized(true);
        setIsRegistered(true);
        setIsLoginView(true);
        setError('');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const admin = getAdmin();

        if (admin && admin.email === email && admin.password === password) {
            setAdminLoggedIn(true);
            setIsAuthorized(true);
            setError('');
        } else {
            setError('Invalid email or password');
        }
    };

    if (isAuthorized) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2000&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 z-0 bg-blue-950/70 backdrop-blur-sm" />

            {/* Branding text on left (desktop) */}
            <div className="relative z-10 hidden lg:flex flex-col justify-center pr-16 max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/30 rounded-2xl border border-blue-400/30">
                        <ShieldAlert className="w-8 h-8 text-blue-200" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">HAVEN</span>
                </div>
                <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                    Emergency<br />Response System
                </h2>
                <p className="text-blue-200 text-base leading-relaxed">
                    Secure access for authorized personnel only. Monitor, respond, and protect in real time.
                </p>
                <div className="mt-8 space-y-3">
                    {['Real-time case monitoring', 'Live emergency alerts', 'Location-based response'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-blue-200 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {f}
                        </div>
                    ))}
                </div>
            </div>

            {/* Login card */}
            <Card className="relative z-10 w-full max-w-md border-0 shadow-2xl overflow-hidden rounded-3xl">
                <CardHeader className="text-center bg-blue-600 text-white pb-8 pt-8">
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {isLoginView ? 'Authority Login' : 'Authority Sign Up'}
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                        {isLoginView
                            ? 'Enter your credentials to access the dashboard'
                            : 'Register your authority account for HAVEN'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="authority@haven.gov"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-xl border-blue-100 focus:border-blue-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-xl border-blue-100 focus:border-blue-600"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-medium">
                                <ShieldAlert className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                        >
                            {isLoginView ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <LogIn className="w-5 h-5" /> Login
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 justify-center">
                                    <UserPlus className="w-5 h-5" /> Create Account
                                </span>
                            )}
                        </Button>

                        {isRegistered && (
                            <p className="text-center text-sm text-gray-500">
                                {isLoginView ? (
                                    <>
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setIsLoginView(false); setError(''); }}
                                            className="text-blue-600 font-bold hover:underline"
                                        >
                                            Sign Up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setIsLoginView(true); setError(''); }}
                                            className="text-blue-600 font-bold hover:underline"
                                        >
                                            Login
                                        </button>
                                    </>
                                )}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
