# HAVEN: AI-Powered Covert Safety & Support Ecosystem

**Empowering Victims. Securing Privacy. Redefining Emergency Response.**

HAVEN is a comprehensive, privacy-first platform designed to provide a "Safe Haven" for women facing domestic violence, harassment, or traumatic situations. By combining **covert communication (Steganography)**, **Local AI (Ollama)**, and **Map Intelligence**, HAVEN bridges the gap between fear and action.

---

## 🚩 The Problem
Victims of domestic abuse and harassment often face a critical barrier: **Surveillance**.
- **Monitored Devices**: Perpetrators often check phones for SOS apps or distress messages.
- **Fear of Escalation**: Direct calls to authorities can be dangerous if overheard.
- **Mental Overload**: Traumatic situations make it difficult to provide structured reports for legal action.

## 🛡️ The HAVEN Solution
HAVEN provides a **dual-interface ecosystem** that looks innocent to an external observer but contains high-tech safety tools within:
1. **Covert SOS**: Send distress signals through innocent-looking social media posts via steganography.
2. **Private AI Support**: Local, offline-capable AI for emotional and legal guidance.
3. **Internal Severity Scoring**: Automatic prioritization of cases for specialized authority response.

---

## ⚙️ How It Works: The "Innocent Feed"
HAVEN utilizes **Least Significant Bit (LSB) Steganography** to hide critical SOS data (location, severity, and narrative) inside standard image files.

1. **Victim Interface**: The victim fills out a "Safe Haven" form. The AI (Mistral via Ollama) decomposes the raw input into a structured narrative.
2. **Covert Communication**: SOS metadata is encoded into an innocent-looking image (Nature, Pets, Food).
3. **Authority Decoding**: Authorities receive the post, extract the hidden metadata, and prioritize it on a live map based on AI-calculated severity.

---

## ✨ Core Features & Recent Enhancements

### 👩‍💻 Personal Care Assistant (Empathetic AI)
- **3D Interactive Avatar**: A friendly, animated 3D companion using Three.js (React Three Fiber) that provides a human-like presence.
- **Voice Interaction**: Full **Speech-to-Text** and **Text-to-Speech** support in **English, Hindi, and Tamil**, enabling eyes-free interaction.
- **Silent Risk Detection**: Discretely analyzes user messages to categorize distress (Low/Medium/High) internally to trigger proactive measures without alarming the user.
- **Optimized UI**: Fixed-height chat interface with independent scrolling for a smooth, app-like experience.

### ⚖️ Legal Advisor (Indian Context)
- **AI Expert Guidance**: Provides direct information on PWDVA (Domestic Violence), POCSO, POSH, and IPC sections (e.g., 498A).
- **Localized Education**: Accurate legal info provided in the user's preferred language (En, Hi, Ta).
- **Accessibility**: Independent scrolling layout ensuring legal disclaimers and input tools are always visible.

### 👮‍♂️ Map Intelligence & Authority Tools
- **Priority Mapping**: Live map with color-coded markers based on AI-analyzed severity (Red=High, Yellow=Medium, Green=Low).
- **Hot Zone Analysis**: Automatically identifies "Hot Zones" where repeat incidents occur, allowing authorities to plan long-term safety strategies.
- **Case Timeline**: Detailed history tracking for every SOS case from report to resolution.

---

## 🧠 Technical Architecture

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Animations**: Framer Motion, Lucide Icons
- **AI Engine**: Local Ollama (Mistral 7B) for privacy-first inference
- **Voice**: Web Speech API (Recognition & Synthesis)
- **3D**: Three.js, @react-three/fiber
- **Storage**: Secure Local Storage for offline capability

### File Structure
```bash
haven/
├── src/
│   ├── app/
│   │   ├── components/            # Reusable UI & Layouts
│   │   │   ├── FriendlyAvatar3D.tsx  # Interactive 3D Companion
│   │   │   ├── ui/                # Base UI Components (shadcn)
│   │   │   └── PinGuard.tsx       # Secure access for victims
│   │   ├── pages/                 # Main feature modules
│   │   │   ├── SupportChatPage.tsx   # Voice-enabled assistant (Voice + 3D)
│   │   │   ├── LawChatPage.tsx       # Expert Legal Advisor
│   │   │   ├── MapViewPage.tsx       # Admin Map Intelligence
│   │   │   ├── AuthorityDashboardPage.tsx # Case management
│   │   │   └── CreatePostPage.tsx    # Steganographic SOS form
│   │   ├── utils/                 # Core engine logic
│   │   │   ├── ai.ts              # Local AI (Ollama) Integration & Prompts
│   │   │   ├── i18n.ts            # High-performance localization (50kb+ strings)
│   │   │   └── safety.ts          # Emergency logic & Hot zone calculation
│   │   ├── types/                 # TypeScript interfaces (SOSCase, ChatMessage)
│   │   └── routes.ts              # Application navigation logic
│   ├── styles/                    # Global CSS & Tailwind themes
│   └── main.tsx                   # Entry point
├── .gitignore                     # Secure exclusions
├── vite.config.ts                 # Build configuration
└── README.md                      # Comprehensive Hackathon Documentation
```

---

## � Run Locally

1. **Install Ollama**: Download from [ollama.com](https://ollama.com).
2. **Pull Model**: `ollama pull mistral`.
3. **Install Repo**:
   ```bash
   npm install
   npm run dev
   ```

---

**HAVEN: Because safety should never be a sacrifice.**
