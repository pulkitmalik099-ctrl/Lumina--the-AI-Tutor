# Lumina: Interactive LLM & Agentic AI Study Tutor 🔮

Lumina is a premium, voice-enabled web application and AI study tutor designed to help you master **Large Language Models (LLMs)** and **Agentic AI** in 30 days. It simplifies complex mathematical and algorithmic concepts into plain English using interactive animations, code snippets, and audio-visual explanations.

---

## 🚀 Key Features

*   **30-Day Curated Curriculum**: A step-by-step roadmap taking you from basic Tokenization all the way to Multi-Agent production architectures.
*   **Interactive Algorithmic Visualizations**:
    *   *Day 1 (Tokenizer)*: Watch strings break into subwords and map to Token IDs as you type.
    *   *Day 3 (Vector Space)*: Hover over semantic groupings and run vector math (`King - Man + Woman = Queen`).
    *   *Day 6 (Self-Attention)*: Hover over a dynamic correlation matrix to see how tokens weigh their relationships.
    *   *Day 10 (HNSW Indexing)*: Animate graph routing queries hopping across index layers.
    *   *Day 15 (ReAct loops)*: Step through active loops (Thought ➔ Action ➔ Observation).
*   **Voice-Enabled AI Tutor Chatbot**: Ask any question about LLMs using your microphone; Lumina transcribes your voice and responds using text and audio synthesis.
*   **Hindi Language Mode (हिन्दी ऑडियो)**: Switch the audio voice dropdown to Hindi (`Google हिन्दी` / system voices). The curriculum read-aloud adjusts to Hindi translations, and speech recognition configures to transcribe spoken Hindi.
*   **D-ID Talking Avatar Integration**: Paste your D-ID API Key and a link to your face image in the sidebar settings. Lumina will dynamically animate your face speaking the daily lectures or chatbot answers.

---

## 🛠️ Technology Stack

*   **Frontend**: Vanilla HTML5, ES6+ JavaScript, CSS3
*   **Styling**: Premium Cyberpunk Dark Theme (with Glassmorphic panels, neon indicators, and interactive micro-animations)
*   **Audio Engines**: Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`)
*   **Deep Learning Avatar**: D-ID Talks API Integration

---

## 📂 Project Structure

```bash
lumina-tutor/
│
├── index.html        # Main dashboard viewport, settings panels, & layout skeleton
├── style.css         # Custom cyberpunk variables, responsive layout grids, & keyframes
├── curriculum.js     # Structured 30-day lesson database, audio transcripts, & translations
├── visualizer.js     # SVG/Canvas render engines for interactive algorithmic modules
├── app.js            # Controller hook (State manager, TTS/STT, API connectors)
└── README.md         # Documentation
```

---

## 🚦 Quick Start Guide

### 1. Run Locally
You do not need to install any heavy packages or compile frameworks. 
Simply open the local folder and double-click:
👉 **`index.html`** to launch the dashboard inside a browser (Google Chrome or Microsoft Edge recommended for voice features).

### 2. Live Conversations (Gemini / OpenAI API)
By default, the AI Chatbot runs in **Mock Mode** using mapped keywords. 
To unlock live conversations:
*   Paste your **Google Gemini API Key** (starts with `AIza...`) or **OpenAI API Key** into the **Optional API Settings** field in the sidebar.

### 3. Setup Your Face (D-ID Avatar)
To have your own face explain concepts:
1. Register for an account on [D-ID](https://www.d-id.com/).
2. Retrieve your D-ID API Key and paste it into the **D-ID API Avatar Settings** field in the bottom-left sidebar.
3. Paste a link to your profile photo (uploaded to Imgur, Discord, or Unsplash) in the face image input box.
4. Click **"Listen to Explanation"** or speak to the chatbot!
