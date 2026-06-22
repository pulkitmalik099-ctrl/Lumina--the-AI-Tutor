// Curriculum data for Lumina Tutor
const curriculumData = {
  1: {
    title: "Tokens – What and Why?",
    category: "LLM Foundations",
    concept: `### What is a Token?
In simple terms, a **token** is the basic unit of text that an LLM reads and writes. 

Computers cannot process raw English words directly because computers only understand numbers. Therefore, before an LLM can read a sentence, the sentence must be chopped up into smaller pieces. These pieces are called tokens.

A token can be:
- A whole word (e.g., \`"agent"\`)
- A part of a word or subword (e.g., \`"anti"\` and \`"gravity"\` in \`"antigravity"\`)
- A single character (e.g., \`"a"\`, \`"!"\`)

### The Tokenization Problem
If we use whole words as tokens, our vocabulary size becomes millions of words, and misspelled words (like \`"learnn"\`) would be unrecognized (the **Out-of-Vocabulary** problem). If we use characters, the model has to process too many individual letters, losing structural context. 

Modern LLMs use **subword tokenization**, which balances both worlds. Common words remain whole, while rare or complex words are broken down into syllables or sub-parts.`,
    code: `# Example of Tokenization in Python using Tiktoken (OpenAI's Tokenizer)
import tiktoken

# Load the GPT-4 tokenizer
enc = tiktoken.get_encoding("cl100k_base")

text = "Antigravity is amazing!"
tokens = enc.encode(text)

print("Original Text:", text)
print("Token IDs:", tokens)
# Output will be integer IDs like: [5372, 85603, 374, 7629, 0]

for token_id in tokens:
    print(f"ID: {token_id} -> Text: '{enc.decode([token_id])}'")`,
    visualizerMode: "tokenizer",
    audioText: "Welcome to Day 1. Today we are learning about tokens. A token is the fundamental building block of language models. Since computers only understand numbers, we must slice sentences into smaller pieces called tokens, which are then mapped to numbers. Think of them as syllables or subwords that the model reads.",
    quiz: [
      {
        q: "What is the primary purpose of tokenization in LLMs?",
        options: ["Convert text into numbers a model can process", "Compress audio files", "Generate images from text", "Sort words alphabetically"],
        answerIndex: 0,
        explain: "Computers only understand numbers. Tokenization maps text pieces (tokens) to integer IDs so the model can process them mathematically."
      },
      {
        q: "Which tokenization strategy do modern LLMs like GPT use?",
        options: ["Character-level", "Word-level", "Subword tokenization", "Sentence-level"],
        answerIndex: 2,
        explain: "Subword tokenization balances vocabulary size and coverage — common words stay whole, rare words are split into sub-parts, avoiding the out-of-vocabulary problem."
      },
      {
        q: "What problem does whole-word tokenization create?",
        options: ["Tokens are too short", "Misspelled words become unrecognized (OOV problem)", "The model generates too many tokens", "Audio quality drops"],
        answerIndex: 1,
        explain: "A vocabulary of millions of whole words means any misspelling or rare word has no entry — the Out-of-Vocabulary (OOV) problem. Subword tokenization solves this."
      }
    ]
  },
  2: {
    title: "How Tokens Work & Are Stored",
    category: "LLM Foundations",
    concept: `### How Tokenization Algorithms Work
Three main algorithms dominate the LLM space:
1. **Byte-Pair Encoding (BPE)**: Used by GPT models. It starts with individual characters and iteratively merges the most frequent pairs of characters/tokens.
2. **WordPiece**: Used by BERT. Similar to BPE, but merges pairs based on the likelihood of training data, rather than raw frequency.
3. **SentencePiece**: Used by LLaMA. Treats the input as a raw byte stream, which makes it excellent for multilingual training because it doesn't assume spaces separate words.

### How Tokens Are Stored
Tokens are stored in a **vocabulary file** (usually a JSON or TXT file). This file contains a mapped lookup table of every unique token to a unique integer ID.
- The vocabulary size of GPT-4 is roughly **100,000** tokens.
- LLaMA 3 has a vocabulary size of **128,000** tokens.

When an LLM receives text, it looks up each token in this vocabulary file to retrieve its numerical ID. When generating text, it outputs IDs and converts them back into strings.`,
    code: `# Simulated BPE merge lookup
vocab = {
    0: "h", 1: "e", 2: "l", 3: "o",
    4: "he", 5: "lo", 6: "hello"
}

def tokenize(text):
    # If the text matches a vocab entry, return it
    if text == "hello":
        return [6] # Token ID for hello
    return [vocab[c] for c in text] # Character fallback`,
    visualizerMode: "bpe-merger",
    audioText: "Day 2. Today we cover how tokens are stored and processed. Tokenization algorithms like Byte-Pair Encoding build a vocabulary of common subwords. This vocabulary is a simple lookup dictionary that maps string patterns to numbers. When the LLM runs, it converts incoming text into list of numbers using this dictionary.",
    quiz: [
      {
        q: "Which tokenization algorithm does GPT use?",
        options: ["WordPiece", "SentencePiece", "Byte-Pair Encoding (BPE)", "Unigram"],
        answerIndex: 2,
        explain: "GPT models use BPE — it starts with characters and iteratively merges the most frequent pairs to build a vocabulary of common subwords."
      },
      {
        q: "What does a vocabulary file contain?",
        options: ["A mapping of tokens to integer IDs", "Raw audio bytes", "Compressed image data", "Training loss values"],
        answerIndex: 0,
        explain: "The vocabulary file is a lookup table: each unique token string maps to a unique integer ID. GPT-4's vocabulary has ~100k entries."
      },
      {
        q: "Approximately how large is GPT-4's token vocabulary?",
        options: ["1,000 tokens", "10,000 tokens", "100,000 tokens", "1,000,000 tokens"],
        answerIndex: 2,
        explain: "GPT-4 uses the cl100k_base tokenizer with roughly 100,000 tokens — a balance between coverage and embedding table size."
      }
    ]
  },
  3: {
    title: "Embeddings – What are they?",
    category: "LLM Foundations",
    concept: `### What are Embeddings?
Once text is tokenized into numbers, how does the model understand what those numbers mean? Through **embeddings**.

An embedding is a vector (a list of decimal numbers) that represents the **semantic meaning** of a token or piece of text. Instead of a single number, a token is represented by a sequence of numbers (e.g., 768 or 1536 coordinates) in a high-dimensional space.

### The Semantic Space
In this multi-dimensional coordinate space:
- Words with similar meanings are positioned physically close to each other.
- The direction of the vectors represents relationships.
- The famous equation: **"King" - "Man" + "Woman" = "Queen"** shows how mathematical addition and subtraction in vector space can capture abstract human relationships.`,
    code: `# Fetching embeddings using the official Google Gemini API (Python)
import google.generativeai as genai

genai.configure(api_key="YOUR_GEMINI_API_KEY")

result = genai.embed_content(
    model="models/text-embedding-004",
    content="What is the meaning of life?",
    task_type="retrieval_document"
)

# The result is a list of 768 floating point numbers
embedding = result['embedding']
print("Embedding Vector Length:", len(embedding))
print("First 5 coordinates:", embedding[:5])`,
    visualizerMode: "embeddings-space",
    audioText: "Day 3. We are discussing embeddings. An embedding represents word meaning as coordinates in a massive multi-dimensional room. Words with similar concepts, like cat and dog, are stored close together, allowing computers to compute semantic relations mathematically.",
    quiz: [
      {
        q: "What is an embedding in the context of LLMs?",
        options: ["A compressed audio file", "A vector representing the semantic meaning of a token", "A list of vocabulary words", "A type of neural network layer"],
        answerIndex: 1,
        explain: "An embedding is a dense vector (list of decimal numbers) that positions the token in a high-dimensional semantic space — similar words cluster nearby."
      },
      {
        q: "What does the famous equation King - Man + Woman = Queen demonstrate?",
        options: ["Embeddings can do arithmetic on meaning", "The model can translate languages", "Tokens are stored alphabetically", "Word lengths are correlated"],
        answerIndex: 0,
        explain: "In embedding space, direction encodes relationships. Subtracting 'Man' and adding 'Woman' to 'King' lands near 'Queen', proving semantic relationships are geometrically encoded."
      },
      {
        q: "How many dimensions do typical LLM embeddings have?",
        options: ["3", "16", "768 or 1536", "1,000,000"],
        answerIndex: 2,
        explain: "Popular models use 768 (BERT-base) to 1536 (OpenAI text-embedding-ada-002) dimensions — enough to encode rich semantic meaning without excessive compute."
      }
    ]
  },
  4: {
    title: "Types of Embeddings",
    category: "LLM Foundations",
    concept: `### Embedding Types
Not all embeddings are created equal. Let's break them down:

1. **Static Embeddings (Word2Vec, GloVe)**:
   - Every word has a single fixed vector, regardless of context.
   - *Problem*: The word "bank" in "river bank" and "investment bank" gets the exact same representation.

2. **Contextual / Dynamic Embeddings (BERT, GPT)**:
   - Generated dynamically depending on surrounding words.
   - The embedding for "bank" shifts to reflect either money or nature based on the context window.

3. **Dense vs. Sparse Representations**:
   - **Sparse (BM25, TF-IDF)**: High-dimensional vectors with mostly zeros. Excellent for finding exact keyword matches.
   - **Dense (OpenAI/Gemini Embeddings)**: Fixed-size vectors filled entirely with non-zero decimals. Excellent for catching meaning, concepts, and synonyms.`,
    code: `# Conceptual difference between Static and Contextual
# Static:
embedding_bank = get_static_vector("bank") # Same vector for both

# Contextual:
vector_1 = get_contextual_vector("The bank of the river")
vector_2 = get_contextual_vector("The investment bank")
# vector_1 and vector_2 are distinct based on context!`,
    visualizerMode: "embedding-types",
    audioText: "Day 4. Static embeddings like Word2Vec represent words in isolation, while modern transformer embeddings change their values based on surrounding context. This means the word bank is represented differently in cash transactions versus riverside walks.",
    quiz: [
      {
        q: "What is the key limitation of static embeddings like Word2Vec?",
        options: ["They require GPUs", "They give one fixed vector per word regardless of context", "They only work in English", "They are too large to store"],
        answerIndex: 1,
        explain: "Static embeddings assign the same vector to 'bank' whether it means river bank or investment bank. Contextual embeddings solve this by generating the vector dynamically."
      },
      {
        q: "What type of search do sparse embeddings (TF-IDF, BM25) excel at?",
        options: ["Semantic similarity search", "Exact keyword matching", "Image retrieval", "Audio search"],
        answerIndex: 1,
        explain: "Sparse embeddings have mostly zeros and are great for exact keyword matching. Dense embeddings are better for semantic/conceptual search."
      },
      {
        q: "Which type of embedding does BERT produce?",
        options: ["Static", "Contextual/Dynamic", "Sparse", "Binary"],
        answerIndex: 1,
        explain: "BERT generates contextual embeddings — the vector for each word changes based on surrounding tokens, enabling nuanced understanding of polysemous words."
      }
    ]
  },
  5: {
    title: "What is a Transformer?",
    category: "LLM Foundations",
    concept: `### The Transformer Revolution
Introduced in the 2017 paper *"Attention Is All You Need"* by Google researchers, the **Transformer** architecture replaced recurrent neural networks (RNNs) like LSTMs.

### Why RNNs Failed
RNNs read text word-by-word sequentially. If you process a 1000-word essay, the model has to run 1000 sequential mathematical steps. This made training extremely slow and limited how much context the model could remember.

### How Transformers Solved It
Transformers process the **entire sentence at the same time** (parallel processing). Rather than passing memory state sequentially, they use **Self-Attention** to directly link any word in a sentence to any other word, regardless of how far apart they are.`,
    code: `# Conceptual overview of transformer inputs
import torch
import torch.nn as nn

class SimpleTransformerSnippet(nn.Module):
    def __init__(self, vocab_size, d_model):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.transformer_block = nn.TransformerEncoderLayer(d_model=d_model, nhead=8)
        
    def forward(self, token_ids):
        # Parallel processing: All tokens embedded at once
        x = self.embedding(token_ids) 
        return self.transformer_block(x)`,
    visualizerMode: "transformer-overview",
    audioText: "Day 5. Transformers revolutionized AI by replacing step-by-step reading with parallel reading. Instead of processing word-by-word, a Transformer looks at the entire paragraph at once, dramatically increasing training speeds and context memory.",
    quiz: [
      {
        q: "What was the major problem with RNNs that Transformers solved?",
        options: ["RNNs couldn't process text at all", "RNNs processed text sequentially, making long-context training very slow", "RNNs used too little memory", "RNNs couldn't produce embeddings"],
        answerIndex: 1,
        explain: "RNNs process text word-by-word in sequence. For a 1000-word text, that's 1000 sequential steps — slow and hard to parallelize. Transformers process all tokens in parallel."
      },
      {
        q: "In which year was the Transformer architecture introduced?",
        options: ["2012", "2015", "2017", "2020"],
        answerIndex: 2,
        explain: "The paper 'Attention Is All You Need' by Google researchers was published in 2017 and introduced the Transformer architecture."
      },
      {
        q: "What key mechanism allows Transformers to link any two words directly?",
        options: ["Convolution", "Recurrence", "Self-Attention", "Pooling"],
        answerIndex: 2,
        explain: "Self-Attention lets every token directly attend to every other token regardless of distance — no sequential steps required."
      }
    ]
  },
  6: {
    title: "Transformer Architecture – The Inside Look",
    category: "LLM Foundations",
    concept: `### Inside the Transformer
A Transformer consists of an **Encoder** (which reads and understands text) and a **Decoder** (which writes text). Modern LLMs like GPT-4 are **Decoder-only** models, meaning they are specialized for text generation.

### Key Architectural Blocks:
1. **Self-Attention (Q, K, V)**:
   - For every token, the model calculates a **Query (Q)**, **Key (K)**, and **Value (V)**.
   - It compares its Query against all other tokens' Keys to find attention weights.
   - It multiplies these weights by the Values to get a context-rich representation.
2. **Multi-Head Attention**:
   - The model runs the attention process multiple times in parallel, allowing it to pay attention to different relationships simultaneously (e.g., grammar, facts, pronoun reference).
3. **Positional Encoding**:
   - Since tokens are processed in parallel, the model adds a sine/cosine wave pattern to the embeddings to tell the model where each word is in the sequence.
4. **Feed-Forward Networks (FFN)**:
   - Sub-layers that compute non-linear relationships to act as the model's factual storage.`,
    code: `# Simplified Self-Attention math in NumPy
import numpy as np

def self_attention(Q, K, V):
    # Step 1: Calculate attention scores (dot product)
    scores = np.dot(Q, K.T)
    
    # Step 2: Scale scores to prevent gradient issues
    d_k = Q.shape[-1]
    scaled_scores = scores / np.sqrt(d_k)
    
    # Step 3: Softmax to get probability distribution (attention weights)
    weights = np.exp(scaled_scores) / np.sum(np.exp(scaled_scores), axis=-1, keepdims=True)
    
    # Step 4: Multiply weights by Values
    output = np.dot(weights, V)
    return output, weights`,
    visualizerMode: "attention-matrix",
    audioText: "Day 6. Self-Attention calculates mathematical weights representing how words in a sentence relate to each other. For example, in the sentence, the animal didn't cross the street because it was too tired, attention helps the model connect the word it to the animal, not to the street.",
    quiz: [
      {
        q: "What three vectors does self-attention compute for each token?",
        options: ["Query, Key, Value", "Input, Output, Gate", "Mean, Variance, Norm", "Token, Position, Segment"],
        answerIndex: 0,
        explain: "Attention scores come from Query·Key dot-products; the resulting weights are applied to Values to produce context-rich representations."
      },
      {
        q: "What is the role of Positional Encoding in a Transformer?",
        options: ["To compress the embedding vectors", "To tell the model where each token is in the sequence", "To filter out stopwords", "To initialize weights randomly"],
        answerIndex: 1,
        explain: "Since all tokens are processed in parallel, the model would otherwise not know word order. Positional encodings (sine/cosine patterns) inject position information."
      },
      {
        q: "Why do Transformers use Multi-Head Attention instead of a single attention head?",
        options: ["It reduces memory usage", "Multiple heads let the model attend to different relationship types simultaneously", "It speeds up tokenization", "It removes the need for embeddings"],
        answerIndex: 1,
        explain: "Multiple heads run attention in parallel, each potentially learning different relationship types — grammar, coreference, factual associations — at the same time."
      }
    ]
  },
  7: {
    title: "How Transformers Are Trained",
    category: "LLM Foundations",
    concept: `### The Training Pipeline
Training a modern state-of-the-art LLM is done in three distinct phases:

1. **Pre-training (Unsupervised)**:
   - The model is fed trillions of web pages.
   - *Goal*: Predict the next token. If input is "The cat sat on the...", model adjusts parameters to output "mat".
   - This phase creates a "base model" that knows facts but isn't helpful (it might just continue writing prompts instead of answering them).

2. **Supervised Fine-Tuning (SFT)**:
   - The base model is trained on curated prompt-response dialogues (e.g., "Q: What is a token? A: A token is...").
   - This turns it into an "instruction-following model".

3. **Alignment (RLHF & DPO)**:
   - **RLHF (Reinforcement Learning from Human Feedback)**: Humans rank model outputs, and a reward model scores the LLM.
   - **DPO (Direct Preference Optimization)**: A mathematically simpler version of RLHF where the model is directly updated using preferred vs. dispreferred responses.`,
    code: `# Conceptual training loss loop
for epoch in range(epochs):
    for batch in dataset:
        # Forward pass: predict next tokens
        predictions = model(batch.inputs)
        # Calculate loss (how far off the real next token we are)
        loss = loss_fn(predictions, batch.targets)
        # Backward pass: adjust parameters
        loss.backward()
        optimizer.step()`,
    visualizerMode: "training-loop",
    audioText: "Day 7. Training has three phases: Pre-training teaches raw word prediction on web text. Supervised Fine-Tuning teaches instruction-following via dialogues. Alignment, using human feedback, ensures the model behaves safely and helpfully.",
    quiz: [
      {
        q: "What is the goal of the pre-training phase?",
        options: ["Answer questions about company policy", "Predict the next token over trillions of web-text tokens", "Generate images from text", "Rank model responses by human preference"],
        answerIndex: 1,
        explain: "Pre-training teaches the model general language by predicting the next token across massive web corpora, producing a 'base model' with broad world knowledge."
      },
      {
        q: "What does Supervised Fine-Tuning (SFT) teach the model?",
        options: ["How to compress tokens", "How to follow instructions via curated prompt-response pairs", "How to index a vector database", "How to draw images"],
        answerIndex: 1,
        explain: "SFT trains on human-written dialogues (prompt → ideal response), converting the raw base model into an instruction-following assistant."
      },
      {
        q: "What does RLHF stand for?",
        options: ["Rapid Learning with High Frequency", "Reinforcement Learning from Human Feedback", "Recursive LLM Hyperparameter Fitting", "Recurrent Layered Hidden Features"],
        answerIndex: 1,
        explain: "RLHF (Reinforcement Learning from Human Feedback) ranks model outputs with human preferences and trains a reward model to steer the LLM toward safe, helpful answers."
      }
    ]
    // TODO: Add quiz arrays for Days 8–30 following the same schema
  },
  8: {
    title: "What is a Vector Database?",
    category: "Vector DB & RAG",
    concept: `### The Need for Vector Databases
Standard databases (like MySQL or MongoDB) query data by matching exact fields or matching keyword strings. 

However, LLM embeddings produce dense lists of decimals (vectors) representing meanings. Matching these requires calculating the distance between vectors. Doing this in standard databases is extremely slow because it requires comparing your search query against every single database entry (an O(N) scan).

**Vector Databases** are designed specifically to index, store, and query high-dimensional vectors in sub-millisecond times, serving as an external memory bank for LLMs.`,
    code: `# Example using ChromaDB (Popular open-source Vector DB)
import chromadb

# Initialize local database client
client = chromadb.Client()

# Create a collection of documents
collection = client.create_collection(name="learning_notes")

# Add documents (Chroma automatically embeds them under the hood)
collection.add(
    documents=["A token is a piece of text.", "Transformers use self-attention."],
    ids=["doc1", "doc2"]
)

# Search collection
results = collection.query(
    query_texts=["How do transformers learn?"],
    n_results=1
)
print("Best match:", results['documents'][0])`,
    visualizerMode: "vector-db-overview",
    audioText: "Day 8. Vector Databases act as long-term memory for LLMs. Standard relational databases can't quickly search through lists of floats, so vector databases index and query multidimensional numbers in milliseconds."
  },
  9: {
    title: "How Data is Stored in a Vector DB",
    category: "Vector DB & RAG",
    concept: `### Structure of a Vector Record
Unlike simple tabular rows, a record in a Vector DB consists of:
1. **Vector Embedding**: The dense array of floats (e.g., \`[0.012, -0.45, ..., 0.89]\`).
2. **Metadata Payload**: Key-value data related to the source (e.g., \`{"author": "Niyu", "source_url": "...", "page": 4}\`). This is used to filter queries.
3. **ID**: A unique record identifier.
4. **Original Content**: The raw text that generated the embedding, which will be injected into the LLM prompt.

### Storage Optimization
To save RAM, vector databases often write vector indexes to disk while keeping only critical layers or compressed codes in memory, balancing retrieval speed and hardware cost.`,
    code: `# Anatomy of a vector insertion payload
vector_record = {
    "id": "item_104",
    "vector": [0.012, -0.432, 0.901, -0.112], # float embedding
    "metadata": {
        "source": "practical_ai.pdf",
        "chapter": 2,
        "raw_text": "Tokens are stored in a vocabulary file."
    }
}`,
    visualizerMode: "record-structure",
    audioText: "Day 9. A vector record contains the float array embedding, a unique ID, metadata like source filename or page number, and the original text chunk. The database indexes this payload for efficient lookup."
  },
  10: {
    title: "Vector Indexes & How Data is Processed",
    category: "Vector DB & RAG",
    concept: `### How Vector Databases Index Data
To avoid scanning every single vector, vector databases build **Indexes** using Approximate Nearest Neighbor (ANN) algorithms:

1. **HNSW (Hierarchical Navigable Small World)**:
   - Builds a multi-layered graph where the top layer has few connections (for fast long-distance hops) and lower layers have dense connections (for local precision). Like navigating highway exits.
2. **IVF (Inverted File Index)**:
   - Groups vectors into clusters. At search time, it identifies the nearest cluster center and only searches vectors inside that cluster.
3. **Product Quantization (PQ)**:
   - Compresses vectors into small bytes, reducing memory footprint by up to 95% at the cost of slight precision loss.`,
    code: `# Conceptual IVF indexing in Python
# 1. Cluster vectors into centroids
# 2. Assign document vectors to closest centroids
# 3. Query only searches the nearest centroids

# Pseudo-code for IVF Query
def ivf_query(query_vector, centroids, cluster_buckets):
    nearest_centroid = find_nearest(query_vector, centroids)
    candidate_vectors = cluster_buckets[nearest_centroid]
    # Only calculate distances for items in this cluster
    return search_exact(query_vector, candidate_vectors)`,
    visualizerMode: "hnsw-graph",
    audioText: "Day 10. To search millions of vectors instantly, we build indexes. HNSW builds a layered graph to jump quickly to the correct neighborhood, while IVF clusters vectors so we only search a tiny fraction of the data."
  },
  11: {
    title: "Vector Search & Distance Metrics",
    category: "Vector DB & RAG",
    concept: `### Measuring Vector Similarity
How do we mathematically calculate if two vectors are similar? We use three main formulas:

1. **Cosine Similarity**:
   - Measures the angle between two vectors, ignoring their length.
   - Values range from -1 to 1 (1 means pointing in the exact same direction). Ideal when document length varies.
2. **Euclidean (L2) Distance**:
   - Measures the straight-line distance between two points in space.
   - Smaller value means closer/more similar.
3. **Dot Product (Inner Product)**:
   - Multiplies corresponding coordinates and sums them up.
   - If vectors are normalized (length of 1), Dot Product is identical to Cosine Similarity. Extremely fast to compute.`,
    code: `# Calculating distance metrics using NumPy
import numpy as np

v1 = np.array([1.0, 2.0, 3.0])
v2 = np.array([1.5, 1.8, 3.2])

# 1. Cosine Similarity
dot_prod = np.dot(v1, v2)
norm_v1 = np.linalg.norm(v1)
norm_v2 = np.linalg.norm(v2)
cosine_sim = dot_prod / (norm_v1 * norm_v2)

# 2. Euclidean Distance
euclidean_dist = np.linalg.norm(v1 - v2)

print(f"Cosine Similarity: {cosine_sim:.4f}")
print(f"Euclidean Distance: {euclidean_dist:.4f}")`,
    visualizerMode: "distance-calc",
    audioText: "Day 11. Vector similarity is computed using distance formulas. Cosine Similarity measures the angle between vectors, while Euclidean distance measures straight-line physical separation. Dot product computes direction and magnitude together."
  },
  12: {
    title: "RAG Pipeline – Retrieval",
    category: "Vector DB & RAG",
    concept: `### The Retrieval Phase of RAG
Retrieval-Augmented Generation (RAG) lets an LLM access external databases to answer questions accurately.

The **Retrieval** process:
1. User enters a query: *"What is BPE?"*
2. System converts this query into an embedding vector using an embedding model.
3. System sends this query vector to the Vector DB.
4. Vector DB performs a similarity search and returns the top-K document chunks (e.g., top 3 most similar text segments).`,
    code: `# RAG Retrieval Logic
def retrieve_context(query, vector_db, embedding_model, k=3):
    query_vector = embedding_model.embed(query)
    results = vector_db.search(query_vector, top_k=k)
    # Combine retrieved text chunks into one context string
    context = "\\n".join([item.text for item in results])
    return context`,
    visualizerMode: "rag-flow",
    audioText: "Day 12. Retrieval Augmented Generation starts by converting your question into a vector, querying a vector database, and fetching the top most similar text chunks to serve as context."
  },
  13: {
    title: "RAG Pipeline – Generation",
    category: "Vector DB & RAG",
    concept: `### The Generation Phase of RAG
Once we have retrieved the relevant document chunks, we inject them directly into the LLM's prompt.

### Prompt Synthesis
We build a prompt that forces the LLM to use the retrieved context. For example:
\`\`\`
Answer the user's question using ONLY the provided context. If you don't know the answer, say "I don't know".

Context:
[Retrieved Chunk 1]
[Retrieved Chunk 2]

Question: What is BPE?
Answer:
\`\`\`
The LLM reads this combined prompt and generates a response based on the ground truth context, preventing hallucinations.`,
    code: `# RAG Generation Logic
def generate_answer(query, context, llm_client):
    prompt = f"""Use the context below to answer the question.
Context:
{context}

Question: {query}
Answer:"""
    
    response = llm_client.complete(prompt)
    return response`,
    visualizerMode: "prompt-assembly",
    audioText: "Day 13. Generation takes the retrieved context documents, pastes them into a system prompt instruction, and feeds this rich template to the LLM to generate an accurate, verified answer."
  },
  14: {
    title: "Advanced RAG Pipelines",
    category: "Vector DB & RAG",
    concept: `### Beyond Simple RAG
Basic RAG can fail if the user's query is poorly phrased or the embedding model misses keywords. Production RAG uses advanced tactics:

1. **Query Rewriting**: An LLM rewrites the user's query into multiple search variants before querying the DB.
2. **Re-ranking (Cross-Encoders)**: We retrieve 20 documents using fast vector search, then run them through a slower, highly accurate model (a Cross-Encoder) that re-orders them to put the absolute best matches first.
3. **Hybrid Search**: Combining keyword search (BM25) and semantic vector search to find documents that match exact codes/terms as well as abstract meaning.`,
    code: `# Conceptual Hybrid Search re-ranking
def hybrid_search(query, vector_index, keyword_index):
    vector_results = vector_index.search(query, k=10)
    keyword_results = keyword_index.search(query, k=10)
    
    # Reciprocal Rank Fusion (RRF) to merge results
    merged_results = rrf(vector_results, keyword_results)
    return merged_results[:5]`,
    visualizerMode: "hybrid-search",
    audioText: "Day 14. Advanced RAG improves retrieval using query re-writing, hybrid search combining keywords with vectors, and cross-encoder re-ranking to place the absolute best context at the top."
  },
  15: {
    title: "Introduction to Agents & ReAct",
    category: "Agentic AI Foundations",
    concept: `### What is an Agent?
A basic LLM is a static text generator (input goes in, text comes out). An **AI Agent** is an LLM wrapped in a loop that allows it to think, plan, use tools, and inspect its environment to solve complex tasks.

### The ReAct Framework
ReAct stands for **Reasoning and Acting**. It is a prompt pattern that makes an LLM operate in a continuous loop:
1. **Thought**: The model reasons about the user goal (e.g., *"I need to find the weather in Mumbai. I should use the weather search tool."*).
2. **Action**: The model decides to run a tool with arguments (e.g., \`search_weather("Mumbai")\`).
3. **Observation**: The system runs the tool and inputs the result back into the model context (e.g., \`"28°C, Cloudy"\`).
4. **Thought**: The model reviews the observation and decides whether it has enough data to finish or needs another cycle.`,
    code: `# ReAct Loop structure in Python
def run_react_agent(user_prompt, tools):
    chat_history = [user_prompt]
    while True:
        # Prompt model to output Thought + Action
        response = llm.generate(chat_history)
        print("Agent:", response)
        
        if "Final Answer:" in response:
            return response
            
        action = extract_action(response) # e.g. run_tool("search_weather", "Mumbai")
        observation = execute_tool(action, tools)
        
        # Feed observation back into context
        chat_history.append(f"Observation: {observation}")`,
    visualizerMode: "react-loop",
    audioText: "Day 15. We start Agentic AI. Agents use loops to think, act with tools, and observe outcomes. This cycle repeats until they resolve the user request."
  },
  16: {
    title: "Tool Use & Function Calling",
    category: "Agentic AI Foundations",
    concept: `### How Tool Use Works
Function calling lets LLMs interface with external code. Rather than writing random text, the LLM outputs structured JSON matching a predefined schema. The host system intercepts this JSON, executes the real function, and appends the result to the chat session.`,
    code: `tools_schema = {
    "name": "calculate_tax",
    "description": "Calculates tax based on income",
    "parameters": {
        "type": "object",
        "properties": {
            "income": {"type": "number"}
        }
    }
}`,
    visualizerMode: "tool-calling",
    audioText: "Day 16. Tool use lets LLMs output formatted JSON command arguments. The application executes these functions and returns the outcome."
  },
  17: {
    title: "Agent Memory Systems",
    category: "Agentic AI Foundations",
    concept: `### Types of Agent Memory
1. **Short-Term Memory**: Storing recent chat history in the context window.
2. **Long-Term Memory**: Storing previous sessions, preferences, and facts in a Vector DB.
3. **Episodic Memory**: Saving execution traces of previous successful tasks.`,
    code: `# Simple sliding window memory
chat_history = chat_history[-10:] # Keeps only the last 10 messages`,
    visualizerMode: "memory-viewer",
    audioText: "Day 17. Memory helps agents remember past interactions. Short term memory manages recent turns, while long term memory queries vector databases for past session facts."
  },
  18: {
    title: "Planning & Reasoning",
    category: "Agentic AI Foundations",
    concept: `### Planning Methods
- **Chain-of-Thought (CoT)**: Prompting the model to write its reasoning step-by-step.
- **Tree-of-Thoughts (ToT)**: Generating multiple reasoning branches and scoring each path.
- **Self-Reflection (ReFlexion)**: Having the agent inspect its own mistakes and re-run.`,
    code: `prompt = "Solve this step by step. Show your calculations first."`,
    visualizerMode: "planning-trees",
    audioText: "Day 18. Planning strategies like Chain of Thought break down math and logic into steps, while Tree of Thoughts explores multiple solution paths."
  },
  19: {
    title: "Coding a Custom Agent",
    category: "Agentic AI Foundations",
    concept: `### Coding from Scratch
Write a Python script that calls a local API, evaluates calculations, and maintains a clean console output representing the ReAct loop.`,
    code: `# Coding a simple math agent loop...`,
    visualizerMode: "code-runner",
    audioText: "Day 19. Today you build a complete single agent loop from scratch, handling tool execution and parsing in a simple loop."
  },
  20: {
    title: "Agent Evaluation & Debugging",
    category: "Agentic AI Foundations",
    concept: `### Debugging Loops
Agents can easily get stuck in infinite execution loops if prompts are weak. Evaluating performance requires testing against static benchmark datasets.`,
    code: `# Debugging infinite agent loops...`,
    visualizerMode: "debugger",
    audioText: "Day 20. Learn to identify and break agent loops. We look at agent trace logs to optimize prompt instruction constraints."
  },
  21: {
    title: "Agent Guardrails & Safety",
    category: "Agentic AI Foundations",
    concept: `### Security
Input sanitization, output structural parsing validation, and preventing execution of dangerous commands (like raw shell commands) by sandboxing tool codes.`,
    code: `def safe_tool_exec(cmd):
    # Restrict cmd parameters to prevent shell injection!`,
    visualizerMode: "guardrails",
    audioText: "Day 21. Learn safety guardrails to validate user inputs, format outputs safely, and sandbox tools from causing damage."
  },
  22: {
    title: "Why Multi-Agent Systems?",
    category: "Multi-Agent & Production",
    concept: `### Specialization
Single agents break down when given too many tasks. Multi-agent systems assign distinct roles (e.g., Researcher, Copywriter, Reviewer) that communicate with each other.`,
    code: `# Researcher Agent + Writer Agent`,
    visualizerMode: "multi-agent-overview",
    audioText: "Day 22. Multi-agent systems delegate complex problems to specialized agents, preventing context overload."
  },
  23: {
    title: "Multi-Agent Communication",
    category: "Multi-Agent & Production",
    concept: `### Routing Topologies
- **Sequential**: Agent A passes output to Agent B.
- **Hierarchical**: Supervisor Agent routes subtasks to Worker Agents.
- **Collaborative**: Open group chat with a shared history.`,
    code: `# Multi-agent routing code...`,
    visualizerMode: "communication-graph",
    audioText: "Day 23. Learn routing topologies like sequential chains and hierarchical manager structures for agent communication."
  },
  24: {
    title: "Multi-Agent Frameworks",
    category: "Multi-Agent & Production",
    concept: `### LangGraph, CrewAI, AutoGen
Explore modern frameworks. CrewAI excels at task-oriented crews, LangGraph offers stateful graph-based control, and AutoGen focuses on conversational agents.`,
    code: `from crewai import Agent, Crew, Task
# Crew definitions...`,
    visualizerMode: "frameworks-viewer",
    audioText: "Day 24. Overview of modern frameworks. LangGraph for state management, CrewAI for structured tasks, and AutoGen for dialogue."
  },
  25: {
    title: "Multi-Agent Capstone Design",
    category: "Multi-Agent & Production",
    concept: `### Design Phase
Sketch out the workflow, message boundaries, and tool structures for a multi-agent system that searches the web and writes clean executive briefs.`,
    code: `# Workflow sketch...`,
    visualizerMode: "capstone-designer",
    audioText: "Day 25. Design a capstone project. Map out data schemas and message loops for a writer-researcher crew."
  },
  26: {
    title: "Multi-Agent Implementation (Part 1)",
    category: "Multi-Agent & Production",
    concept: `### Writing the Agents
Set up the environment, define agent behaviors, build tool connectors, and initialize the communication interface.`,
    code: `# Crew setup...`,
    visualizerMode: "capstone-builder",
    audioText: "Day 26. Write the agent specifications and wire up their access to search APIs."
  },
  27: {
    title: "Multi-Agent Implementation (Part 2)",
    category: "Multi-Agent & Production",
    concept: `### Wiring Communication
Create message passing loops, validation checks, and output formatting parsers.`,
    code: `# Routing loops...`,
    visualizerMode: "capstone-wiring",
    audioText: "Day 27. Implement the communication loop, enabling the writer agent to critique the researcher."
  },
  28: {
    title: "Multi-Agent Implementation (Part 3)",
    category: "Multi-Agent & Production",
    concept: `### Running the Crew
Run the full system locally, input a topic, and observe the live multi-agent dialogue solving the prompt.`,
    code: `# Run execution...`,
    visualizerMode: "capstone-runner",
    audioText: "Day 28. Run the completed capstone project, observing the live logs of agents collaborating."
  },
  29: {
    title: "Evaluation & Optimization",
    category: "Multi-Agent & Production",
    concept: `### Agent Quality Assurance
How to track accuracy metrics. Logging latency, measuring token counts, and testing prompt modifications.`,
    code: `# Performance tracking...`,
    visualizerMode: "eval-graphs",
    audioText: "Day 29. Evaluate latency, cost, and reliability of your agent team using tracing techniques."
  },
  30: {
    title: "Agent Deployment & Beyond",
    category: "Multi-Agent & Production",
    concept: `### Going to Production
Expose the agent as a REST API, connect it to a frontend UI, rate-limit access, and keep learning current agentic patterns.`,
    code: `# FastAPI wrapper for agent deployment...`,
    visualizerMode: "deployment-diagram",
    audioText: "Day 30. Congratulations! You've completed the curriculum. Today we learn how to deploy agents to production as REST APIs."
  }
};

// Common tutor prompts for mock chatbot responses
const tutorResponses = {
  "tokens": "Tokens are word fragments or characters that an LLM uses to process text. For example, the word 'unbelievable' might be split into 'un', 'believ', and 'able'. They are represented as numerical IDs inside a vocabulary map file.",
  "transformers": "Transformers read all tokens simultaneously using Self-Attention. During pre-training, they learn next-token prediction, and during fine-tuning, they learn to answer questions and align with human guidelines.",
  "embeddings": "Embeddings are lists of coordinates that map a word's meaning. Similar concepts are placed near each other in this multidimensional map.",
  "vector db": "Vector databases store floating point embeddings, metadata, and doc chunks. They construct graphs (like HNSW) or clusters (like IVF) to perform rapid similarity search in milliseconds."
};
