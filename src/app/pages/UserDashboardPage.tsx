import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, Phone, User, AlertCircle, FileText, Scale, Navigation } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getCaseById, isVictimAuthenticated } from '../utils/storage';
import { SOSCase } from '../types';
import { getNearbySafetyPlaces, SafetyPlace } from '../utils/safety';
import { useTranslation } from '../utils/i18n';
import { PinGuard } from '../components/PinGuard';
import { SafeHavenIllustration } from '../components/Illustrations';
import { FriendlyAvatar3D } from '../components/FriendlyAvatar3D';

export function UserDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sosCase, setSOSCase] = useState<SOSCase | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<SafetyPlace[]>([]);

  useEffect(() => {
    if (!isVictimAuthenticated()) {
      navigate('/victim-login');
      return;
    }

    if (id) {
      const caseData = getCaseById(id);
      setSOSCase(caseData);
      if (caseData) {
        setNearbyPlaces(getNearbySafetyPlaces(caseData.location.lat, caseData.location.lng));
      }
    }
  }, [id]);

  if (!id) {
    return (
      <PinGuard>
        <div className="relative min-h-screen bg-white">
          {/* Background Image Layer */}
          <div
            className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />

          <div className="relative z-10 py-12">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-12">
                <SafeHavenIllustration className="w-64 h-auto drop-shadow-xl" />
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-200">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {t('dash_victim_title')}
                    </h1>
                  </div>
                  <p className="text-xl text-gray-600">{t('dash_safety_tools_desc')}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Link to="/create-post">
                  <Card className="border-2 border-purple-200 hover:shadow-lg transition-all h-full bg-white group cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8 text-purple-600" />
                      </div>
                      <CardTitle>{t('dash_covert_post')}</CardTitle>
                      <CardDescription>{t('dash_covert_post_desc')}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link to="/support-chat">
                  <Card className="border-2 border-pink-200 hover:shadow-lg transition-all h-full bg-white group cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-20 h-20 mb-4 group-hover:scale-110 transition-transform">
                        <FriendlyAvatar3D isSpeaking={false} className="w-full h-full" />
                      </div>
                      <CardTitle>{t('dash_support_chat')}</CardTitle>
                      <CardDescription>{t('dash_support_chat_desc')}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link to="/law-chat">
                  <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all h-full bg-white group cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Scale className="w-8 h-8 text-indigo-600" />
                      </div>
                      <CardTitle>{t('dash_legal_chat')}</CardTitle>
                      <CardDescription>{t('dash_legal_chat_desc')}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>

              <div className="mt-12 text-gray-500">
                <Button variant="ghost" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('dash_back_home')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PinGuard>
    );
  }

  if (!sosCase) {
    return (
      <PinGuard>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600 animate-pulse">{t('dash_loading')}</p>
          <Button variant="ghost" onClick={() => navigate('/victim')}>
            {t('dash_back_dash')}
          </Button>
        </div>
      </PinGuard>
    );
  }

  return (
    <PinGuard>
      <div className="relative min-h-screen bg-gray-50/50">
        {/* Background Image Layer */}
        <div
          className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        <div className="relative z-10 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => navigate('/victim')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('dash_back_dash')}
              </Button>
              <Badge className={
                sosCase.severity === 'High' ? 'bg-red-600' :
                sosCase.severity === 'Medium' ? 'bg-blue-600' :
                'bg-gray-600'
              }>
                {sosCase.severity} {t('dash_severity')}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-2">{t('dash_case_dashboard')}</h1>
            <p className="text-gray-600 mb-8">{t('dash_case_id')}: {sosCase.id}</p>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    {t('dash_pref_contact')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{sosCase.preferredContact}</p>
                  <p className="text-sm text-gray-600 mt-1">{sosCase.phone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    {t('dash_nature_violence')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{sosCase.nature}</p>
                  <p className="text-sm text-gray-600 mt-1">{sosCase.riskLevel}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        {t('dash_curr_situation')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{sosCase.currentSituation}</p>
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-600" />
                      {t('dash_nearby_safety')}
                    </h2>
                    <Badge variant="outline" className="bg-white">
                      {t('dash_location')}: {sosCase.location.address}
                    </Badge>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardDescription>{t('dash_nearby_safety_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-4">
                          <TabsTrigger value="all">{t('dash_all')}</TabsTrigger>
                          <TabsTrigger value="Police">{t('dash_police')}</TabsTrigger>
                          <TabsTrigger value="Shelter">{t('dash_shelters')}</TabsTrigger>
                          <TabsTrigger value="NGO">{t('dash_ngos')}</TabsTrigger>
                        </TabsList>

                        {['all', 'Police', 'Shelter', 'NGO'].map((tab) => (
                          <TabsContent key={tab} value={tab} className="space-y-4">
                            {nearbyPlaces
                              .filter(p => tab === 'all' || p.type === tab)
                              .map((place) => (
                                <div key={place.id} className="flex justify-between items-center bg-white p-4 rounded-lg border">
                                  <div>
                                    <h4 className="font-bold">{place.name}</h4>
                                    <p className="text-sm text-gray-500">{place.address}</p>
                                    <p className="text-xs text-purple-600 font-medium">{place.distance}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => window.open(`tel:${place.phone}`)}>
                                      <Phone className="w-3 h-3 mr-1" /> {t('dash_call')}
                                    </Button>
                                    <Button size="sm" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`)}>
                                      <Navigation className="w-3 h-3 mr-1" /> {t('dash_navigate')}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            {nearbyPlaces.filter(p => tab === 'all' || p.type === tab).length === 0 && (
                              <div className="text-center py-8 text-gray-500 italic">
                                {t('dash_no_resources')}
                              </div>
                            )}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
                </section>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dash_curr_status')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={
                        sosCase.status === 'Closed' ? 'bg-green-600' :
                        sosCase.status === 'In Progress' ? 'bg-yellow-600' :
                        'bg-orange-600'
                      }>
                        {sosCase.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {t('dash_created')} {new Date(sosCase.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">{t('dash_status_desc')}</p>
                    <div className="space-y-3">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/support-chat')}>
                        {t('dash_talk_care')}
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => navigate('/law-chat')}>
                        {t('dash_consult_law')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('dash_timeline')}</CardTitle>
                    <CardDescription>{t('dash_timeline_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sosCase.timeline.map((event, index) => (
                        <div key={event.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-600' : 'bg-gray-300'}`} />
                            {index < sosCase.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-sm">{event.event}</p>
                            <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="text-purple-900">{t('dash_sos_msg')}</CardTitle>
                    <CardDescription>{t('dash_covert_msg_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-4 rounded-lg border border-purple-100 italic text-sm text-purple-800">
                      {sosCase.sosMessage}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PinGuard>
  );
}
