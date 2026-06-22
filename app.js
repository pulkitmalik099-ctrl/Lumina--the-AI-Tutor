// Main Application Logic for Lumina Tutor

// Global state variables
let currentDay = 1;
let voices = [];
let speechSynth = window.speechSynthesis;
let recognition = null;
let isRecording = false;
let speakResponses = true;
let focusMode = localStorage.getItem("lumina:focusMode") === "true";
let activeMobileTab = localStorage.getItem("lumina:mobileTab") || "learn";

// Progress schema: { completedDays: [], currentDay: 1, lastVisited: "" }
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("lumina:progress")) || { completedDays: [], currentDay: 1, lastVisited: "" };
  } catch { return { completedDays: [], currentDay: 1, lastVisited: "" }; }
}

function saveProgress(progress) {
  progress.lastVisited = new Date().toISOString();
  localStorage.setItem("lumina:progress", JSON.stringify(progress));
}

let progress = loadProgress();
let completedDays = progress.completedDays;

// Instantiate visualizer
let visualizer = null;

// Initialize app when DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  visualizer = new LuminaVisualizer("visualizer-canvas");

  loadSavedKeys();
  currentDay = progress.currentDay || 1;
  initRoadmap();
  initVoices();
  initSpeechRecognition();
  loadDay(currentDay);
  setupEventListeners();
  updateProgress();
  initTabs();
  applyFocusMode(focusMode);
  initMobileTabs();
  setTutorStatus("idle");

  // Initialize D-ID fallback avatar picture
  const didImageInput = document.getElementById("did-image-input");
  const fallbackImg = document.getElementById("avatar-fallback-img");
  if (didImageInput && fallbackImg) {
    fallbackImg.style.backgroundImage = `url('${didImageInput.value}')`;
    didImageInput.addEventListener("change", () => {
      fallbackImg.style.backgroundImage = `url('${didImageInput.value}')`;
    });
  }

  // Register PWA Service Worker for offline mobile support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then((reg) => console.log("Lumina Service Worker registered successfully:", reg.scope))
      .catch((err) => console.error("Service Worker registration failed:", err));
  }
});

// Load API keys from local storage securely
function loadSavedKeys() {
  const apiKeyInput = document.getElementById("api-key-input");
  const didKeyInput = document.getElementById("did-key-input");
  const didImageInput = document.getElementById("did-image-input");

  if (apiKeyInput) {
    apiKeyInput.value = localStorage.getItem("lumina_api_key") || "";
    apiKeyInput.addEventListener("input", (e) => {
      localStorage.setItem("lumina_api_key", e.target.value.trim());
    });
  }
  if (didKeyInput) {
    didKeyInput.value = localStorage.getItem("lumina_did_key") || "";
    didKeyInput.addEventListener("input", (e) => {
      localStorage.setItem("lumina_did_key", e.target.value.trim());
    });
  }
  if (didImageInput) {
    didImageInput.value = localStorage.getItem("lumina_did_image") || didImageInput.value;
    didImageInput.addEventListener("input", (e) => {
      localStorage.setItem("lumina_did_image", e.target.value.trim());
    });
  }
}

// Setup sidebar roadmap navigation
function initRoadmap() {
  const listEl = document.getElementById("roadmap-list");
  listEl.innerHTML = "";

  for (let d = 1; d <= 30; d++) {
    const item = curriculumData[d];
    if (!item) continue;

    const isCompleted = completedDays.includes(d);
    const isCurrentDay = d === currentDay;

    const node = document.createElement("button");
    node.className = `day-node${isCurrentDay ? ' active' : ''}${isCompleted ? ' completed' : ''}`;
    node.id = `day-node-${d}`;
    node.dataset.day = d;
    node.setAttribute("aria-label", `Day ${d}: ${item.title}${isCompleted ? ' (completed)' : ''}`);

    node.innerHTML = `
      <div class="day-badge">${isCompleted ? "✓" : d}</div>
      <div class="day-info">
        <span class="day-title">${item.title}</span>
        <span class="day-cat">${item.category}</span>
      </div>
    `;

    node.addEventListener("click", () => {
      document.querySelectorAll(".day-node").forEach(el => el.classList.remove("active"));
      node.classList.add("active");
      loadDay(d);
    });

    listEl.appendChild(node);
  }
}

