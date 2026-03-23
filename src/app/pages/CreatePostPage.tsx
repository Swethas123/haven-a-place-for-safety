import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { saveCase, getSessionPin, getUserProfile } from '../utils/storage';
import { sendSOSToWebhook } from '../utils/webhook';
import { SOSCase } from '../types';
import { toast } from 'sonner';
import { useTranslation } from '../utils/i18n';

export function CreatePostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    severity: '',
    additionalDetails: '',
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80', // Default nature
  });

  const MOCK_TEMPLATES = [
    { title: 'Nature', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80' },
    { title: 'Food', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' },
    { title: 'Pet', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&q=80' },
    { title: 'Hobby', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80' },
  ];

  useEffect(() => {
    // Load user profile
    const profile = getUserProfile();
    if (!profile) {
      toast.error('Please complete your profile first');
      navigate('/victim-login');
      return;
    }
    setUserProfile(profile);

    // Reverse geocoding function
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
      try {
        // Using OpenStreetMap Nominatim API for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
        );
        const data = await response.json();
        
        // Extract city and state/country
        const city = data.address?.city || data.address?.town || data.address?.village || '';
        const state = data.address?.state || '';
        const country = data.address?.country || '';
        
        if (city && state) {
          return `${city}, ${state}`;
        } else if (city && country) {
          return `${city}, ${country}`;
        } else if (state && country) {
          return `${state}, ${country}`;
        } else {
          return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    };

    // Auto-detect location with reverse geocoding
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocode(latitude, longitude);
          setLocation({
            lat: latitude,
            lng: longitude,
            address: address,
          });
          toast.success(t('create_post_loc_success'));
        },
        async () => {
          // Default location if geolocation fails
          const defaultLat = 28.6139;
          const defaultLng = 77.2090;
          const address = await reverseGeocode(defaultLat, defaultLng);
          setLocation({
            lat: defaultLat,
            lng: defaultLng,
            address: address,
          });
          toast.info(t('create_post_loc_default'));
        }
      );
    } else {
      const defaultLat = 28.6139;
      const defaultLng = 77.2090;
      reverseGeocode(defaultLat, defaultLng).then(address => {
        setLocation({
          lat: defaultLat,
          lng: defaultLng,
          address: address,
        });
      });
    }
  }, [navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error(t('create_post_loc_error'));
      return;
    }

    if (!formData.severity) {
      toast.error('Please select severity level');
      return;
    }

    if (!userProfile) {
      toast.error('User profile not found');
      return;
    }

    setLoading(true);

    try {
      // Create case object with simplified data
      const newCase: SOSCase = {
        id: Date.now().toString(),
        pin: getSessionPin() || undefined,
        name: userProfile.name,
        phone: userProfile.phone,
        preferredContact: userProfile.contactMode,
        location,
        imageUrl: formData.imageUrl,
        sosMessage: formData.additionalDetails || 'SOS Alert',
        severity: formData.severity as 'Low' | 'Medium' | 'High',
        nature: formData.additionalDetails || 'Emergency',
        riskLevel: formData.severity === 'High' ? 'Critical - Immediate intervention needed' :
                   formData.severity === 'Medium' ? 'Moderate - Regular monitoring required' :
                   'Low - Supportive assistance recommended',
        status: 'Open',
        timestamp: Date.now(),
        durationOfAbuse: 'Not specified',
        frequency: 'Not specified',
        currentSituation: formData.additionalDetails || 'Emergency situation',
        culpritDescription: 'Not specified',
        timeline: [
          {
            id: '1',
            event: 'Case created',
            timestamp: Date.now(),
          },
        ],
      };

      // Save to localStorage
      saveCase(newCase);

      // Send SOS alert to n8n webhook (non-blocking)
      sendSOSToWebhook({
        emotionType: newCase.severity,
        emotion: formData.additionalDetails || newCase.nature,
        location: newCase.location,
      });

      toast.success(t('create_post_gen_success'));

      // Navigate to post preview
      navigate(`/post-preview/${newCase.id}`);
    } catch (error) {
      toast.error(t('create_post_gen_error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('create_post_back')}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t('create_post_title')}</CardTitle>
            <CardDescription>
              {t('create_post_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Info Display (Read-only) */}
              {userProfile && (
                <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm font-semibold text-purple-900">Your Profile</p>
                  <p className="text-sm text-gray-700">Name: {userProfile.name}</p>
                  <p className="text-sm text-gray-700">Phone: {userProfile.phone}</p>
                  <p className="text-sm text-gray-700">Contact Mode: {userProfile.contactMode}</p>
                </div>
              )}

              {/* Location Display */}
              <div>
                <Label>{t('create_post_location') || t('dash_location')}</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    {location ? location.address : t('create_post_detecting_loc')}
                  </span>
                </div>
              </div>

              {/* Severity Selection */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-lg font-bold">Severity Level</Label>
                <div>
                  <Label htmlFor="severity">Select Severity *</Label>
                  <Select
                    required
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="additionalDetails">Additional details (optional)</Label>
                  <Textarea
                    id="additionalDetails"
                    value={formData.additionalDetails}
                    onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                    placeholder="Add any additional information..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Covert Post Image Selection */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-lg font-bold">{t('create_post_select_template')}</Label>
                <p className="text-sm text-gray-500">{t('create_post_template_desc')}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MOCK_TEMPLATES.map((template) => (
                    <div
                      key={template.url}
                      onClick={() => setFormData({ ...formData, imageUrl: template.url })}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${formData.imageUrl === template.url ? 'border-purple-600 scale-105 shadow-lg' : 'border-transparent hover:border-purple-200'
                        }`}
                    >
                      <img src={template.url} alt={template.title} className="w-full h-24 object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-xs">
                          {template.title === 'Nature' ? t('temp_nature') :
                            template.title === 'Food' ? t('temp_food') :
                              template.title === 'Pet' ? t('temp_pet') :
                                template.title === 'Hobby' ? t('temp_hobby') : template.title}
                        </span>
                      </div>
                      {formData.imageUrl === template.url && (
                        <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full p-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('create_post_generating')}
                  </>
                ) : (
                  t('create_post_generate_btn')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
