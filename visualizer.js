// Interactive Concept Visualizer for Lumina Tutor
class LuminaVisualizer {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.currentMode = null;
  }

  setMode(mode) {
    this.currentMode = mode;
    this.container.innerHTML = ""; // Clear visualizer
    
    switch (mode) {
      case "tokenizer":
        this.initTokenizer();
        break;
      case "bpe-merger":
        this.initBPEMerger();
        break;
      case "embeddings-space":
        this.initEmbeddingsSpace();
        break;
      case "embedding-types":
        this.initEmbeddingTypes();
        break;
      case "transformer-overview":
        this.initTransformerOverview();
        break;
      case "attention-matrix":
        this.initAttentionMatrix();
        break;
      case "training-loop":
        this.initTrainingLoop();
        break;
      case "vector-db-overview":
        this.initVectorDBOverview();
        break;
      case "record-structure":
        this.initRecordStructure();
        break;
      case "hnsw-graph":
        this.initHNSWGraph();
        break;
      case "distance-calc":
        this.initDistanceCalc();
        break;
      case "rag-flow":
        this.initRAGFlow();
        break;
      case "prompt-assembly":
        this.initPromptAssembly();
        break;
      case "hybrid-search":
        this.initHybridSearch();
        break;
      case "react-loop":
        this.initReActLoop();
        break;
      default:
        this.initFallback(mode);
        break;
    }
  }

  // Fallback for stubbed days
  initFallback(mode) {
    const title = mode ? mode.replace("-", " ").toUpperCase() : "VISUALIZER";
    this.container.innerHTML = `
      <div class="visualizer-fallback">
        <div class="pulse-ring"></div>
        <div class="visualizer-icon">⚙️</div>
        <h3>Interactive Playground: ${title}</h3>
        <p>This module simulates processes dynamically for the active topic. Use the menu panel to browse the syllabus roadmap.</p>
        <button class="action-btn" onclick="alert('Visualizer mock action executed!')">Run Simulation</button>
      </div>
    `;
  }

  // Day 1: Tokenizer
  initTokenizer() {
    this.container.innerHTML = `
      <div class="tokenizer-visualizer">
        <h3>Live Subword Tokenizer</h3>
        <p class="desc">Type some text below to see how a model breaks it down into subword tokens and maps them to numerical IDs.</p>
        <input type="text" id="token-input" value="Antigravity agents are learning transformers" class="premium-input" />
        
        <div class="token-output-container">
          <label>Color-Coded Subword Tokens:</label>
          <div id="token-chunks" class="token-chunks-row"></div>
        </div>

        <div class="token-ids-container">
          <label>Mapped Token IDs (Input to LLM):</label>
          <div id="token-ids" class="token-ids-row"></div>
        </div>

        <div class="vocab-table-container">
          <label>Vocabulary Lookup Mappings:</label>
          <div id="vocab-lookup" class="vocab-lookup-grid"></div>
        </div>
      </div>
    `;

    const input = document.getElementById("token-input");
    const update = () => {
      const text = input.value;
      const chunksEl = document.getElementById("token-chunks");
      const idsEl = document.getElementById("token-ids");
      const vocabEl = document.getElementById("vocab-lookup");
      
      chunksEl.innerHTML = "";
      idsEl.innerHTML = "";
      vocabEl.innerHTML = "";

      if (!text.trim()) return;

      // Mock Tokenizer dictionary rules
      const mockDict = {
        "anti": 1045,
        "gravity": 8792,
        "agent": 1642,
        "agents": 18456,
        "learn": 4235,
        "ing": 284,
        "transform": 9043,
        "er": 302,
        "ers": 1502,
        "are": 389,
        "learning": 12845,
        "transformers": 24056,
        "is": 318,
        "amazing": 6054,
        "a": 257,
        "the": 262,
        "to": 281
      };

      // Naive splitter
      const words = text.split(/\s+/);
      let colors = ["#ff007f", "#00f0ff", "#39ff14", "#ffb000", "#9d00ff", "#00ffff"];
      let colorIdx = 0;

      words.forEach(word => {
        let cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
        let tokensFound = [];
        
        if (mockDict[cleanWord]) {
          tokensFound.push({ text: word, id: mockDict[cleanWord] });
        } else {
          // Attempt simple subword split
          let splitSuccess = false;
          for (let key in mockDict) {
            if (key.length > 2 && cleanWord.startsWith(key)) {
              const suffix = cleanWord.slice(key.length);
              if (mockDict[suffix]) {
                tokensFound.push({ text: word.slice(0, key.length), id: mockDict[key] });
                tokensFound.push({ text: word.slice(key.length), id: mockDict[suffix] });
                splitSuccess = true;
                break;
              }
            }
          }
          if (!splitSuccess) {
            // Char split fallback
            for (let i = 0; i < word.length; i++) {
              const char = word[i];
              const code = char.charCodeAt(0) + 100;
              tokensFound.push({ text: char, id: code });
            }
          }
        }

        tokensFound.forEach(t => {
          const color = colors[colorIdx % colors.length];
          colorIdx++;

          // Add to chunk
          const chunkSpan = document.createElement("span");
          chunkSpan.className = "token-chunk";
          chunkSpan.innerText = t.text;
          chunkSpan.style.borderColor = color;
          chunkSpan.style.color = color;
          chunksEl.appendChild(chunkSpan);

          // Add to IDs
          const idSpan = document.createElement("span");
          idSpan.className = "token-id-badge";
          idSpan.innerText = t.id;
          idSpan.style.backgroundColor = color + "22";
          idSpan.style.color = color;
          idsEl.appendChild(idSpan);

          // Add to Vocab Grid
          const vocabRow = document.createElement("div");
          vocabRow.className = "vocab-row";
          vocabRow.innerHTML = `<span class="vocab-str" style="color: ${color}">'${t.text}'</span> <span class="arrow">➔</span> <span class="vocab-id">${t.id}</span>`;
          vocabEl.appendChild(vocabRow);
        });

        // Add space token
        const spaceSpan = document.createElement("span");
        spaceSpan.className = "token-chunk space-token";
        spaceSpan.innerText = "␣";
        chunksEl.appendChild(spaceSpan);

        const spaceIdSpan = document.createElement("span");
        spaceIdSpan.className = "token-id-badge space-token-id";
        spaceIdSpan.innerText = "220";
        idsEl.appendChild(spaceIdSpan);
      });
    };

    input.addEventListener("input", update);
    update();
  }

  // Day 2: BPE Merger Animation
  initBPEMerger() {
    this.container.innerHTML = `
      <div class="bpe-visualizer">
        <h3>Byte-Pair Encoding (BPE) Merger</h3>
        <p class="desc">BPE builds vocabularies by iteratively pairing the most common adjacent characters. Watch character sequences merge below.</p>
        
        <div class="bpe-grid">
          <div class="bpe-step" id="bpe-s1">
            <span class="step-num">Step 1</span>
            <div class="nodes"><span class="node">u</span> <span class="node">g</span> <span class="node">l</span> <span class="node">y</span></div>
            <p>Characters separated</p>
          </div>
          <div class="bpe-step" id="bpe-s2">
            <span class="step-num">Step 2</span>
            <div class="nodes"><span class="node active">u</span><span class="node active">g</span> <span class="node">l</span> <span class="node">y</span></div>
            <p>Identify frequent pair: 'u' + 'g'</p>
          </div>
          <div class="bpe-step" id="bpe-s3">
            <span class="step-num">Step 3</span>
            <div class="nodes"><span class="node merged">ug</span> <span class="node">l</span> <span class="node">y</span></div>
            <p>Merge 'ug' into a new token</p>
          </div>
          <div class="bpe-step" id="bpe-s4">
            <span class="step-num">Step 4</span>
            <div class="nodes"><span class="node merged">ug</span> <span class="node active">l</span><span class="node active">y</span></div>
            <p>Next frequent pair: 'l' + 'y'</p>
          </div>
          <div class="bpe-step" id="bpe-s5">
            <span class="step-num">Step 5</span>
            <div class="nodes"><span class="node merged">ug</span> <span class="node merged">ly</span></div>
            <p>Final subwords: 'ug' and 'ly'</p>
          </div>
        </div>

        <button class="action-btn" id="btn-animate-bpe">Animate Merge Sequence</button>
      </div>
    `;

    const steps = ["bpe-s1", "bpe-s2", "bpe-s3", "bpe-s4", "bpe-s5"];
    let idx = 0;
    
    const animate = () => {
      steps.forEach(id => document.getElementById(id).classList.remove("visible"));
      idx = 0;
      
      const interval = setInterval(() => {
        if (idx < steps.length) {
          document.getElementById(steps[idx]).classList.add("visible");
          idx++;
        } else {
          clearInterval(interval);
        }
      }, 1000);
    };

    document.getElementById("btn-animate-bpe").addEventListener("click", animate);
    animate();
  }

  // Day 3: Embeddings 3D Space Simulation
  initEmbeddingsSpace() {
    this.container.innerHTML = `
      <div class="embeddings-visualizer">
        <h3>Geometric Semantic Vector Space</h3>
        <p class="desc">Hover over words to see their coordinate positions. Click 'Solve Analogy' to compute <strong>King - Man + Woman = Queen</strong>.</p>
        
        <div class="embed-box" id="embed-svg-container">
          <svg viewBox="0 0 400 300" width="100%" height="240" style="background:#0a0a18; border-radius:8px;">
            <!-- Axes -->
            <line x1="50" y1="250" x2="350" y2="250" stroke="#222" stroke-width="2"/>
            <line x1="50" y1="250" x2="50" y2="50" stroke="#222" stroke-width="2"/>
            <line x1="50" y1="250" x2="150" y2="150" stroke="#222" stroke-width="1.5" stroke-dasharray="4"/>
            
            <text x="340" y="270" fill="#444" font-size="10">X: Gender</text>
            <text x="10" y="60" fill="#444" font-size="10">Y: Royalty</text>
            
            <!-- Royalty Cluster -->
            <g id="node-king" class="embed-node" transform="translate(120, 90)">
              <circle r="6" fill="#ff007f" />
              <text x="10" y="4" fill="#fff" font-size="11">King (0.85, 0.90)</text>
            </g>
            <g id="node-queen" class="embed-node" transform="translate(280, 90)">
              <circle r="6" fill="#00f0ff" />
              <text x="10" y="4" fill="#fff" font-size="11">Queen (0.15, 0.92)</text>
            </g>
            
            <!-- Commoner Cluster -->
            <g id="node-man" class="embed-node" transform="translate(120, 210)">
              <circle r="6" fill="#39ff14" />
              <text x="10" y="4" fill="#fff" font-size="11">Man (0.82, 0.10)</text>
            </g>
            <g id="node-woman" class="embed-node" transform="translate(280, 210)">
              <circle r="6" fill="#ffb000" />
              <text x="10" y="4" fill="#fff" font-size="11">Woman (0.12, 0.11)</text>
            </g>

            <!-- Vector Line calculations -->
            <path id="analogy-line" d="" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5" />
          </svg>
        </div>

        <div class="analogy-status" id="analogy-math">
          Equation: <span class="glowing-text">Waiting to calculate...</span>
        </div>
        <button class="action-btn" id="btn-analogy">Solve Analogy (King - Man + Woman)</button>
      </div>
    `;

    document.getElementById("btn-analogy").addEventListener("click", () => {
      const line = document.getElementById("analogy-line");
      const math = document.getElementById("analogy-math");
      
      // Draw transition King -> Man (subtracting man coordinates), then + Woman coordinates
      line.setAttribute("d", "M 120 90 L 120 210 L 280 210 L 280 90");
      line.style.stroke = "#ff00aa";
      line.style.animation = "dash 3s linear infinite";

      math.innerHTML = `
        <span style="color:#ff007f">King [0.85, 0.90]</span> - 
        <span style="color:#39ff14">Man [0.82, 0.10]</span> + 
        <span style="color:#ffb000">Woman [0.12, 0.11]</span> 
        <span class="arrow">➔</span> 
        <span style="color:#00f0ff" class="glowing-text">Queen [0.15, 0.91]</span>
      `;
    });
  }

  // Day 4: Static vs Contextual Embeddings
  initEmbeddingTypes() {
    this.container.innerHTML = `
      <div class="embeddings-types-visualizer">
        <h3>Static vs. Contextual Embeddings</h3>
        <p class="desc">Observe how the word <strong>"bank"</strong> changes coordinates based on surrounding context in Contextual Embeddings, but remains static in Word2Vec.</p>
        
        <div class="slider-box">
          <label>Choose Sentence Context:</label>
          <select id="context-select" class="premium-select">
            <option value="money">"I will deposit money in the bank."</option>
            <option value="river">"The boat docked at the river bank."</option>
          </select>
        </div>

        <div class="embed-comparison-grid">
          <div class="embed-card">
            <h4>Static Embeddings (Word2Vec)</h4>
            <div class="vector-display" id="static-vector">
              [0.45, -0.12, 0.78, 0.05]
            </div>
            <p class="label">Word "bank" coordinate remains locked.</p>
          </div>
          <div class="embed-card">
            <h4>Contextual Embeddings (BERT/GPT)</h4>
            <div class="vector-display dynamic-vector" id="context-vector">
              [0.82, -0.44, 0.15, 0.91]
            </div>
            <p class="label">Word "bank" shifts vector coordinate dynamically!</p>
          </div>
        </div>
      </div>
    `;

    const select = document.getElementById("context-select");
    const contextVec = document.getElementById("context-vector");

    select.addEventListener("change", (e) => {
      if (e.target.value === "money") {
        contextVec.innerText = "[0.82, -0.44, 0.15, 0.91]";
        contextVec.style.color = "#00f0ff";
      } else {
        contextVec.innerText = "[-0.12, 0.89, -0.63, 0.02]";
        contextVec.style.color = "#39ff14";
      }
    });
  }

  // Day 5: Transformer History/Overview
  initTransformerOverview() {
    this.container.innerHTML = `
      <div class="transformer-overview-visual">
        <h3>Sequential RNN bottleneck vs. Parallel Transformer</h3>
        
        <div class="comparison-row">
          <div class="architecture-visual">
            <h4>Recurrent Neural Network (Slow)</h4>
            <div class="rnn-steps">
              <span class="rnn-node active">The</span> ➔ 
              <span class="rnn-node">cat</span> ➔ 
              <span class="rnn-node">sat</span> ➔ 
              <span class="rnn-node">on</span>
            </div>
            <p class="desc-text">Processes word-by-word. Cannot parallelize.</p>
          </div>
          
          <div class="architecture-visual">
            <h4>Transformer (Parallel)</h4>
            <div class="transformer-matrix-block">
              <div class="t-node">The</div>
              <div class="t-node">cat</div>
              <div class="t-node">sat</div>
              <div class="t-node">on</div>
            </div>
            <div class="parallel-arrows">▲ ▲ ▲ ▲</div>
            <p class="desc-text">Processes all words in parallel. Super fast training.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Day 6: Self-Attention Matrix
  initAttentionMatrix() {
    const sentence = ["The", "animal", "didn't", "cross", "street", "because", "it", "was", "tired"];
    // High weights: "it" -> "animal"
    
    let gridHTML = "";
    sentence.forEach((rowWord, rIdx) => {
      gridHTML += `<div class="matrix-row"><span class="matrix-row-header">${rowWord}</span>`;
      sentence.forEach((colWord, cIdx) => {
        let weight = 0.05;
        if (rowWord === colWord) weight = 0.6;
        if (rowWord === "it" && colWord === "animal") weight = 0.85;
        if (rowWord === "it" && colWord === "street") weight = 0.12;
        if (rowWord === "tired" && colWord === "animal") weight = 0.70;
        
        const opacity = weight;
        const color = `rgba(0, 240, 255, ${opacity})`;
        gridHTML += `<span class="matrix-cell" data-weight="${weight.toFixed(2)}" style="background-color: ${color};" title="${rowWord} ➔ ${colWord}: ${weight.toFixed(2)}">${weight.toFixed(2)}</span>`;
      });
      gridHTML += `</div>`;
    });

    this.container.innerHTML = `
      <div class="attention-visualizer">
        <h3>Self-Attention Weight Matrix</h3>
        <p class="desc">Hover over cells to see how much attention the word on the left pays to the word on the top. Notice how <strong>"it"</strong> pays high attention to <strong>"animal"</strong>.</p>
        
        <div class="matrix-headers-top">
          <span class="spacer"></span>
          ${sentence.map(w => `<span class="col-hdr">${w}</span>`).join("")}
        </div>
        
        <div class="matrix-grid">
          ${gridHTML}
        </div>
        <div class="attention-focused-stat" id="cell-detail">Hover over any matrix cell...</div>
      </div>
    `;

    const cells = this.container.querySelectorAll(".matrix-cell");
    const detail = document.getElementById("cell-detail");
    
    cells.forEach(cell => {
      cell.addEventListener("mouseover", (e) => {
        const title = e.target.getAttribute("title");
        detail.innerHTML = `<span class="glowing-text">${title}</span>`;
      });
    });
  }

  // Day 7: Training Loop
  initTrainingLoop() {
    this.container.innerHTML = `
      <div class="training-visual">
        <h3>LLM Training Pipeline Iteration</h3>
        <p class="desc">Simulate a single gradient descent weight adjustments epoch step.</p>
        
        <div class="training-nodes-block">
          <div class="node-box" id="box-pretrain">
            <h4>1. Pre-training</h4>
            <div class="bar-fill" style="width: 100%;">Web Corpus</div>
          </div>
          <div class="node-box" id="box-sft">
            <h4>2. Fine-tuning</h4>
            <div class="bar-fill" style="width: 40%;">Q&A pairs</div>
          </div>
          <div class="node-box" id="box-dpo">
            <h4>3. Alignment</h4>
            <div class="bar-fill" style="width: 15%;">Human Feedback</div>
          </div>
        </div>

        <button class="action-btn" id="btn-run-train">Simulate Epoch Run</button>
      </div>
    `;

    document.getElementById("btn-run-train").addEventListener("click", () => {
      const bars = document.querySelectorAll(".bar-fill");
      bars.forEach(bar => {
        bar.style.transition = "width 2s ease";
        bar.style.width = "100%";
      });
      alert("Epoch run completed. Loss minimized!");
    });
  }

  // Day 8: Vector DB Overview
  initVectorDBOverview() {
    this.container.innerHTML = `
      <div class="vectordb-overview">
        <h3>Relational (SQL) vs Vector Database</h3>
        <div class="comparison-grid">
          <div class="db-card">
            <h4>SQL Database Query</h4>
            <div class="query-box">SELECT * WHERE text LIKE '%token%'</div>
            <p class="label">Matches only exact characters. Fails on synonyms.</p>
          </div>
          <div class="db-card">
            <h4>Vector Database Search</h4>
            <div class="query-box">CosineDistance(query_vec, doc_vec) &lt; 0.15</div>
            <p class="label">Retrieves by conceptual meaning and similarity.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Day 9: Vector record anatomy
  initRecordStructure() {
    this.container.innerHTML = `
      <div class="record-structure-visual">
        <h3>Anatomy of a Vector DB Record</h3>
        <div class="record-box-details">
          <div class="field-item"><span class="f-lbl">ID:</span> <span class="f-val">"doc_1092"</span></div>
          <div class="field-item"><span class="f-lbl">Vector:</span> <span class="f-val">[0.0142, -0.9201, 0.4431, ..., -0.119] (1536 float elements)</span></div>
          <div class="field-item">
            <span class="f-lbl">Metadata:</span>
            <div class="meta-sub">
              <div>"filename": "llm_tutor.pdf"</div>
              <div>"page": 4</div>
              <div>"chapter": "Transformers"</div>
            </div>
          </div>
          <div class="field-item"><span class="f-lbl">Document Chunk:</span> <span class="f-val">"Self-attention connects arbitrary word pairs."</span></div>
        </div>
      </div>
    `;
  }

  // Day 10: HNSW Index
  initHNSWGraph() {
    this.container.innerHTML = `
      <div class="hnsw-visualizer">
        <h3>HNSW Index Routing Simulator</h3>
        <p class="desc">Click 'Route Vector Search' to see how HNSW hops across layers to locate the target vector fast.</p>
        
        <svg viewBox="0 0 400 240" width="100%" height="200" style="background:#090915; border-radius:6px;">
          <!-- Layer 2 (Sparse) -->
          <text x="10" y="40" fill="#ff007f" font-size="11">Layer 2 (Highway)</text>
          <line x1="50" y1="50" x2="350" y2="50" stroke="#333" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="6" fill="#ff007f"/>
          <circle cx="200" cy="50" r="6" fill="#ff007f"/>
          <circle cx="350" cy="50" r="6" fill="#ff007f"/>

          <!-- Layer 1 (Medium) -->
          <text x="10" y="110" fill="#39ff14" font-size="11">Layer 1</text>
          <line x1="50" y1="120" x2="350" y2="120" stroke="#333" stroke-dasharray="2"/>
          <circle cx="50" cy="120" r="4" fill="#39ff14"/>
          <circle cx="120" cy="120" r="4" fill="#39ff14"/>
          <circle cx="200" cy="120" r="4" fill="#39ff14"/>
          <circle cx="270" cy="120" r="4" fill="#39ff14"/>
          <circle cx="350" cy="120" r="4" fill="#39ff14"/>

          <!-- Layer 0 (Dense) -->
          <text x="10" y="180" fill="#00f0ff" font-size="11">Layer 0 (All Nodes)</text>
          <circle cx="50" cy="190" r="3" fill="#00f0ff"/>
          <circle cx="90" cy="190" r="3" fill="#00f0ff"/>
          <circle cx="120" cy="190" r="3" fill="#00f0ff"/>
          <circle cx="160" cy="190" r="3" fill="#00f0ff"/>
          <circle cx="200" cy="190" r="3" fill="#00f0ff"/>
          <circle cx="240" cy="190" r="3" fill="#00f0ff"/>
          <circle cx="270" cy="190" r="3" fill="#00f0ff"/>
          <circle cx="310" cy="190" r="3" fill="#00f0ff"/>
          <circle cx="350" cy="190" r="3" fill="#00f0ff"/>

          <!-- Query point -->
          <circle id="query-dot" cx="50" cy="50" r="8" fill="#fff" stroke="#ff007f" stroke-width="2" style="transition: all 1.5s ease;"/>
        </svg>

        <button class="action-btn" id="btn-hnsw-route">Route Vector Search</button>
      </div>
    `;

    document.getElementById("btn-hnsw-route").addEventListener("click", () => {
      const qDot = document.getElementById("query-dot");
      
      // Step 1: Hop to middle Layer 2 node
      setTimeout(() => {
        qDot.setAttribute("cx", "200");
        qDot.setAttribute("cy", "50");
      }, 500);
      
      // Step 2: Drop to Layer 1, shift right
      setTimeout(() => {
        qDot.setAttribute("cx", "270");
        qDot.setAttribute("cy", "120");
        qDot.style.stroke = "#39ff14";
      }, 1500);

      // Step 3: Drop to Layer 0 target
      setTimeout(() => {
        qDot.setAttribute("cx", "310");
        qDot.setAttribute("cy", "190");
        qDot.style.stroke = "#00f0ff";
      }, 2500);
    });
  }

  // Day 11: Distance Metrics
  initDistanceCalc() {
    this.container.innerHTML = `
      <div class="distance-calc-visual">
        <h3>Vector Distance Calculator</h3>
        <p class="desc">Drag the slider to change the angle between Query Vector and Document Vector. See Cosine Similarity dynamically re-calculate.</p>
        
        <div class="metrics-workspace">
          <svg viewBox="0 0 200 200" width="160" height="160" style="background:#090915; border-radius:50%; margin: 10px auto; display:block;">
            <line x1="100" y1="100" x2="180" y2="100" stroke="#ff007f" stroke-width="3" id="vec-query"/>
            <line x1="100" y1="100" x2="100" y2="20" stroke="#00f0ff" stroke-width="3" id="vec-doc"/>
            <circle cx="100" cy="100" r="4" fill="#fff"/>
          </svg>
          
          <div class="slider-wrapper">
            <input type="range" id="angle-slider" min="0" max="180" value="90" class="premium-slider" />
          </div>
          
          <div class="results-box">
            <div>Angle: <span id="val-angle" style="color: #ffb000;">90°</span></div>
            <div>Cosine Similarity: <span id="val-cosine" class="glowing-text" style="color: #00f0ff;">0.00</span></div>
          </div>
        </div>
      </div>
    `;

    const slider = document.getElementById("angle-slider");
    const vecDoc = document.getElementById("vec-doc");
    const valAngle = document.getElementById("val-angle");
    const valCosine = document.getElementById("val-cosine");

    slider.addEventListener("input", (e) => {
      const angle = parseInt(e.target.value);
      valAngle.innerText = `${angle}°`;
      
      const cosine = Math.cos(angle * Math.PI / 180).toFixed(4);
      valCosine.innerText = cosine;

      // Adjust coordinate endpoint based on angle
      const rad = (90 - angle) * Math.PI / 180;
      const x = 100 + 80 * Math.cos(rad);
      const y = 100 - 80 * Math.sin(rad);
      
      vecDoc.setAttribute("x2", x);
      vecDoc.setAttribute("y2", y);
    });
  }

  // Day 12: RAG Flow Visual
  initRAGFlow() {
    this.container.innerHTML = `
      <div class="rag-flow-visualizer">
        <h3>Complete RAG Retrieval Pathway</h3>
        <div class="rag-stages">
          <div class="stage-bubble active" id="rag-q">1. User Query</div>
          <div class="stage-arrow">➔</div>
          <div class="stage-bubble" id="rag-embed">2. Embedding Model</div>
          <div class="stage-arrow">➔</div>
          <div class="stage-bubble" id="rag-db">3. Vector Database</div>
          <div class="stage-arrow">➔</div>
          <div class="stage-bubble" id="rag-res">4. Top-K Context Chunks</div>
        </div>
        <button class="action-btn" id="btn-run-rag">Simulate Pipeline</button>
      </div>
    `;

    document.getElementById("btn-run-rag").addEventListener("click", () => {
      const steps = ["rag-q", "rag-embed", "rag-db", "rag-res"];
      steps.forEach(s => document.getElementById(s).classList.remove("active"));
      
      let step = 0;
      const loop = setInterval(() => {
        if (step < steps.length) {
          document.getElementById(steps[step]).classList.add("active");
          step++;
        } else {
          clearInterval(loop);
        }
      }, 800);
    });
  }

  // Day 13: Prompt Assembly
  initPromptAssembly() {
    this.container.innerHTML = `
      <div class="prompt-assembly-visual">
        <h3>LLM Prompt Assembly Template</h3>
        <p class="desc">Retrieved document chunks are injected directly into a system prompt wrapper before execution.</p>
        <div class="prompt-box">
          <div class="sys-segment">&lt;System Prompt&gt; Answer the question using ONLY the context:</div>
          <div class="chunk-segment">[Retrieved context data: "BPE maps character pairs to IDs."]</div>
          <div class="query-segment">User: What is BPE?</div>
        </div>
      </div>
    `;
  }

  // Day 14: Hybrid Search
  initHybridSearch() {
    this.container.innerHTML = `
      <div class="hybrid-search-visual">
        <h3>Hybrid Search & RRF Merging</h3>
        <div class="hybrid-cols">
          <div class="search-channel">
            <h5>Dense Vector Search</h5>
            <div class="list-item">1. Semantic concepts (Score: 0.92)</div>
            <div class="list-item">2. Context matches (Score: 0.81)</div>
          </div>
          <div class="search-channel">
            <h5>Sparse Keyword (BM25)</h5>
            <div class="list-item">1. Exact term matches (Score: 12.4)</div>
            <div class="list-item">2. Code serial IDs (Score: 9.8)</div>
          </div>
        </div>
        <div class="merged-channel">
          <h5>Reciprocal Rank Fusion (RRF) Output</h5>
          <div class="list-item glowing-item">Merged matches rank list</div>
        </div>
      </div>
    `;
  }

  // Day 15: ReAct Loop Step-by-Step
  initReActLoop() {
    this.container.innerHTML = `
      <div class="react-visualizer">
        <h3>ReAct Agent Loop Execution</h3>
        <p class="desc">Follow the steps of an agent executing calculations dynamically.</p>
        
        <div class="react-step-container">
          <div class="react-step-node" id="node-thought"><strong>Thought:</strong> I need to fetch the stock price of Google. I will call Yahoo Finance tool.</div>
          <div class="react-step-node" id="node-action"><strong>Action:</strong> YahooFinance("GOOG")</div>
          <div class="react-step-node" id="node-observation"><strong>Observation:</strong> $175.25 (+1.2%)</div>
          <div class="react-step-node" id="node-final"><strong>Final Answer:</strong> Google (GOOG) is trading at $175.25, up 1.2% today.</div>
        </div>
        
        <button class="action-btn" id="btn-react-step">Next Step Cycle</button>
      </div>
    `;

    const nodes = ["node-thought", "node-action", "node-observation", "node-final"];
    let currentIdx = 0;
    
    const runStep = () => {
      nodes.forEach(n => document.getElementById(n).classList.remove("visible"));
      currentIdx = 0;
      
      const loop = setInterval(() => {
        if (currentIdx < nodes.length) {
          document.getElementById(nodes[currentIdx]).classList.add("visible");
          currentIdx++;
        } else {
          clearInterval(loop);
        }
      }, 1200);
    };

    document.getElementById("btn-react-step").addEventListener("click", runStep);
    runStep();
  }
}
