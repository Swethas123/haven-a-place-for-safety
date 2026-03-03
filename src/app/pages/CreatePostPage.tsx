import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { generateSOSNarrative, decomposeSOSData } from '../utils/ai';
import { saveCase, getSessionPin } from '../utils/storage';
import { sendSOSToWebhook } from '../utils/webhook';
import { SOSCase } from '../types';
import { toast } from 'sonner';
import { useTranslation } from '../utils/i18n';

export function CreatePostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferredContact: '',
    durationOfAbuse: '',
    frequency: '',
    currentSituation: '',
    culpritDescription: '',
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80', // Default nature
  });

  const MOCK_TEMPLATES = [
    { title: 'Nature', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80' },
    { title: 'Food', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' },
    { title: 'Pet', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&q=80' },
    { title: 'Hobby', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80' },
  ];

  useEffect(() => {
    // Auto-detect location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
          toast.success(t('create_post_loc_success'));
        },
        () => {
          // Default location if geolocation fails
          setLocation({
            lat: 28.6139,
            lng: 77.2090,
            address: 'New Delhi, India',
          });
          toast.info(t('create_post_loc_default'));
        }
      );
    } else {
      setLocation({
        lat: 28.6139,
        lng: 77.2090,
        address: 'New Delhi, India',
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error(t('create_post_loc_error'));
      return;
    }

    setLoading(true);

    try {
      // Step 1: Generate SOS narrative using AI
      const sosMessage = await generateSOSNarrative(formData);

      // Step 2: Decompose to extract severity, nature, risk level
      const { severity, nature, riskLevel } = await decomposeSOSData(sosMessage, formData);

      // Step 3: Create case object
      const newCase: SOSCase = {
        id: Date.now().toString(),
        pin: getSessionPin() || undefined,
        ...formData,
        imageUrl: formData.imageUrl, // Explicitly set to ensure it's saved correctly
        location,
        sosMessage,
        severity,
        nature,
        riskLevel,
        status: 'Open',
        timestamp: Date.now(),
        timeline: [
          {
            id: '1',
            event: 'Case created',
            timestamp: Date.now(),
          },
        ],
      };

      // Step 4: Save to localStorage
      saveCase(newCase);

      // Step 5: Send SOS alert to n8n webhook (non-blocking)
      sendSOSToWebhook({
        severity: newCase.severity,
        location: newCase.location,
        emotion: newCase.nature, // Using nature as emotion indicator
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
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('create_post_your_name')}</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('create_post_name_placeholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{t('create_post_phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredContact">{t('create_post_pref_contact')}</Label>
                  <Select
                    required
                    value={formData.preferredContact}
                    onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('create_post_select_contact')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phone">{t('contact_phone')}</SelectItem>
                      <SelectItem value="Email">{t('contact_email')}</SelectItem>
                      <SelectItem value="WhatsApp">{t('contact_whatsapp')}</SelectItem>
                      <SelectItem value="SMS">{t('contact_sms')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
              </div>

              {/* Abuse Details */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-lg font-bold">{t('create_post_abuse_details')}</Label>
                <div>
                  <Label htmlFor="durationOfAbuse">{t('create_post_duration')}</Label>
                  <Select
                    required
                    value={formData.durationOfAbuse}
                    onValueChange={(value) => setFormData({ ...formData, durationOfAbuse: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('create_post_select_duration')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Less than 1 month">{t('dur_less_1m')}</SelectItem>
                      <SelectItem value="1-6 months">{t('dur_1_6m')}</SelectItem>
                      <SelectItem value="6 months - 1 year">{t('dur_6m_1y')}</SelectItem>
                      <SelectItem value="1-3 years">{t('dur_1_3y')}</SelectItem>
                      <SelectItem value="More than 3 years">{t('dur_more_3y')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="frequency">{t('create_post_freq')}</Label>
                  <Select
                    required
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('create_post_select_freq')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">{t('freq_daily')}</SelectItem>
                      <SelectItem value="Multiple times a week">{t('freq_multiple')}</SelectItem>
                      <SelectItem value="Weekly">{t('freq_weekly')}</SelectItem>
                      <SelectItem value="Monthly">{t('freq_monthly')}</SelectItem>
                      <SelectItem value="Occasionally">{t('freq_occasionally')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currentSituation">{t('create_post_curr_sit')}</Label>
                  <Textarea
                    id="currentSituation"
                    required
                    value={formData.currentSituation}
                    onChange={(e) => setFormData({ ...formData, currentSituation: e.target.value })}
                    placeholder={t('create_post_sit_placeholder')}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="culpritDescription">{t('create_post_culprit')}</Label>
                  <Textarea
                    id="culpritDescription"
                    required
                    value={formData.culpritDescription}
                    onChange={(e) => setFormData({ ...formData, culpritDescription: e.target.value })}
                    placeholder={t('create_post_culprit_placeholder')}
                    rows={3}
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