// Render selected day data
function loadDay(day) {
  currentDay = day;
  const item = curriculumData[day];
  if (!item) return;

  updateTopbarLabel(day);
  progress.currentDay = day;
  saveProgress(progress);

  // Update Category Badge
  document.getElementById("topic-category-badge").innerText = item.category;

  // Convert markdown-like concept to HTML
  const conceptEl = document.getElementById("concept-content");
  conceptEl.innerHTML = parseMarkdown(item.concept);

  // Set Code Snippet
  const codeEl = document.getElementById("code-snippet-box");
  codeEl.innerText = item.code;

  // Launch visualizer module
  visualizer.setMode(item.visualizerMode);

  // Init quiz for this day
  initQuiz(day);

  // Update day-scoped suggestion chips
  renderSuggestionChips(day);

  // Stop any active speaking
  if (speechSynth) speechSynth.cancel();
}

// Clean and simple markdown parser
function parseMarkdown(md) {
  if (!md) return "";
  let html = md;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Inline Code
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  // Wrap list items
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  // Clean double lists
  html = html.replace(/<\/ul>\s*<ul>/gim, '');
  
  // Newlines to Paragraphs
  html = html.split(/\n\n+/).map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<ol')) {
      return p;
    }
    return `<p>${p.trim().replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

// ── Quiz (Phase 5) ────────────────────────────────────────────────────────────

let quizState = { qIndex: 0, correct: 0, answered: 0, questions: [] };

function initQuiz(day) {
  const panel = document.getElementById("quiz-panel");
  const data = curriculumData[day];
  if (!panel) return;

  if (!data?.quiz?.length) { panel.hidden = true; return; }

  // Load prior best from storage
  const prior = JSON.parse(localStorage.getItem(`lumina:quiz:${day}`) || "null");
  const questions = data.quiz;
  quizState = { qIndex: 0, correct: 0, answered: 0, questions, day };

  panel.hidden = false;
  const scoreEl = document.getElementById("quiz-score");
  if (prior) scoreEl.textContent = `Best: ${prior.correct}/${prior.total}`;
  else scoreEl.textContent = "";

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const { questions, qIndex } = quizState;
  const q = questions[qIndex];
  if (!q) return;

  document.getElementById("quiz-question").textContent = `Q${qIndex + 1}/${questions.length}: ${q.q}`;
  document.getElementById("quiz-feedback").textContent = "";
  document.getElementById("quiz-feedback").className = "quiz-feedback";
  const nextBtn = document.getElementById("quiz-next-btn");
  if (nextBtn) nextBtn.hidden = true;

  const optionsEl = document.getElementById("quiz-options");
  optionsEl.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = opt;
    btn.setAttribute("role", "listitem");
    btn.addEventListener("click", () => handleQuizAnswer(i));
    optionsEl.appendChild(btn);
  });
}

function handleQuizAnswer(selectedIndex) {
  const { questions, qIndex } = quizState;
  const q = questions[qIndex];
  const buttons = document.querySelectorAll(".quiz-option-btn");
  const isCorrect = selectedIndex === q.answerIndex;

  quizState.answered++;
  if (isCorrect) quizState.correct++;

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answerIndex) btn.classList.add("correct");
    else if (i === selectedIndex && !isCorrect) btn.classList.add("wrong");
  });

  const feedbackEl = document.getElementById("quiz-feedback");
  feedbackEl.textContent = (isCorrect ? "✓ Correct! " : "✗ Not quite. ") + q.explain;
  feedbackEl.className = "quiz-feedback show";

  const nextBtn = document.getElementById("quiz-next-btn");
  const isLastQuestion = qIndex >= questions.length - 1;

  if (isLastQuestion) {
    saveQuizResult();
    showQuizResult();
  } else {
    if (nextBtn) { nextBtn.hidden = false; nextBtn.onclick = nextQuizQuestion; }
  }
}

function nextQuizQuestion() {
  quizState.qIndex++;
  renderQuizQuestion();
}

function saveQuizResult() {
  const { correct, questions, day } = quizState;
  const prior = JSON.parse(localStorage.getItem(`lumina:quiz:${day}`) || "null");
  const total = questions.length;
  const best = prior ? Math.max(prior.correct, correct) : correct;
  localStorage.setItem(`lumina:quiz:${day}`, JSON.stringify({ correct: best, total }));
  document.getElementById("quiz-score").textContent = `Best: ${best}/${total}`;
}

function showQuizResult() {
  const { correct, questions } = quizState;
  const total = questions.length;
  const passed = correct >= Math.ceil(total * 2 / 3);

  const feedbackEl = document.getElementById("quiz-feedback");
  const banner = document.createElement("div");
  banner.className = passed ? "quiz-pass-banner" : "quiz-feedback show";

  if (passed) {
    banner.textContent = `🎉 Passed! ${correct}/${total} — Day marked complete.`;
    markDayComplete(quizState.day);
  } else {
    banner.textContent = `Score: ${correct}/${total}. Need ${Math.ceil(total * 2 / 3)}/${total} to pass. Try again!`;
  }

  feedbackEl.after(banner);

  const nextBtn = document.getElementById("quiz-next-btn");
  if (nextBtn) {
    nextBtn.hidden = false;
    nextBtn.textContent = "Retry Quiz";
    nextBtn.onclick = () => { banner.remove(); quizState.qIndex = 0; quizState.correct = 0; quizState.answered = 0; renderQuizQuestion(); };
  }
}

// ── Tab control (Playground / Code) ──────────────────────────────────────────

function initTabs() {
  document.getElementById("tab-playground").addEventListener("click", () => switchTab("playground"));
  document.getElementById("tab-code").addEventListener("click", () => switchTab("code"));
}

function switchTab(name) {
  const tabs = { playground: "tab-playground", code: "tab-code" };
  const panes = { playground: "playground-tab-pane", code: "code-tab-pane" };
  Object.keys(tabs).forEach(k => {
    const isActive = k === name;
    document.getElementById(tabs[k]).classList.toggle("active", isActive);
    document.getElementById(tabs[k]).setAttribute("aria-selected", String(isActive));
    document.getElementById(panes[k]).classList.toggle("active", isActive);
  });
}

// ── Focus mode ────────────────────────────────────────────────────────────────

function applyFocusMode(on) {
  focusMode = on;
  document.querySelector(".app-container").classList.toggle("focus-mode", on);
  const btn = document.getElementById("btn-focus-mode");
  if (btn) btn.classList.toggle("active", on);
  localStorage.setItem("lumina:focusMode", String(on));
}

// ── Prev / Next day ───────────────────────────────────────────────────────────

function goToDay(day) {
  const clamped = Math.max(1, Math.min(30, day));
  document.querySelectorAll(".day-node").forEach(el => el.classList.remove("active"));
  const node = document.getElementById(`day-node-${clamped}`);
  if (node) node.classList.add("active");
  loadDay(clamped);
  updateTopbarLabel(clamped);
}

function updateTopbarLabel(day) {
  const el = document.getElementById("topbar-day-label");
  if (el) el.textContent = `Day ${day}`;
}

// ── Mobile three-tab navigation ───────────────────────────────────────────────

function initMobileTabs() {
  const tabBar = document.getElementById("mobile-tab-bar");
  if (!tabBar) return;
  tabBar.querySelectorAll(".mobile-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      switchMobileTab(tab);
    });
  });
  switchMobileTab(activeMobileTab);
}

function switchMobileTab(tab) {
  activeMobileTab = tab;
  localStorage.setItem("lumina:mobileTab", tab);

  const sidebar = document.querySelector(".sidebar");
  const workspace = document.querySelector(".workspace");
  const chat = document.querySelector(".chat-pane");

  [sidebar, workspace, chat].forEach(el => el && el.classList.remove("mobile-active"));
  document.querySelectorAll(".mobile-tab-btn").forEach(b => b.classList.remove("active"));

  const map = { lessons: sidebar, learn: workspace, tutor: chat };
  if (map[tab]) map[tab].classList.add("mobile-active");

  const btn = document.querySelector(`.mobile-tab-btn[data-tab="${tab}"]`);
  if (btn) btn.classList.add("active");
}

// ── Setup Event Listeners
function setupEventListeners() {
  // TTS Button
  document.getElementById("btn-play-topic").addEventListener("click", () => {
    const item = curriculumData[currentDay];
    if (item && item.audioText) {
      speakText(item.audioText);
    }
  });

  // Copy Code Button
  document.getElementById("btn-copy-code").addEventListener("click", () => {
    const code = document.getElementById("code-snippet-box").innerText;
    navigator.clipboard.writeText(code).then(() => {
      const copyBtn = document.getElementById("btn-copy-code");
      copyBtn.innerText = "Copied!";
      setTimeout(() => copyBtn.innerText = "Copy", 1500);
    });
  });

  // Toggle Speak Responses
  const replyToggle = document.getElementById("btn-audio-reply-toggle");
  replyToggle.addEventListener("click", () => {
    speakResponses = !speakResponses;
    replyToggle.classList.toggle("active", speakResponses);
    replyToggle.setAttribute("aria-pressed", String(speakResponses));
  });

  // Send Message Button
  document.getElementById("btn-send-message").addEventListener("click", sendMessage);
  document.getElementById("chat-input-text").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Mic Button
  document.getElementById("btn-mic-toggle").addEventListener("click", toggleVoiceRecording);

  // TTS pause / resume
  const pauseBtn = document.getElementById("btn-pause-tts");
  const resumeBtn = document.getElementById("btn-resume-tts");
  if (pauseBtn) pauseBtn.addEventListener("click", () => {
    if (speechSynth?.speaking) {
      speechSynth.pause();
      pauseBtn.hidden = true;
      if (resumeBtn) resumeBtn.hidden = false;
      setTutorStatus("idle");
    }
  });
  if (resumeBtn) resumeBtn.addEventListener("click", () => {
    if (speechSynth?.paused) {
      speechSynth.resume();
      resumeBtn.hidden = true;
      if (pauseBtn) pauseBtn.hidden = false;
      setTutorStatus("speaking");
    }
  });

  // Mark complete & reset progress
  const markCompleteBtn = document.getElementById("btn-mark-complete");
  if (markCompleteBtn) markCompleteBtn.addEventListener("click", () => markDayComplete(currentDay));
  const resetBtn = document.getElementById("btn-reset-progress");
  if (resetBtn) resetBtn.addEventListener("click", resetProgress);

  // Focus mode toggle
  const focusBtn = document.getElementById("btn-focus-mode");
  if (focusBtn) focusBtn.addEventListener("click", () => applyFocusMode(!focusMode));

  // Prev / Next day buttons
  const prevBtn = document.getElementById("btn-prev-day");
  const nextBtn = document.getElementById("btn-next-day");
  if (prevBtn) prevBtn.addEventListener("click", () => goToDay(currentDay - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goToDay(currentDay + 1));

  // Keyboard arrow keys for day navigation (skip when typing in inputs)
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (e.key === "ArrowLeft") goToDay(currentDay - 1);
    if (e.key === "ArrowRight") goToDay(currentDay + 1);
  });
}

// Populate system voices
function initVoices() {
  if (!speechSynth) return;
  
  const populate = () => {
    voices = speechSynth.getVoices();
    const select = document.getElementById("voice-select");
    select.innerHTML = "";

    voices.forEach((v, idx) => {
      // Pick English and Hindi voices
      if (v.lang.startsWith("en") || v.lang.startsWith("hi")) {
        const option = document.createElement("option");
        option.value = idx;
        option.innerText = `${v.name} (${v.lang})`;
        select.appendChild(option);
      }
    });
  };

  populate();
  if (speechSynth.onvoiceschanged !== undefined) {
    speechSynth.onvoiceschanged = populate;
  }
}

// Simple English-to-Hindi mapping for the daily audio lectures
const hindiDailyLectures = {
  1: "डे 1 में आपका स्वागत है। आज हम टोकन्स के बारे में सीख रहे हैं। टोकन भाषा मॉडल का बुनियादी घटक है। चूंकि कंप्यूटर केवल नंबरों को समझते हैं, इसलिए हमें वाक्यों को छोटे टुकड़ों में काटना पड़ता है जिन्हें टोकन कहा जाता है।",
  2: "डे 2. आज हम कवर कर रहे हैं कि टोकन कैसे संग्रहीत और संसाधित होते हैं। बाइट-पेयर एनकोडिंग जैसे टोकनाइज़ेशन एल्गोरिदम सामान्य उप-शब्दों की एक शब्दावली बनाते हैं जो स्ट्रिंग्स को नंबरों से मैप करते हैं।",
  3: "डे 3. हम एम्बेडिंग के बारे में चर्चा कर रहे हैं। एम्बेडिंग शब्दों के अर्थ को एक विशाल बहु-आयामी कमरे में निर्देशांक (कॉर्डिनेट्स) के रूप में दर्शाती है। बिल्ली और कुत्ते जैसे समान शब्द पास-पास होते हैं।",
  4: "डे 4. वर्ड टू वेक जैसे स्टेटिक एम्बेडिंग शब्दों को अकेले दर्शाते हैं, जबकि आधुनिक ट्रांसफॉर्मर एम्बेडिंग संदर्भ के आधार पर अपने मूल्यों को बदलते हैं।",
  5: "डे 5. ट्रांसफॉर्मर ने समानांतर पठन (पैरेलल रीडिंग) शुरू करके एआई में क्रांति ला दी। एक-एक करके पढ़ने के बजाय, ट्रांसफॉर्मर एक ही बार में पूरे पैराग्राफ को देखता है।",
  6: "डे 6. सेल्फ-अटेंशन गणितीय भार की गणना करता है जो दर्शाता है कि वाक्य में शब्द एक-दूसरे से कैसे संबंधित हैं। उदाहरण के लिए, यह समझने में मदद करता है कि 'वह' शब्द बिल्ली से जुड़ा है या सड़क से।",
  7: "डे 7. ट्रेनिंग के तीन चरण हैं: प्री-ट्रेनिंग वेब टेक्स्ट पर शब्द की भविष्यवाणी सिखाती है। सुपरवाइज्ड फाइन-ट्यूनिंग निर्देशों का पालन करना सिखाती है। और संरेखण (अलाइनमेंट) मॉडल को सुरक्षित बनाता है।",
  8: "डे 8. वेक्टर डेटाबेस एलएलएम के लिए दीर्घकालिक स्मृति (लॉन्ग-टर्म मेमोरी) के रूप में कार्य करते हैं। साधारण रिलेशनल डेटाबेस फ्लोट्स की सूची में तेजी से खोज नहीं कर सकते हैं।",
  9: "डे 9. एक वेक्टर रिकॉर्ड में फ्लोट ऐरे एम्बेडिंग, एक विशिष्ट आईडी, फ़ाइल नाम जैसे मेटाडेटा और मूल पाठ खंड शामिल होते हैं।",
  10: "डे 10. लाखों वेक्टर्स को तुरंत खोजने के लिए, हम इंडेक्स बनाते हैं। एचएनएसडब्ल्यू तेजी से सही जगह पर जाने के लिए एक ग्राफ बनाता है, जबकि आईवीएफ वेक्टर्स को समूहों में बांटता है।",
  11: "डे 11. वेक्टर समानता की गणना दूरी सूत्रों का उपयोग करके की जाती है। कोसाइन सिमिलैरिटी वेक्टर्स के बीच के कोण को मापती है, जबकि यूक्लिडियन दूरी उनके बीच की दूरी को मापती है।",
  12: "डे 12. रिट्रीवल ऑगमेंटेड जनरेशन (रैग) आपके प्रश्न को वेक्टर में बदलकर, वेक्टर डेटाबेस को क्वेरी करके और संदर्भ के रूप में सबसे समान पाठ खंडों को लाकर शुरू होता है।",
  13: "डे 13. जनरेशन रिट्रीव की गई जानकारी को लेता है, उन्हें एक सिस्टम प्रॉम्प्ट में पेस्ट करता है, और सटीक उत्तर देने के लिए इसे एलएलएम को फीड करता है।",
  14: "डे 14. एडवांस्ड रैग क्वेरी री-राइटिंग, हाइब्रिड सर्च और क्रॉस-एनकोडर री-रैंकिंग का उपयोग करके खोज को बेहतर बनाता है ताकि सबसे अच्छा संदर्भ सबसे ऊपर आ सके।",
  15: "डे 15. हम एजेंटिक एआई शुरू कर रहे हैं। एजेंट सोचने, टूल के साथ काम करने और परिणामों को देखने के लिए लूप का उपयोग करते हैं।"
};

// Set status text
function setTutorStatus(state) {
  const el = document.getElementById("tutor-status");
  if (!el) return;
  const labels = { idle: "Idle", speaking: "Speaking", listening: "Listening" };
  el.textContent = labels[state] || "Idle";
  el.style.color = state === "speaking" ? "var(--cyan)" : state === "listening" ? "var(--pink)" : "var(--green)";
}

// Speak text using Web Speech API
function speakText(text) {
  if (!speechSynth) return;

  // Stop speaking current text first
  speechSynth.cancel();

  // If a Hindi voice is selected and we are playing a daily audio lecture, use the Hindi translation
  const select = document.getElementById("voice-select");
  let selectedVoice = null;
  let speakLang = "en-US";

  if (select.value !== "") {
    selectedVoice = voices[parseInt(select.value)];
    speakLang = selectedVoice.lang;
  }

  let textToSpeak = text;
  if (speakLang.startsWith("hi") && hindiDailyLectures[currentDay] && text === curriculumData[currentDay].audioText) {
    textToSpeak = hindiDailyLectures[currentDay];
  }

  // Intercept with D-ID API if key is present
  const didKey = document.getElementById("did-key-input").value.trim();
  const didImageUrl = document.getElementById("did-image-input").value.trim();
  if (didKey) {
    generateDIDAvatar(textToSpeak, didKey, didImageUrl, speakLang);
    return;
  }

  const speedSelect = document.getElementById("tts-speed-select");
  const rate = speedSelect ? parseFloat(speedSelect.value) : 1;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = rate;

  utterance.onstart = () => {
    setTutorStatus("speaking");
    const pauseBtn = document.getElementById("btn-pause-tts");
    const resumeBtn = document.getElementById("btn-resume-tts");
    if (pauseBtn) pauseBtn.hidden = false;
    if (resumeBtn) resumeBtn.hidden = true;
  };

  utterance.onend = () => {
    setTutorStatus("idle");
    const pauseBtn = document.getElementById("btn-pause-tts");
    const resumeBtn = document.getElementById("btn-resume-tts");
    if (pauseBtn) pauseBtn.hidden = true;
    if (resumeBtn) resumeBtn.hidden = true;
  };

  speechSynth.speak(utterance);
}

// Generate D-ID Avatar video talking frames and play inside video pane
async function generateDIDAvatar(text, apiKey, imageUrl, lang) {
  const loader = document.getElementById("avatar-loader");
  const video = document.getElementById("avatar-video");
  
  if (loader) loader.style.display = "flex";
  if (video) video.style.display = "none";
  
  // Clean text from basic Markdown elements for spoken reading
  const cleanText = text.replace(/[*#`_\-]/g, "");

  // Determine Microsoft voice ID for D-ID
  let voiceId = "en-US-JennyNeural";
  if (lang.startsWith("hi")) {
    voiceId = "hi-IN-MadhurNeural"; // Standard Hindi speaker
  }

  try {
    // Encode API key to Base64 username parameter
    const base64Key = btoa(`${apiKey}:`);
    
    // Step 1: Create Talk request
    const response = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${base64Key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source_url: imageUrl,
        script: {
          type: "text",
          input: cleanText,
          provider: {
            type: "microsoft",
            voice_id: voiceId
          }
        },
        config: {
          fluent: "false",
          pad_audio: "0.0"
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`D-ID talk request returned code ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    const talkId = data.id;
    console.log("Started D-ID Talk generation. ID:", talkId);
    
    // Step 2: Poll status
    const pollInterval = setInterval(async () => {
      try {
        const pollResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          method: "GET",
          headers: {
            "Authorization": `Basic ${base64Key}`
          }
        });
        
        const pollData = await pollResponse.json();
        console.log("D-ID Talk status:", pollData.status);
        
        if (pollData.status === "done") {
          clearInterval(pollInterval);
          
          if (loader) loader.style.display = "none";
          if (video) {
            video.style.display = "block";
            video.src = pollData.result_url;
            video.play();
            
            // Revert back when speaking video finishes
            video.onended = () => {
              video.style.display = "none";
            };
          }
        } else if (pollData.status === "error") {
          clearInterval(pollInterval);
          if (loader) loader.style.display = "none";
          alert("D-ID Avatar generation error. Verify D-ID credits or try another face image URL.");
        }
      } catch (err) {
        clearInterval(pollInterval);
        if (loader) loader.style.display = "none";
        console.error("D-ID Polling error:", err);
      }
    }, 1500);

  } catch (error) {
    if (loader) loader.style.display = "none";
    console.error("D-ID Integration error:", error);
    alert("D-ID Integration error. Falling back to local Speech Synthesis.");
    
    // Local fallback audio read
    if (speechSynth) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynth.speak(utterance);
    }
  }
}

// Setup Speech Recognition (STT)
function initSpeechRecognition() {
  const micBtn = document.getElementById("btn-mic-toggle");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  // Capability detection: disable mic gracefully on unsupported browsers
  if (!SpeechRecognition) {
    if (micBtn) {
      micBtn.disabled = true;
      micBtn.title = "Voice input requires Chrome or Edge";
      micBtn.style.opacity = "0.4";
    }
    setTutorStatus("idle");
    return;
  }

  // TTS capability detection
  if (!window.speechSynthesis) {
    const playBtn = document.getElementById("btn-play-topic");
    if (playBtn) { playBtn.disabled = true; playBtn.title = "Text-to-speech requires Chrome or Edge"; }
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isRecording = true;
    if (micBtn) micBtn.classList.add("recording");
    const indicator = document.getElementById("mic-indicator");
    if (indicator) indicator.hidden = false;
    setTutorStatus("listening");
  };

  recognition.onend = () => {
    isRecording = false;
    if (micBtn) micBtn.classList.remove("recording");
    const indicator = document.getElementById("mic-indicator");
    if (indicator) indicator.hidden = true;
    setTutorStatus("idle");
  };

  recognition.onresult = (event) => {
    const resultText = event.results[0][0].transcript;
    document.getElementById("chat-input-text").value = resultText;
    sendMessage();
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    isRecording = false;
    if (micBtn) micBtn.classList.remove("recording");
    const indicator = document.getElementById("mic-indicator");
    if (indicator) indicator.hidden = true;
    setTutorStatus("idle");
  };

  document.getElementById("voice-select").addEventListener("change", (e) => {
    if (e.target.value !== "") {
      const selectedVoice = voices[parseInt(e.target.value)];
      recognition.lang = selectedVoice.lang;
    }
  });
}

// Toggle Mic recording status
function toggleVoiceRecording() {
  if (!recognition) return;
  if (isRecording) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

// Send Chatbot message
async function sendMessage() {
  const inputEl = document.getElementById("chat-input-text");
  const query = inputEl.value.trim();
  if (!query) return;

  // Render User Message
  appendMessage(query, "user");
  inputEl.value = "";

  // Show "Thinking" animation indicator
  const historyEl = document.getElementById("chat-messages");
  const thinkingDiv = document.createElement("div");
  thinkingDiv.className = "msg tutor thinking";
  thinkingDiv.innerText = "Lumina is analyzing...";
  historyEl.appendChild(thinkingDiv);
  historyEl.scrollTop = historyEl.scrollHeight;

  try {
    const responseText = await getTutorResponse(query);
    
    // Remove thinking message
    thinkingDiv.remove();
    
    // Render tutor response
    appendMessage(responseText, "tutor");
    
    // Mark active day as complete when talking to tutor about it
    markDayComplete(currentDay);

    // Speak response if toggled active
    if (speakResponses) {
      speakText(responseText);
    }
  } catch (err) {
    thinkingDiv.remove();
    appendMessage("Error generating answer. Please try again.", "tutor");
    console.error(err);
  }
}

// Append bubble to history
function appendMessage(text, sender) {
  const historyEl = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = `msg ${sender}`;
  div.innerText = text;
  
  historyEl.appendChild(div);
  historyEl.scrollTop = historyEl.scrollHeight;
}

// Build grounded system prompt for the current day (shared by mock + API paths)
function buildSystemPrompt(day) {
  const topic = curriculumData[day];
  if (!topic) return "You are Lumina, a friendly AI Tutor for LLMs and Agentic AI.";
  const conceptSnippet = topic.concept.slice(0, 800); // stay within token budget
  return `You are Lumina, a friendly, professional AI Tutor teaching LLMs and Agentic AI.
The learner is on Day ${day}: "${topic.title}". Prefer plain English. Reference today's concept when relevant.
Today's concept (excerpt): ${conceptSnippet}
Guidelines: Keep answers under 150 words. Use a short code snippet if helpful.`;
}

// Render day-scoped suggestion chips
function renderSuggestionChips(day) {
  const el = document.getElementById("suggestion-chips");
  if (!el) return;
  const topic = curriculumData[day];
  if (!topic) { el.innerHTML = ""; return; }
  const suggestions = [
    `Explain ${topic.title} in simple terms`,
    `Give me an example of ${topic.title}`,
    `How is ${topic.title} used in practice?`
  ];
  el.innerHTML = "";
  suggestions.forEach(text => {
    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.textContent = text;
    chip.addEventListener("click", () => {
      document.getElementById("chat-input-text").value = text;
      sendMessage();
    });
    el.appendChild(chip);
  });
}

// Get AI Tutor Answer (Mock logic with local data or Live API call if Key exists)
async function getTutorResponse(query) {
  const apiKey = document.getElementById("api-key-input").value.trim();
  const lowerQuery = query.toLowerCase();

  // If user supplied API key, let's call actual Gemini model
  if (apiKey) {
    try {
      const systemPrompt = buildSystemPrompt(currentDay);
      const prompt = `${systemPrompt}\n\nUser Question: "${query}"`;

      // Identify model type by key prefix
      if (apiKey.startsWith("AIza")) {
        // Gemini API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 250 }
          })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      } else {
        // Default to OpenAI structure if other key format
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 250
          })
        });
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.warn("API direct call failed, falling back to local database routing.", e);
    }
  }

  // Local/Mock Database matching
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate minor delay

  if (lowerQuery.includes("token")) {
    return tutorResponses["tokens"] + ` Let me know if you would like me to explain character vs subword splits!`;
  } else if (lowerQuery.includes("transformer") || lowerQuery.includes("attention")) {
    return tutorResponses["transformers"] + ` Watch the interactive grid block in the center playground to see weight maps.`;
  } else if (lowerQuery.includes("embedding")) {
    return tutorResponses["embeddings"] + ` In the visualizer panel, you can run the Vector space mathematical calculation to see how vectors work.`;
  } else if (lowerQuery.includes("vector")) {
    return tutorResponses["vector db"] + ` It creates layered index graphs like HNSW, preventing slow full-table linear scans.`;
  }

  // Conversational response routing based on current day
  const topic = curriculumData[currentDay];
  return `Great question! Regarding "${topic.title}": We learn that ${topic.audioText}. Try clicking 'Run Simulation' or looking at the Python code segment in the playground to visualize this process!`;
}

// Mark day as complete
function markDayComplete(day) {
  if (!completedDays.includes(day)) {
    completedDays.push(day);
    progress.completedDays = completedDays;
    progress.currentDay = day;
    saveProgress(progress);

    const node = document.getElementById(`day-node-${day}`);
    if (node) {
      node.classList.add("completed");
      const badge = node.querySelector(".day-badge");
      if (badge) badge.innerText = "✓";
      node.setAttribute("aria-label", `Day ${day}: ${curriculumData[day]?.title || ''} (completed)`);
    }

    updateProgress();
  }
}

// Reset all progress
function resetProgress() {
  if (!confirm("Reset all progress? This cannot be undone.")) return;
  progress = { completedDays: [], currentDay: 1, lastVisited: "" };
  completedDays = [];
  saveProgress(progress);
  initRoadmap();
  goToDay(1);
  updateProgress();
}

// Update UI progress indicator
function updateProgress() {
  const percent = Math.round((completedDays.length / 30) * 100);
  document.getElementById("progress-indicator").innerText = `${percent}%`;
}
