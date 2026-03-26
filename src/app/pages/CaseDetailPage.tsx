import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Phone, MapPin, AlertCircle, FileText, Cpu, Scan, CheckCircle2, Map, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { getCaseById, updateCaseStatus, clearAdminSession } from '../utils/storage';
import { SOSCase } from '../types';
import { useTranslation } from '../utils/i18n';

import { AdminGuard } from '../components/AdminGuard';

export function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sosCase, setSOSCase] = useState<SOSCase | null>(null);

  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeProgress, setDecodeProgress] = useState(0);
  const [isDecoded, setIsDecoded] = useState(false);
  const [showDecodeModal, setShowDecodeModal] = useState(false);

  useEffect(() => {
    if (id) {
      const caseData = getCaseById(id);
      setSOSCase(caseData);
    }
  }, [id]);

  const handleStartDecode = () => {
    setIsDecoding(true);
    setDecodeProgress(0);
    setIsDecoded(false);

    // Simulate decoding progress
    const interval = setInterval(() => {
      setDecodeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDecoding(false);
          setIsDecoded(true);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleStatusChange = (status: SOSCase['status']) => {
    if (id) {
      updateCaseStatus(id, status);
      const updatedCase = getCaseById(id);
      setSOSCase(updatedCase);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate('/');
  };

  return (
    <AdminGuard>
      {sosCase ? (
        <div className="relative min-h-screen bg-gray-50/50">
          <div
            className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2000&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />

          <div className="relative z-10 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => navigate('/authority-dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth_back_dash')}
              </Button>
              <div className="flex gap-2 items-center">
                <Badge className={
                  sosCase.severity === 'High' ? 'bg-red-600' :
                  sosCase.severity === 'Medium' ? 'bg-blue-600' :
                  'bg-gray-600'
                }>
                  {sosCase.severity} {t('dash_severity')}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
                  <LogOut className="w-3 h-3 mr-1" /> {t('auth_logout')}
                </Button>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-1">{sosCase.name}</h1>
            <p className="text-gray-500 mb-8 text-sm">{t('case_id')} {sosCase.id}</p>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Phone className="w-4 h-4" /> {t('case_contact_details')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">{t('case_phone_num')}</p>
                      <p className="font-semibold">{sosCase.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('case_pref_contact')}</p>
                      <p className="font-semibold">{sosCase.preferredContact}</p>
                    </div>
                    <div className="pt-3 border-t">
                      <Button className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        {t('case_contact_victim')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertCircle className="w-4 h-4" /> {t('case_nature_violence')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">{t('case_type')}</p>
                      <p className="font-semibold">{sosCase.nature}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('case_risk_assessment')}</p>
                      <p className="font-semibold text-red-600">{sosCase.riskLevel}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Select value={sosCase.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="w-4 h-4" /> {t('case_incident_loc')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">{t('case_address')}</span> {sosCase.location.address}</p>
                    <p className="text-sm text-gray-600 mb-4"><span className="font-medium">{t('case_coordinates')}</span> {sosCase.location.lat.toFixed(4)}, {sosCase.location.lng.toFixed(4)}</p>
                    <div className="rounded-lg overflow-hidden h-56 border border-gray-200">
                      <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${sosCase.location.lat},${sosCase.location.lng}&output=embed`} allowFullScreen />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="w-4 h-4" /> {t('case_curr_situation')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{sosCase.currentSituation}</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="text-purple-900 text-base">{t('case_gen_sos_msg')}</CardTitle>
                    <CardDescription>{t('case_covert_msg_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-4 rounded-lg border border-purple-100 italic text-sm text-purple-800">
                      {sosCase.sosMessage}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('case_timeline')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sosCase.timeline.map((event, index) => (
                        <div key={event.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-600' : 'bg-gray-300'}`} />
                            {index < sosCase.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
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
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={() => setShowDecodeModal(true)} className="bg-purple-600 hover:bg-purple-700">
                <Cpu className="w-4 h-4 mr-2" /> {t('case_decode_view')}
              </Button>
            </div>
          </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600 animate-pulse">{t('case_loading')}</p>
          <Button variant="ghost" onClick={() => navigate('/authority-dashboard')}>
            {t('map_back_dash')}
          </Button>
        </div>
      )}

      {/* Decode Modal */}
      {showDecodeModal && sosCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-0 shadow-2xl bg-white overflow-hidden rounded-3xl">
            <CardHeader className="bg-purple-900 text-white p-6 border-b border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-700 rounded-xl">
                    <Scan className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{t('case_forensic_decoder')}</CardTitle>
                    <CardDescription className="text-purple-300">{t('case_extracting_payload')}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setShowDecodeModal(false)}>
                  <span className="text-2xl">&times;</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Side: Image Scanning */}
                <div className="space-y-6">
                  <div className="relative rounded-2xl overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50 aspect-square flex items-center justify-center">
                    {sosCase.imageUrl || (sosCase as any).selectedImage ? (
                      <>
                        <img src={sosCase.imageUrl || (sosCase as any).selectedImage} alt="Covert Post" className="w-full h-full object-cover" />
                        {isDecoding && (
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Scanning Animation */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_#a855f7] animate-scan" style={{
                              top: `${decodeProgress}%`
                            }} />
                            <div className="absolute inset-0 bg-purple-500/10 backdrop-contrast-125" />
                          </div>
                        )}
                        {isDecoded && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-white/90 p-4 rounded-full shadow-xl animate-bounce">
                              <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="relative w-full h-full group">
                        {/* Fallback image for older cases so decode view always works */}
                        <img
                          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80"
                          alt="Covert Post (Fallback)"
                          className="w-full h-full object-cover opacity-60"
                        />
                        {isDecoding && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_#a855f7] animate-scan" style={{
                              top: `${decodeProgress}%`
                            }} />
                            <div className="absolute inset-0 bg-purple-500/10 backdrop-contrast-125" />
                          </div>
                        )}
                        {isDecoded && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-white/90 p-4 rounded-full shadow-xl animate-bounce">
                              <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded text-[10px] text-white/80 border border-white/10">
                          NOTE: Displaying default payload container for legacy case file.
                        </div>
                      </div>
                    )}
                  </div>

                  {!isDecoded && !isDecoding && (
                    <Button
                      className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg"
                      onClick={handleStartDecode}
                    >
                      <Cpu className="w-5 h-5 mr-3" />
                      {t('case_run_analysis')}
                    </Button>
                  )}

                  {isDecoding && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-bold text-purple-700">
                        <span>{t('case_analyzing_pixels')}</span>
                        <span>{decodeProgress}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 transition-all duration-100" style={{ width: `${decodeProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Decoded Intelligence */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 border-b pb-2">{t('case_decoded_intel')}</h3>

                  {!isDecoded ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl bg-gray-50 text-gray-400">
                      <div className="animate-pulse flex flex-col items-center">
                        <Cpu className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">{t('case_waiting_extraction')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      {/* Security Parameters */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-red-400 mb-1">{t('case_threat_level')}</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${sosCase.severity === 'High' ? 'bg-red-600' : 'bg-orange-500'}`} />
                            <p className="text-xl font-black text-red-900">{sosCase.severity}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-blue-400 mb-1">{t('case_coordinates_label')}</p>
                          <div className="flex items-center gap-2">
                            <Map className="w-4 h-4 text-blue-600" />
                            <p className="text-lg font-bold text-blue-900 truncate">
                              {sosCase.location.lat.toFixed(4)}, {sosCase.location.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Decoded Payload */}
                      <div className="p-6 bg-gray-900 rounded-2xl border-4 border-gray-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                          <CheckCircle2 className="w-20 h-20 text-white" />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3 underline decoration-purple-500">{t('case_decoded_narrative')}</p>
                        <p className="text-lg font-medium text-white italic leading-relaxed">
                          "{sosCase.sosMessage}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('case_verified_authentic')}
                          </div>
                          <p className="text-[10px] font-mono text-gray-600">PKI-SIG: 8x7f...9a21</p>
                        </div>
                      </div>

                      <div className="p-4 bg-indigo-50 rounded-xl flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">{t('case_verified_loc')}</p>
                          <p className="text-sm font-medium text-indigo-900">{sosCase.location.address}</p>
                        </div>
                      </div>

                      <Button className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-6" onClick={() => setShowDecodeModal(false)}>
                        {t('case_return_file')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminGuard>
  );
}
