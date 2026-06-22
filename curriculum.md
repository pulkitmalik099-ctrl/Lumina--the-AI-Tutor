# Lumina: 30-Day LLM & Agentic AI Curriculum Guide 📖

This guide contains the complete, detailed study plan and conceptual syllabus for learning Large Language Models (LLMs), Embeddings, Transformers, Vector Databases, and Agentic AI.

---

## 📅 Roadmap Overview

```
Week 1: LLM & Transformer Foundations (Days 1-7)
  ├── Week 2: Vector Databases & RAG (Days 8-14)
  │     ├── Week 3: Agentic AI Foundations (Days 15-21)
  │     │     └── Week 4: Multi-Agent Systems & Production (Days 22-30)
```

---

## 🧠 Week 1: LLM & Transformer Foundations

### Day 1: Tokens – What and Why?
*   **Concept**: Computers do not read raw strings. They process numbers. Before an LLM reads text, it must slice the string into basic units called **tokens**.
    *   **Word-level**: Misspelled words or new terms cause "Out-of-Vocabulary" errors.
    *   **Character-level**: Processing one letter at a time loses structural semantic context.
    *   **Subword (Modern)**: Combines both, splitting rare words into components (e.g., `antigravity` ➔ `anti` + `gravity`).
*   **Python Code**:
    ```python
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")
    print(enc.encode("Antigravity is amazing!")) # Output: [5372, 85603, 374, 7629, 0]
    ```

### Day 2: How Tokens Work & Are Stored
*   **Concept**:
    *   **Byte-Pair Encoding (BPE)**: Used by GPT. Merges frequent adjacent character pairs.
    *   **WordPiece**: Used by BERT. Merges pairs maximizing training data likelihood.
    *   **SentencePiece**: Used by LLaMA. Treats input as byte streams (space-insensitive).
    *   **Vocabulary File**: A mapped JSON/TXT lookup table. Maps unique strings to integer Token IDs (e.g., `128,000` tokens for LLaMA 3).

### Day 3: Embeddings – What are they?
*   **Concept**: Once text is tokenized into IDs, those IDs must be mapped to meaning. An **embedding** is a vector (list of decimal numbers) representing semantic meaning in a high-dimensional space (e.g., 1536 coordinates).
    *   **Semantic Proximity**: Words with similar meanings have coordinates close to each other.
    *   **Vector Math**: `King - Man + Woman = Queen`.

### Day 4: Types of Embeddings
*   **Concept**:
    *   **Static (Word2Vec, GloVe)**: One word, one vector. Fails on homonyms (e.g., "river bank" vs. "money bank").
    *   **Contextual (BERT, GPT)**: Computes vectors dynamically based on surrounding context.
    *   **Sparse vs. Dense**: TF-IDF/BM25 (sparse, exact keyword matches) vs. Neural Embeddings (dense, semantic meaning).

### Day 5: What is a Transformer?
*   **Concept**: Introduced in 2017 (*"Attention Is All You Need"*). Replaced RNNs/LSTMs by processing the entire sentence in parallel rather than word-by-word, solving sequential bottlenecks.

### Day 6: Transformer Architecture – The Inside Look
*   **Concept**:
    *   **Self-Attention**: Computes weights linking any word in a sentence directly to any other word (via Query, Key, Value vector dot-products).
    *   **Multi-Head Attention**: Runs the attention mechanism in parallel to catch grammar, pronoun references, and factual links simultaneously.
    *   **Positional Encoding**: Adds coordinate patterns to word vectors to indicate their sequence position.
    *   **Feed-Forward Networks**: Layers that act as factual knowledge storage.

### Day 7: How Transformers Are Trained
*   **Concept**:
    1.  **Pre-training**: Next-token prediction on trillions of web pages (Base model).
    2.  **Supervised Fine-Tuning (SFT)**: Dialogue format training (Instruction model).
    3.  **Alignment (RLHF/DPO)**: Tuning parameters based on human preferences for safety.

---

## 🗄️ Week 2: Vector Databases & RAG

### Day 8: What is a Vector Database?
*   **Concept**: SQL/NoSQL databases match fields or keywords. Finding similar embeddings requires calculating multi-dimensional distances. Vector DBs index and search floating-point vectors in sub-milliseconds, serving as long-term memory for LLMs.

