import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, ShieldAlert, LogOut, Shield } from 'lucide-react';
import { AuthorityNetworkIllustration } from '../components/Illustrations';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getCases, clearAdminSession } from '../utils/storage';
import { SOSCase } from '../types';
import { useTranslation } from '../utils/i18n';

import { AdminGuard } from '../components/AdminGuard';

// Helper function to get severity color
function getSeverityColor(severity: string): string {
  if (severity === 'High') return 'red';
  if (severity === 'Medium') return 'yellow';
  if (severity === 'Low') return 'green';
  return 'gray';
}

// Helper function to get Tailwind CSS classes for severity
function getSeverityClasses(severity: string): {
  bg: string;
  border: string;
  text: string;
  bgLight: string;
  borderLight: string;
} {
  if (severity === 'High') {
    return {
      bg: 'bg-red-600',
      border: 'border-t-red-600',
      text: 'text-red-600',
      bgLight: 'bg-red-50',
      borderLight: 'border-red-100',
    };
  }
  if (severity === 'Medium') {
    return {
      bg: 'bg-yellow-500',
      border: 'border-t-yellow-500',
      text: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      borderLight: 'border-yellow-100',
    };
  }
  if (severity === 'Low') {
    return {
      bg: 'bg-green-500',
      border: 'border-t-green-500',
      text: 'text-green-600',
      bgLight: 'bg-green-50',
      borderLight: 'border-green-100',
    };
  }
  return {
    bg: 'bg-gray-500',
    border: 'border-t-gray-500',
    text: 'text-gray-600',
    bgLight: 'bg-gray-50',
    borderLight: 'border-gray-100',
  };
}

