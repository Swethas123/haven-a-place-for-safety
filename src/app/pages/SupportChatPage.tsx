import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Send, Phone, Shield, Heart, Loader2, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { SafeHavenIllustration } from '../components/Illustrations';
import { FriendlyAvatar3D } from '../components/FriendlyAvatar3D';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { generateSupportResponse, analyzeDistressLevel } from '../utils/ai';
import { useTranslation } from '../utils/i18n';
import { ChatMessage } from '../types';
import { isVictimAuthenticated } from '../utils/storage';

const DANGER_KEYWORDS = ['hurt', 'attack', 'beaten', 'violence', 'help', 'kill'];

function containsDanger(text: string): boolean {
  const lower = text.toLowerCase();
  return DANGER_KEYWORDS.some(kw => lower.includes(kw));
}

async function getCurrentLocation(): Promise<{ lat: number; lng: number; address: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 0, lng: 0, address: 'Unknown location' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          if (data.display_name) address = data.display_name;
        } catch { /* use coords as fallback */ }
        resolve({ lat, lng, address });
      },
      () => resolve({ lat: 0, lng: 0, address: 'Unknown location' })
    );
  });
}

// Add type definition for Web Speech API since it might be missing in default TS types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function SupportChatPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const recognitionRef = useRef<any>(null);
  const greetingSpokenRef = useRef<string | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert("Microphone access was denied. Please check your browser settings.");
        }
        setIsListening(false);
      };
      recognitionRef.current.onresult = (event: any) => {
        console.log('Speech recognition result received');
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          console.log('Transcribed text:', transcript);
          handleSendMessage(transcript);
        } else {
          console.warn('Speech recognized but transcript is empty');
        }
      };
    }
  }, []);

  // Update recognition language when application language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Initialize greeting
  useEffect(() => {
    const greeting = t('support_chat_hello');
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: Date.now(),
      },
    ]);

    // Auto-speak greeting if language changed or just loaded
    if (greetingSpokenRef.current !== language) {
      // Small delay to ensure voices are loaded
      const timer = setTimeout(() => {
        speak(greeting);
        greetingSpokenRef.current = language;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [language]); // Re-run when language changes

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const speak = (text: string) => {
    if (!speechEnabled || !synthesisRef.current) return;

    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);

    // Find a natural voice for the current language
    const voices = synthesisRef.current.getVoices();
    let selectedVoice = null;

    if (language === 'hi') {
      // Priority: Hindi (India) -> Any Hindi
      selectedVoice = voices.find(v => v.lang.startsWith('hi-IN')) ||
        voices.find(v => v.lang.startsWith('hi'));
    } else if (language === 'ta') {
      // Priority: Tamil (India) -> Any Tamil
      selectedVoice = voices.find(v => v.lang.startsWith('ta-IN')) ||
        voices.find(v => v.lang.startsWith('ta'));
    } else {
      // Priority: English (India) -> English (UK) -> Any English
      selectedVoice = voices.find(v => v.lang.startsWith('en-IN')) ||
        voices.find(v => v.lang.startsWith('en-GB')) ||
        voices.find(v => v.lang.startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Explicitly set the lang property to help the browser choose the right engine
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';

    // Set properties for a calm, friendly voice
    utterance.rate = 0.85; // Slower for calmness
    utterance.pitch = 1.0; // Natural pitch

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      console.error('Speech synthesis error');
      setIsSpeaking(false);
    };

    synthesisRef.current.speak(utterance);
  };

  // Ensure voices are loaded (browsers often load them asynchronously)
  useEffect(() => {
    if (synthesisRef.current) {
      const loadVoices = () => synthesisRef.current?.getVoices();
      loadVoices();
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isVictimAuthenticated()) {
      navigate('/victim-login');
      return;
    }
    scrollToBottom();
  }, [messages, navigate]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    // 1. Add user message immediately for instant feedback
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    // Danger detection — runs in background, does not block UI or AI response
    if (containsDanger(messageText)) {
      getCurrentLocation().then(({ lat, lng, address }) => {
        // Read user profile for real name
        let userName = 'Anonymous';
        try {
          const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
          if (profile?.name) userName = profile.name;
        } catch { /* fallback to Anonymous */ }

        // Build alert in the exact shape the admin dashboard renders
        const newAlert = {
          id: Date.now().toString(),
          severity: 'High',
          alert: `🚨 Emergency Detected via Chat — ${userName}`,
          emotion: messageText,
          location: { lat, lng },
          address,
          time: new Date().toISOString(),
          response: 'critical',   // triggers "Police Dispatch" badge in dashboard
        };

        // Prepend to adminAlerts (keep existing ones)
        const existing = JSON.parse(localStorage.getItem('adminAlerts') || '[]');
        localStorage.setItem('adminAlerts', JSON.stringify([newAlert, ...existing]));

        // Notify same-tab listeners (dashboard uses this to reload)
        window.dispatchEvent(new Event('storage'));

        // Background n8n webhook — fire and forget
        fetch('http://localhost:5678/webhook/sos-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            severity: 'High',
            emotion: messageText,
            location: { lat, lng },
            address,
          }),
        }).catch(() => {});
      });
    }

    // 2. Process AI response
    try {
      const [riskLevel, response] = await Promise.all([
        analyzeDistressLevel(messageText),
        generateSupportResponse(messageText, language)
      ]);

      // Update the user message with the risk level (internal)
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? { ...msg, riskLevel } : msg
      ));

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      speak(response);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col">
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 z-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-4 flex-1 flex flex-col max-w-7xl h-screen max-h-screen overflow-hidden">
        <div className="shrink-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:bg-purple-100 mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('support_chat_back')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden mb-4">
          {/* Left Column: Info & Tips */}
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar hidden lg:block">
            <Card className="border-purple-100 shadow-sm bg-white/80 backdrop-blur-sm shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  {t('support_chat_self_care')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 italic">
                  {t('support_chat_tip')}
                </p>
              </CardContent>
            </Card>

            <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-100 shadow-xl shadow-purple-100/50 shrink-0">
              <SafeHavenIllustration className="w-full h-auto drop-shadow-xl" />
            </div>

            <Card className="border-purple-100 shadow-sm bg-white/80 backdrop-blur-sm shrink-0">
              <CardHeader className="pb-3 border-b border-purple-50">
                <CardTitle className="text-base font-semibold text-purple-800">{t('support_chat_shortcuts')}</CardTitle>
                <CardDescription className="text-xs">
                  {t('support_chat_shortcuts_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 px-3">
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'support_chat_prompt_overwhelmed' },
                    { key: 'support_chat_prompt_encouragement' },
                    { key: 'support_chat_prompt_scared' },
                    { key: 'support_chat_prompt_plan' },
                  ].map((item) => (
                    <Button
                      key={item.key}
                      variant="outline"
                      className="justify-start text-xs h-auto py-2.5 px-3 text-left border-purple-50 hover:bg-purple-50 hover:text-purple-700 transition-colors bg-white/50 backdrop-blur-none whitespace-normal"
                      onClick={() => handleSendMessage(t(item.key))}
                    >
                      {t(item.key)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50/80 backdrop-blur-sm border-red-200 shadow-sm overflow-hidden shrink-0">
              <div className="flex">
                <div className="w-1.5 bg-red-400"></div>
                <CardContent className="py-4 px-4">
                  <p className="text-xs text-red-900 leading-relaxed font-bold mb-2 uppercase tracking-wider text-[10px]">
                    {t('support_chat_crisis_title')}
                  </p>
                  <div className="space-y-2">
                    <p className="text-[12px] text-red-800">
                      <span className="font-bold">{t('support_chat_ncw')}</span> 7827-170-170
                    </p>
                    <p className="text-[12px] text-red-800">
                      <span className="font-bold">{t('support_chat_emergency')}</span> 112 / 100
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0">
            <Card className="shadow-lg flex-1 flex flex-col overflow-hidden border-purple-100 bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="py-3 bg-white/80 border-b shrink-0">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <FriendlyAvatar3D isSpeaking={isSpeaking} className="w-12 h-12" />
                      {isSpeaking && (
                        <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75"></div>
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-purple-900 font-bold text-base leading-tight">{t('support_chat_header')}</span>
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Your Supportive Friend</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${speechEnabled ? 'text-purple-600' : 'text-gray-400'}`}
                      onClick={() => {
                        if (speechEnabled) stopSpeaking();
                        setSpeechEnabled(!speechEnabled);
                      }}
                    >
                      {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    <Badge variant="outline" className="text-[10px] font-normal text-green-600 bg-green-50 border-green-200">
                      {t('support_chat_confidential')}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 scroll-smooth">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex flex-col max-w-[85%]">
                        <div className="flex items-end gap-2">
                          {message.role === 'assistant' && (
                            <FriendlyAvatar3D isSpeaking={false} className="w-8 h-8 shrink-0 mb-1" />
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user'
                              ? 'bg-purple-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                              }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-[10px] mt-2 font-medium opacity-70 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start items-end gap-2">
                      <FriendlyAvatar3D isSpeaking={false} className="w-8 h-8 shrink-0 mb-1" />
                      <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 rounded-bl-none">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4 bg-white shrink-0">
                  <div className="flex gap-2 max-w-4xl mx-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-xl h-10 w-10 shrink-0 ${isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-gray-400 hover:bg-purple-50 hover:text-purple-600'}`}
                      onClick={toggleListening}
                      disabled={loading}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t('support_chat_placeholder')}
                      className="flex-1 border-gray-200 focus-visible:ring-purple-500 rounded-xl"
                      disabled={loading}
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || loading}
                      className="bg-purple-600 hover:bg-purple-700 rounded-xl px-4 shadow-md shadow-purple-200 transition-all hover:scale-105 active:scale-95"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 text-center">
                    {t('support_chat_confidential')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