### Day 9: How Data is Stored in a Vector DB
*   **Concept**: A Vector Record contains:
    *   **Vector ID**
    *   **Dense Float Embedding Array**
    *   **Metadata Payload** (Author, date, original text chunk)
    *   **Index Pointer**

### Day 10: Vector Indexes & How Data is Processed
*   **Concept**: Pre-calculating pathways to avoid full table scans:
    *   **HNSW (Hierarchical Navigable Small World)**: A layered highway-like search graph.
    *   **IVF (Inverted File Index)**: Clustering vectors and searching nearest centroids.
    *   **Product Quantization (PQ)**: Vector compression.

### Day 11: Vector Search & Distance Metrics
*   **Concept**: Formulas to compute similarity:
    *   **Cosine Similarity**: Angle between vectors (range -1 to 1). Ignores text length.
    *   **Euclidean (L2) Distance**: Straight-line distance between points.
    *   **Dot Product**: Direction and magnitude multiplication.

### Day 12: RAG Pipeline – Retrieval
*   **Concept**: User Query ➔ Embedding Model ➔ Vector DB Similarity Search ➔ Top-K Chunks returned.

### Day 13: RAG Pipeline – Generation
*   **Concept**: Pasting top-K context chunks inside system instructions for the LLM to prevent hallucinations.

### Day 14: Advanced RAG
*   **Concept**: Query rewriting, cross-encoder re-ranking, and hybrid search (combining BM25 keyword matching with dense vector matching).

---

## 🤖 Week 3: Agentic AI Foundations

### Day 15: Introduction to Agents & ReAct
*   **Concept**: Moving from static text generators to active loops. The **ReAct** framework cycles through: **Thought** ➔ **Action** (Tool call) ➔ **Observation** (Tool output) ➔ **Thought** until resolved.

### Day 16: Tool Use & Function Calling
*   **Concept**: How LLMs communicate with APIs. The model outputs structured JSON arguments representing function schemas, which the host system intercepts and executes.

### Day 17: Agent Memory Systems
*   **Concept**:
    *   **Short-Term**: Chat history buffer in the context window.
    *   **Long-Term**: Querying vector databases for past facts/preferences.
    *   **Episodic**: Storing previous execution logs.

### Day 18: Planning & Reasoning Strategies
*   **Concept**: Chain-of-Thought (CoT), Tree-of-Thoughts (ToT), Self-Reflection (Reflexion), and Plan-and-Solve patterns.

### Day 19: Coding a Custom Agent
*   **Concept**: Assembling a raw ReAct loop with API tools in Python or JavaScript from scratch.

### Day 20: Agent Evaluation & Debugging
*   **Concept**: Analyzing trace logs, resolving infinite loops, and optimizing prompts for tool execution accuracy.

### Day 21: Agent Guardrails & Safety
*   **Concept**: Input sanitization, checking output schemas, and sandboxing command-line/database tools.

---

## 🌐 Week 4: Multi-Agent Systems & Production

### Day 22: Why Multi-Agent Systems?
*   **Concept**: Single agents fail at complex, multi-task goals. Multi-agent systems delegate tasks to specialized roles (e.g., researcher, copywriter, reviewer).

### Day 23: Multi-Agent Communication
*   **Concept**: Orchestrating communication topologies:
    *   **Sequential**: Pipeline task handoffs.
    *   **Hierarchical**: Manager-Worker routing.
    *   **Network**: Shared peer-to-peer discussions.

### Day 24: Multi-Agent Frameworks
*   **Concept**: Exploring LangGraph (stateful graph-based flows), CrewAI (role-based tasks), and AutoGen (conversational agents).

### Day 25: Multi-Agent Capstone Design
*   **Concept**: Designing the workflow schemas and tool boundaries for a dual-agent research-and-writing team.

### Days 26-28: Multi-Agent Implementation
*   **Concept**: Implementing, debugging, and running the capstone agent team using Python or JavaScript.

### Days 29-30: Evaluation, Optimization & Deployment
*   **Concept**: Tracing system costs, benchmarking agent output reliability, and deploying agents as REST APIs (using FastAPI/Express).
