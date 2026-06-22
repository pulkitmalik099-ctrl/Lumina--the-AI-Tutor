// Main Application Logic for Lumina Tutor

// Global state variables
let currentDay = 1;
let voices = [];
let speechSynth = window.speechSynthesis;
let recognition = null;
let isRecording = false;
let speakResponses = true;
let completedDays = JSON.parse(localStorage.getItem("lumina_completed") || "[]");

// Instantiate visualizer
let visualizer = null;

// Initialize app when DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  visualizer = new LuminaVisualizer("visualizer-canvas");
  
  loadSavedKeys(); // Load API keys from local storage securely
  initRoadmap();
  initVoices();
  initSpeechRecognition();
  loadDay(currentDay);
  setupEventListeners();
  updateProgress();

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

    const node = document.createElement("div");
    node.className = `day-node ${d === currentDay ? 'active' : ''}`;
    node.id = `day-node-${d}`;
    node.dataset.day = d;
    
    // Add checkmark if complete
    const isCompleted = completedDays.includes(d);
    const badgeText = isCompleted ? "✓" : d;
    
    node.innerHTML = `
      <div class="day-badge">${badgeText}</div>
      <div class="day-info">
        <span class="day-title">${item.title}</span>
        <span class="day-cat">${item.category}</span>
      </div>
    `;

    node.addEventListener("click", () => {
      // Set active styles
      document.querySelectorAll(".day-node").forEach(el => el.classList.remove("active"));
      node.classList.add("active");
      
      // Load selected day
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

// Setup Event Listeners
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
  });

  // Send Message Button
  document.getElementById("btn-send-message").addEventListener("click", sendMessage);
  document.getElementById("chat-input-text").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Mic Button
  document.getElementById("btn-mic-toggle").addEventListener("click", toggleVoiceRecording);
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

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

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
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.log("Web Speech Recognition API not supported in this browser.");
    document.getElementById("btn-mic-toggle").style.display = "none";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isRecording = true;
    const micBtn = document.getElementById("btn-mic-toggle");
    micBtn.classList.add("recording");
    micBtn.innerText = "🛑";
  };

  recognition.onend = () => {
    isRecording = false;
    const micBtn = document.getElementById("btn-mic-toggle");
    micBtn.classList.remove("recording");
    micBtn.innerText = "🎙️";
  };

  recognition.onresult = (event) => {
    const resultText = event.results[0][0].transcript;
    document.getElementById("chat-input-text").value = resultText;
    sendMessage(); // Send automatically once speech transcribed
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    isRecording = false;
    const micBtn = document.getElementById("btn-mic-toggle");
    micBtn.classList.remove("recording");
    micBtn.innerText = "🎙️";
  };

  // Adjust STT language dynamically when voice selection changes
  document.getElementById("voice-select").addEventListener("change", (e) => {
    if (e.target.value !== "") {
      const selectedVoice = voices[parseInt(e.target.value)];
      recognition.lang = selectedVoice.lang;
      console.log("Speech recognition language switched to:", recognition.lang);
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

// Get AI Tutor Answer (Mock logic with local data or Live API call if Key exists)
async function getTutorResponse(query) {
  const apiKey = document.getElementById("api-key-input").value.trim();
  const lowerQuery = query.toLowerCase();

  // If user supplied API key, let's call actual Gemini model
  if (apiKey) {
    try {
      // Build context prompt injecting details of the current learning topic
      const activeTopic = curriculumData[currentDay];
      const prompt = `You are Lumina, a friendly, professional AI Tutor teaching LLMs and Agentic AI.
Current user study topic: Day ${currentDay} - ${activeTopic.title}
Concept summary: ${activeTopic.concept}

User Question: "${query}"

Guidelines:
1. Explain simply in plain, clear English.
2. If applicable, provide a short snippet.
3. Keep it brief (under 150 words).`;

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
    localStorage.setItem("lumina_completed", JSON.stringify(completedDays));
    
    // Update badge in sidebar
    const badge = document.querySelector(`#day-node-${day} .day-badge`);
    if (badge) badge.innerText = "✓";
    
    updateProgress();
  }
}

// Update UI progress indicator
function updateProgress() {
  const percent = Math.round((completedDays.length / 30) * 100);
  document.getElementById("progress-indicator").innerText = `${percent}%`;
}
