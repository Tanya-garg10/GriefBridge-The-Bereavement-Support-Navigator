# 🌉 GriefBridge — Safe & Compassionate Sanctuary

An offline-first & custom cloud-sync safe companion design supporting individuals navigating transitional challenges and bereavement. Built with **React 19, Vite, Tailwind CSS**, and a back-end dynamic **Express** gateway integrated with the **Gemini 2.5/Flash** sentiment modeling engine.

GriefBridge provides a secure, anonymous platform for processing grief through journaling, wellness tracking, peer support forums, and guided breathing exercises. All sensitive operations are server-side to protect user privacy and prevent data leakage.

## 🌟 Key Core Features & Sanctuary Modules

### 1. 📝 AI Dynamic Sentiment Journal
- **Anonymous Self-Expression**: Type deep, emotional texts or simulate microphone recording anonymously.
- **Server-Side Sentiment Mapping**: Uses the Google Gemini API to analyze primary/secondary emotional percentages (sadness, anxious thoughts, anger, hope, acceptance) securely on the server-side.
- **Somatic Response Validation**: Delivers custom feedback to help soothe physical fatigue and mental load without artificial filters or generic "AI slop."

### 2. 🏺 Memory & Comfort Jar (New Feature!)
- **Continuing Bonds**: Safely deposit comforting flashbacks, small steps of routine self-care (daily walks, breathing sessions), or tiny sparks/glimmers of hope.
- **Micro-Categorization**: Multi-tab live filters with beautiful sliding hover animations for active categorization.
- **Daily Challenge Prompt**: In-module soothing prompts recommending daily light reminders to strengthen the recovery baseline.

### 3. 🧘 Somatic Box-Breathing Orb
- **Vagus Nerve Grounding**: An interactive visual orb matching dynamic inhaling, holding, and exhaling timelines (4s-4s-4s) designed to quiet the nervous system.
- **Color Sync & Visual Ripples**: Soft aesthetic palettes that expand and fade relative to state phases. Includes automatic recovery cycle counters.

### 4. 🗺️ Support Resource Coordinate Map
- **Local NGO Directory**: A completely vectorized coordinates node directory modeling certified counselors, local bereavement support groups, and clinical aid resources.
- **Interactive Geospatial Range**: Dynamic distance sliders (0-25 miles) instantly filtering local support coordinates relative to the base center origin (Seattle core core grid model).

### 5. 💬 Anonymous Comfort Forums
- **Sanctuary Board**: Moderated peer forums with categorical tags (Somatic, Memorial, Shared Support, Coping Strategy).
- **Ethics Safe Rail**: Built-in strict code of conduct highlighting secure encryption, absolute pseudonym protection, and supportive guidance.

## 📂 Architecture & Directory Structure

GriefBridge is built on a compliant full-stack single container design:

```filepath
├── .env.example                # Templates for system secrets
├── package.json                # Project script commands & dependencies
├── server.ts                   # Express server config, API routing & Vite middleware
├── firestore.rules             # Safety access laws for Google Firebase
├── firebase-blueprint.json     # Firestore document database schema models
├── vite.config.ts              # Bundling parameters
├── index.html                  # Core single-page entry
└── src/                        # Front-end codebases
    ├── App.tsx                 # Core layout router & state setups
    ├── index.css               # Clean styling configuration (Sages, Slates, Muted Rose)
    ├── main.tsx                # Client bundle mount point
    ├── types.ts                # TypeScript strict interface contracts
    └── components/             # Abstracted modular UI widgets
        ├── Dashboard.tsx       # Core companion index, wellness logging, and timeline checks
        ├── Journal.tsx         # AI Expression Diary & sentiment score mapping
        ├── MemoryJar.tsx       # Memory Jar continuing bonds tracker
        ├── BreathingExercise.tsx # Guided somatics / Vagus orb module
        ├── ResourceMap.tsx     # Coordinate directory mapping (Therapists, clinical NGOs)
        ├── Forum.tsx           # Kind peer support circle board
        ├── Profile.tsx         # Safety assess pseudonym alignment setup
        ├── Navigation.tsx      # Sidebar layouts & tab states
        └── LandingPage.tsx     # Introducing dashboard screens
```

## 🛠️ Step-by-Step Local Setup

To launch GriefBridge on your local computer, follow these simple terminal configurations:

### 1. Prerequisites
Ensure you have the latest **Node.js** version (v18 or above) and **npm** installed on your workstation.

### 2. Copy the Environment Variables
Duplicate `.env.example` to create a local `.env` configuration file:
```bash
cp .env.example .env
```
Fill in your secrets:
* **`GEMINI_API_KEY`**: Obtain your API key from [Google AI Studio](https://aistudio.google.com/).
* **`APP_URL`**: Set this to `http://localhost:3000` for local development.

### 3. Install Dependencies
Run npm install to mount all verified dependencies:
```bash
npm install
```

### 4. Run Dev Environment
Launch the concurrent developer preview with live state synchronization:
```bash
npm run dev
```
Open your browser to `http://localhost:3000` to interact with your secure sandbox.

### 5. Build for Production
Compile static Vite client & bundle the Node/Express server via esbuild:
```bash
npm run build
npm start
```

## 🔒 Security, Privacy, & Server-Side Safety

- **No Front-End Leakage**: Since the Gemini model calls are mapped strictly inside `server.ts`, your `GEMINI_API_KEY` is never transmitted to the browser's DevTools network panel.
- **Anonymity Assured**: Individual assessments and pseudonym coordinates are completely locked inside sandboxed browser memory (`localStorage` state persistence) or private Firestore instances, eliminating metadata tracking.
- **Sensitive Config Files**: Firebase configuration files are excluded from version control to prevent accidental secret exposure.

## 📋 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

GriefBridge is open source and free to use, modify, and distribute under the terms of the MIT License. The software is provided as-is for support, educational, and mental wellness purposes.

## ❤️ Contributing

GriefBridge is built on the belief that safe technology, clean typography, and spacious layouts can help users take small step recovery bounds. Contributions and feedback are welcome.

To maintain code quality, run:
```bash
npm run lint
```

## 🤝 Get Involved

If you have questions, suggestions, or would like to contribute, please open an issue or reach out to the maintainers. Your feedback helps make GriefBridge more supportive and accessible to everyone navigating grief and life transitions.