export function MapViewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cases, setCases] = useState<SOSCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<SOSCase | null>(null);

  useEffect(() => {
    const allCases = getCases();
    setCases(allCases);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/');
  };

  // Calculate center of all cases
  const centerLat = cases.length > 0
    ? cases.reduce((sum, c) => sum + c.location.lat, 0) / cases.length
    : 28.6139;
  const centerLng = cases.length > 0
    ? cases.reduce((sum, c) => sum + c.location.lng, 0) / cases.length
    : 77.2090;

  // Count repeat incidents at same location
  const locationCounts = cases.reduce((acc, c) => {
    const key = `${c.location.lat.toFixed(3)},${c.location.lng.toFixed(3)}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Helper to calculate marker position for the demo
  // Delhi center ~ 28.6, 77.2. 1 deg ~ 111km. 
  // We'll use a 20km radius for the map view roughly.
  const getMarkerPos = (lat: number, lng: number) => {
    const latDiff = lat - centerLat;
    const lngDiff = lng - centerLng;
    // Map is roughly 0.2 deg wide/high at zoom 11
    const zoomScale = 500; // arbitrary scale for demo
    const top = 50 - (latDiff * zoomScale);
    const left = 50 + (lngDiff * zoomScale);
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <AdminGuard>
      <div className="relative min-h-screen bg-white">
        {/* Background Image Layer */}
        <div
          className="fixed inset-0 z-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        <div className="relative z-10 py-8 text-left">
          <div className="container mx-auto px-4 max-w-7xl">
            <Button
              variant="ghost"
              onClick={() => navigate('/authority-dashboard')}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('map_back_dash')}
            </Button>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('map_title')}</h1>
                <p className="text-gray-600">{t('map_desc')}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('auth_logout')}
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('map_locations')}</CardTitle>
                    <CardDescription>
                      {t('map_priority_msg')} <span className="text-red-600 font-semibold">{t('map_red_high')}</span>,
                      <span className="text-yellow-600 font-semibold ml-2">{t('map_yellow_med')}</span>,
                      <span className="text-green-600 font-semibold ml-2">{t('map_green_low')}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cases.length === 0 ? (
                      <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">{t('map_no_cases')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Main Map Container */}
                        <div className="bg-gray-200 rounded-lg overflow-hidden h-96 relative border-2 border-gray-100 shadow-inner">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps?q=${centerLat},${centerLng}&output=embed&z=11&t=m`}
                            allowFullScreen
                          />

                          {/* Custom Markers Overlay */}
                          <div className="absolute inset-0 pointer-events-none">
                            {cases.map((sosCase) => {
                              const pos = getMarkerPos(sosCase.location.lat, sosCase.location.lng);
                              const isActive = selectedCase?.id === sosCase.id;
                              const severityClasses = getSeverityClasses(sosCase.severity);
                              
                              return (
                                <div
                                  key={sosCase.id}
                                  className="absolute transition-all duration-300"
                                  style={{
                                    top: pos.top,
                                    left: pos.left,
                                    transform: 'translate(-50%, -100%)'
                                  }}
                                >
                                  <div className={`relative group pointer-events-auto cursor-pointer`} onClick={() => setSelectedCase(sosCase)}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce-subtle ${severityClasses.bg} ${isActive ? 'scale-125 ring-4 ring-white ring-opacity-50 z-50' : 'z-10'}`}>
                                      <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[100]`}>
                                      {sosCase.name} ({sosCase.severity})
                                    </div>
                                    <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${severityClasses.border}`}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Map Summary Overlay */}
                        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-blue-600" />
                            {t('map_activity_summary')} {cases.length} {t('map_reports')}
                          </p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getSeverityClasses('High').bgLight} ${getSeverityClasses('High').borderLight}`}>
                              <span className={`w-3 h-3 rounded-full ${getSeverityClasses('High').bg}`}></span>
                              <span className={`font-semibold ${getSeverityClasses('High').text}`}> {t('auth_open')}: {cases.filter(c => c.severity === 'High').length}</span>
                            </div>
                            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getSeverityClasses('Medium').bgLight} ${getSeverityClasses('Medium').borderLight}`}>
                              <span className={`w-3 h-3 rounded-full ${getSeverityClasses('Medium').bg}`}></span>
                              <span className={`font-semibold ${getSeverityClasses('Medium').text}`}>{t('auth_in_progress')}: {cases.filter(c => c.severity === 'Medium').length}</span>
                            </div>
                            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getSeverityClasses('Low').bgLight} ${getSeverityClasses('Low').borderLight}`}>
                              <span className={`w-3 h-3 rounded-full ${getSeverityClasses('Low').bg}`}></span>
                              <span className={`font-semibold ${getSeverityClasses('Low').text}`}>{t('auth_closed')}: {cases.filter(c => c.severity === 'Low').length}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                              <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                              <span className="font-semibold text-purple-700">{t('map_hot_zones')} {Object.values(locationCounts).filter(count => count > 1).length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Case List */}
              <div>
                <Card className="rounded-2xl border-none shadow-lg">
                  <CardHeader className="bg-gray-50/50 rounded-t-2xl">
                    <CardTitle className="text-xl">{t('map_priority_list')}</CardTitle>
                    <CardDescription>{t('map_identified_reports')}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {cases.length === 0 ? (
                      <p className="text-sm text-gray-600 text-center py-8">{t('map_no_data')}</p>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {cases.map((sosCase) => {
                          const locationKey = `${sosCase.location.lat.toFixed(3)},${sosCase.location.lng.toFixed(3)}`;
                          const isRepeat = locationCounts[locationKey] > 1;
                          const severityClasses = getSeverityClasses(sosCase.severity);

                          return (
                            <div
                              key={sosCase.id}
                              className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedCase?.id === sosCase.id
                                ? 'bg-blue-50 border-blue-400 ring-4 ring-blue-50 shadow-md'
                                : 'hover:bg-gray-50 border-gray-100'
                                }`}
                              onClick={() => setSelectedCase(sosCase)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-bold text-gray-900">{sosCase.name}</p>
                                <Badge className={`px-2 py-0.5 rounded-full ${severityClasses.bg} hover:${severityClasses.bg}`}>
                                  {sosCase.severity}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-blue-600" />
                                <span className="truncate">{sosCase.location.address}</span>
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-[10px] text-gray-400 font-medium">{sosCase.nature}</span>
                                {isRepeat && (
                                  <Badge variant="outline" className="text-[9px] border-purple-200 text-purple-700 bg-purple-50">
                                    {t('map_repeat_site')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Selected Case Details */}
                {selectedCase && (
                  <Card className="mt-4 rounded-2xl border-2 border-blue-100 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {t('map_incident_details')}
                        <Badge variant="outline" className="text-blue-600 border-blue-200">{selectedCase.status}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('map_victim')}</p>
                          <p className="font-semibold text-gray-900">{selectedCase.name}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('auth_severity')}</p>
                          <p className={`font-bold ${getSeverityClasses(selectedCase.severity).text}`}>{selectedCase.severity}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">{t('map_last_location')}</p>
                        <p className="text-xs text-gray-700">{selectedCase.location.address}</p>
                      </div>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                        onClick={() => navigate(`/case-detail/${selectedCase.id}`)}
                      >
                        {t('map_process_investigation')}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Hot Zones */}
            {cases.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{t('map_hot_zones_analysis')}</CardTitle>
                  <CardDescription>{t('map_hot_zones_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(locationCounts)
                      .filter(([_, count]) => count > 1)
                      .sort(([_, a], [__, b]) => b - a)
                      .slice(0, 3)
                      .map(([location, count]) => {
                        const [lat, lng] = location.split(',').map(Number);
                        const casesAtLocation = cases.filter(
                          c => c.location.lat.toFixed(3) === lat.toFixed(3) &&
                            c.location.lng.toFixed(3) === lng.toFixed(3)
                        );

                        return (
                          <Card key={location} className="border-purple-200">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-bold text-purple-600">{count}</span>
                                <Badge className="bg-purple-600">{t('map_hot_zone_label')}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {casesAtLocation[0]?.location.address || 'Unknown location'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {count} {t('map_incidents_area')}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminGuard >
  );
}
