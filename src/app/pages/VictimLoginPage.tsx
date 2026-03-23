import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Phone, Lock, ArrowLeft, Loader2, CheckCircle2, Heart, User, Mail } from 'lucide-react';
import { EmpowermentIllustration } from '../components/Illustrations';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { useTranslation } from '../utils/i18n';
import { setVictimAuthenticated, saveUserProfile, getUserProfile } from '../utils/storage';

export function VictimLoginPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState<'mobile' | 'otp' | 'profile'>('mobile');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    
    // Profile fields
    const [name, setName] = useState('');
    const [contactMode, setContactMode] = useState<'SMS' | 'WhatsApp' | 'Email'>('SMS');
    const [email, setEmail] = useState('');

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (mobile.length !== 10) {
            toast.error(t('login_invalid_phone'));
            return;
        }

        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);
            setStep('otp');
            setLoading(false);
            toast.info(`${t('login_otp_sent_toast')} ${code}`, {
                duration: 10000,
            });
        }, 1500);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp !== generatedOtp) {
            toast.error(t('login_invalid_otp'));
            return;
        }

        setLoading(true);
        setTimeout(() => {
            // Check if user profile exists
            const existingProfile = getUserProfile();
            if (existingProfile && existingProfile.phone === mobile) {
                // Existing user - login directly
                setVictimAuthenticated(mobile);
                toast.success(t('login_success_toast'));
                setLoading(false);
                navigate('/victim');
            } else {
                // New user - show profile creation
                setIsNewUser(true);
                setStep('profile');
                setLoading(false);
                toast.info('Please complete your profile');
            }
        }, 1000);
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate email if Email contact mode is selected
        if (contactMode === 'Email' && !email) {
            toast.error('Email is required when Email contact mode is selected');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            // Save user profile
            saveUserProfile({
                name,
                phone: mobile,
                contactMode,
                email: contactMode === 'Email' ? email : undefined,
            });

            setVictimAuthenticated(mobile);
            toast.success('Profile created successfully!');
            setLoading(false);
            navigate('/victim');
        }, 1000);
    };

    return (
        <div className="relative min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image Layer */}
            <div
                className="fixed inset-0 z-0 opacity-[0.12] pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1490127252417-7c393f993ee4?q=80&w=2000&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            />

            <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
                <div className="hidden lg:flex flex-col items-start space-y-8 animate-fade-in direction-backwards">
                    <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-100 shadow-xl shadow-purple-100/50">
                        <EmpowermentIllustration className="w-full h-auto drop-shadow-xl" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-purple-900 leading-tight">
                            {t('login_title')}
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed max-w-md">
                            Your safety is our priority. Access your secure dashboard and community support tools.
                        </p>
                        <div className="flex items-center gap-4 py-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center overflow-hidden">
                                        <User className="w-6 h-6 text-purple-400" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-purple-900">
                                Joined by 10k+ brave women
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-6 hover:bg-purple-100/50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('login_back_home')}
                    </Button>

                    <Card className="border-2 border-purple-100 shadow-xl overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white pb-8">
                            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md shadow-inner">
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                            <CardTitle className="text-3xl font-bold tracking-tight">
                                {t('login_title')}
                            </CardTitle>
                            <CardDescription className="text-purple-50 text-base">
                                {step === 'mobile' ? t('login_desc') : t('login_otp_desc')}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-8">
                            {step === 'mobile' ? (
                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile" className="text-gray-700 font-semibold px-1">
                                            {t('login_mobile_label')}
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                                            <Input
                                                id="mobile"
                                                type="tel"
                                                placeholder={t('login_mobile_placeholder')}
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-purple-500 text-lg tracking-wider"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || mobile.length !== 10}
                                        className="w-full h-14 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-bold shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95 group"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                {t('login_send_otp')}
                                                <CheckCircle2 className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : step === 'otp' ? (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp" className="text-gray-700 font-semibold px-1">
                                            {t('login_otp_label')}
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder={t('login_otp_placeholder')}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-purple-500 text-center text-2xl font-bold tracking-[0.5em]"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Button
                                            type="submit"
                                            disabled={loading || otp.length !== 6}
                                            className="w-full h-14 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-bold shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                t('login_verify_btn')
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setStep('mobile')}
                                            disabled={loading}
                                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        >
                                            {t('login_resend_otp')}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-gray-700 font-semibold px-1">
                                            Your Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="Enter your name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold px-1">
                                            Preferred Contact Mode
                                        </Label>
                                        <RadioGroup value={contactMode} onValueChange={(value: any) => setContactMode(value)}>
                                            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-purple-50 transition-colors">
                                                <RadioGroupItem value="SMS" id="sms" />
                                                <Label htmlFor="sms" className="flex-1 cursor-pointer">SMS</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-purple-50 transition-colors">
                                                <RadioGroupItem value="WhatsApp" id="whatsapp" />
                                                <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">WhatsApp</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-purple-50 transition-colors">
                                                <RadioGroupItem value="Email" id="email-mode" />
                                                <Label htmlFor="email-mode" className="flex-1 cursor-pointer">Email</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {contactMode === 'Email' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-gray-700 font-semibold px-1">
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-bold shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            'Complete Profile'
                                        )}
                                    </Button>
                                </form>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="w-8 h-[1px] bg-gray-100"></span>
                                    HAVEN Secure Access
                                    <span className="w-8 h-[1px] bg-gray-100"></span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
