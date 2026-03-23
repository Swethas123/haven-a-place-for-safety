import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Eye, Map, ShieldAlert, MapPin, LogOut, Bell, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { getCases, deleteCase, clearAdminSession, getAdminAlerts, deleteAdminAlert } from '../utils/storage';
import { SOSCase } from '../types';
import { useTranslation } from '../utils/i18n';
import { AuthorityNetworkIllustration } from '../components/Illustrations';

import { AdminGuard } from '../components/AdminGuard';

export function AuthorityDashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cases, setCases] = useState<SOSCase[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    high: 0,
  });

  useEffect(() => {
    loadCases();
    loadAlerts();

    // Real-time alert listener via SSE
    const eventSource = new EventSource('http://localhost:3001/admin-alert-stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== 'connected') {
        console.log('New alert received:', data);
        loadAlerts(); // Reload alerts when new one arrives
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  const loadCases = () => {
    const allCases = getCases();
    setCases(allCases);

    setStats({
      total: allCases.length,
      open: allCases.filter(c => c.status === 'Open').length,
      inProgress: allCases.filter(c => c.status === 'In Progress').length,
      high: allCases.filter(c => c.severity === 'High').length,
    });
  };

  const loadAlerts = () => {
    const adminAlerts = getAdminAlerts();
    setAlerts(adminAlerts);
  };

  const handleViewDetails = (caseId: string) => {
    navigate(`/case-detail/${caseId}`);
  };

  const handleDeleteCase = (caseId: string) => {
    deleteCase(caseId);
    loadCases();
  };

  const handleDeleteAlert = (alertId: string) => {
    deleteAdminAlert(alertId);
    loadAlerts();
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate('/');
  };

  return (
    <AdminGuard>
      <div className="relative min-h-screen bg-gray-50/50">
        {/* Background Image Layer */}
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
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth_back_home')}
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/map-view')}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Map className="w-4 h-4 mr-2" />
                  {t('auth_map')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('auth_logout')}
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-center mb-8">
              <div className="lg:col-span-2">
                <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{t('auth_dash_title')}</h1>
                <p className="text-lg text-gray-600 leading-relaxed">{t('auth_dash_desc')}</p>
              </div>
              <div className="hidden lg:block relative h-32 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-inner">
                <AuthorityNetworkIllustration className="absolute -top-4 w-full h-auto opacity-80" />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('auth_total_cases')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('auth_open')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">{stats.open}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('auth_in_progress')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('auth_high_severity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">{stats.high}</p>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Alerts Section */}
            {alerts.length > 0 && (
              <Card className="border-2 border-purple-200 mb-6 overflow-hidden">
                <CardHeader className="bg-purple-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-xl text-purple-900">Live Alerts</CardTitle>
                    </div>
                    <Badge className="bg-purple-600">{alerts.length} New</Badge>
                  </div>
                  <CardDescription>Real-time notifications from n8n webhook</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border-l-4 relative ${
                          alert.severity === 'High'
                            ? 'bg-red-50 border-red-600'
                            : alert.severity === 'Medium'
                            ? 'bg-yellow-50 border-yellow-600'
                            : 'bg-green-50 border-green-600'
                        }`}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <div className="flex items-start justify-between mb-2 pr-8">
                          <div className="flex items-center gap-2">
                            <AlertTriangle
                              className={`w-5 h-5 ${
                                alert.severity === 'High'
                                  ? 'text-red-600'
                                  : alert.severity === 'Medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            />
                            <Badge
                              className={
                                alert.severity === 'High'
                                  ? 'bg-red-600'
                                  : alert.severity === 'Medium'
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.time).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 mb-1">{alert.alert}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Emotion:</span> {alert.emotion}
                        </p>
                        {alert.response && (
                          <div className="mb-2">
                            <Badge 
                              variant="outline"
                              className={`text-xs ${
                                alert.response.toLowerCase().includes('critical')
                                  ? 'border-red-600 text-red-700 bg-red-50'
                                  : alert.response.toLowerCase().includes('attention')
                                  ? 'border-orange-600 text-orange-700 bg-orange-50'
                                  : alert.response.toLowerCase().includes('support')
                                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                                  : 'border-gray-600 text-gray-700 bg-gray-50'
                              }`}
                            >
                              AI Action: {
                                alert.response.toLowerCase().includes('critical')
                                  ? '🚨 Police Dispatch'
                                  : alert.response.toLowerCase().includes('attention')
                                  ? '⚠️ NGO Monitoring'
                                  : alert.response.toLowerCase().includes('support')
                                  ? '💬 Counselor Support'
                                  : '⏳ Pending Review'
                              }
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{alert.address}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Cases Table */}
            <Card className="border-2 border-blue-100 overflow-hidden">
              <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-2xl text-blue-900">{t('auth_case_mgmt')}</CardTitle>
                <CardDescription>{t('auth_track_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {cases.length === 0 ? (
                  <div className="text-center py-20 bg-white">
                    <ShieldAlert className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('auth_no_active')}</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                      {t('auth_no_active_desc')}
                    </p>
                  </div>
                ) : (
                  <CaseTable
                    cases={cases}
                    onView={handleViewDetails}
                    onDelete={handleDeleteCase}
                    t={t}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

// Sub-component for the Cases Table to keep it clean
function CaseTable({
  cases,
  onView,
  onDelete,
  t
}: {
  cases: SOSCase[],
  onView: (id: string) => void,
  onDelete: (id: string) => void,
  t: any
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[200px]">{t('auth_victim_name')}</TableHead>
            <TableHead>{t('auth_location')}</TableHead>
            <TableHead>{t('auth_severity')}</TableHead>
            <TableHead>{t('auth_issue_type')}</TableHead>
            <TableHead>{t('auth_status')}</TableHead>
            <TableHead>{t('auth_reported_at')}</TableHead>
            <TableHead className="text-right">{t('auth_manage')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((sosCase) => (
            <TableRow key={sosCase.id} className="hover:bg-blue-50/30 transition-colors">
              <TableCell className="font-bold text-gray-900">{sosCase.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs truncate max-w-[150px]">{sosCase.location.address}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={
                  sosCase.severity === 'High' ? 'bg-red-600 shadow-sm' :
                    sosCase.severity === 'Medium' ? 'bg-blue-600 shadow-sm' :
                      'bg-gray-600 shadow-sm'
                }>
                  {sosCase.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{sosCase.nature}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  sosCase.status === 'In Progress' ? 'border-yellow-600 text-yellow-600 bg-yellow-50' :
                    'border-orange-600 text-orange-600 bg-orange-50'
                }>
                  {sosCase.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-gray-500">
                {new Date(sosCase.timestamp).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-blue-200 hover:bg-blue-50"
                    onClick={() => onView(sosCase.id)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {t('auth_details')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(sosCase.id)}
                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
