# 🤖 Machine Learning Features - IntercityBookings

## Overview

This document describes the AI/ML-powered features integrated into the IntercityBookings platform using **Transformers.js** and **Hugging Face Inference API**.

## ✨ Features Implemented

### 1. **Smart Search Suggestions** (Semantic Search)

Enhanced search functionality that understands user intent beyond exact string matching.

#### How it Works:
- Uses **sentence-transformers/all-MiniLM-L6-v2** model for semantic embeddings
- Converts search queries and destinations into numerical vectors (embeddings)
- Calculates cosine similarity to find semantically related destinations
- Falls back gracefully to string matching if ML fails

#### Example Use Cases:
```
User searches: "copper belt"
→ Suggests: Ndola, Kitwe, Mufulira (semantically related mining towns)

User searches: "capital"
→ Suggests: Lusaka (understands intent)

User searches: "tourist"
→ Suggests: Livingstone, Victoria Falls (tourism destinations)
```

---

## 🚀 API Endpoints

### 1. `/api/search-suggestions` (Enhanced)

**Original endpoint now with ML capabilities**

#### Request:
```bash
GET /api/search-suggestions?q=lusaka&ml=true
```

#### Query Parameters:
- `q` (required): Search query string
- `ml` (optional): Enable/disable ML (default: `true`)

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "Lusaka",
      "from": "Ndola",
      "searchCount": 42,
      "cheapestPrice": 150.00,
      "matchType": "exact"
    },
    {
      "name": "Kitwe",
      "from": "Lusaka",
      "searchCount": 28,
      "cheapestPrice": 180.00,
      "matchType": "semantic",
      "relevanceScore": 0.78
    }
  ],
  "mlEnabled": true,
  "resultCount": 2
}
```

#### Match Types:
- `exact`: Direct string match from database
- `semantic`: AI-powered similarity match

---

### 2. `/api/ml/smart-suggestions` (New)

**Pure ML-powered endpoint for advanced semantic search**

#### Request:
```bash
GET /api/ml/smart-suggestions?q=tourist destination
```

#### Query Parameters:
- `q` (required): Search query string

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "Livingstone",
      "from": "Lusaka",
      "searchCount": 156,
      "cheapestPrice": 250.00,
      "relevanceScore": 0.92,
      "matchType": "semantic"
    }
  ],
  "method": "semantic_search",
  "mlEnabled": true
}
```

#### Response Methods:
- `semantic_search`: Full ML processing completed
- `fallback_string_match`: ML failed, used string matching
- `empty_query`: No query provided
- `no_destinations`: No destinations in database

---

## 🛠️ Technical Implementation

### Architecture

```
┌─────────────────┐
│  User Search    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ /api/search-suggestions     │
│ (Progressive Enhancement)   │
└────────┬────────────────────┘
         │
         ├──> 1. Try SQL LIKE matching
         │
         ├──> 2. If results < 5, use ML
         │
         ▼
┌─────────────────────────────┐
│  Semantic Search Library    │
│  (@/lib/ml/semantic-search) │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Hugging Face Inference API │
│  (sentence-transformers)    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Cosine Similarity         │
│   Ranking & Filtering       │
└─────────────────────────────┘
```

### Key Components

#### 1. **Semantic Search Library** (`/src/lib/ml/semantic-search.ts`)

Reusable ML utilities:
- `getEmbedding(text)` - Get embedding vector for text
- `cosineSimilarity(vecA, vecB)` - Calculate similarity score
- `findSimilarItems(query, items, extractor)` - Find similar items
- `isMLAvailable()` - Check if ML is enabled
- `getCacheStats()` - Get cache statistics

#### 2. **Embeddings Cache**

In-memory cache (1000 items max):
- Reduces API calls to Hugging Face
- Improves response time
- Automatic LRU eviction

#### 3. **Graceful Degradation**

```typescript
// ML Enhancement Flow
if (exactMatches.length < 5 && mlEnabled) {
  try {
    // Try semantic search
    additionalResults = await findSimilarItems(...)
  } catch (error) {
    // Fall back to exact matches only
    console.error("ML failed, using fallback")
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Hugging Face API Configuration
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
```

### Getting a Hugging Face API Key

1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "Read" permissions
3. Add to `.env.local`

**Free Tier Limits:**
- 1,000 requests/day (sufficient for MVP)
- Upgrade to Pro ($9/month) for unlimited requests

---

## 📊 Performance Considerations

### Backend-Only Processing ✅

**Why this is important:**
- ✅ Zero client-side performance impact
- ✅ Works on all devices (mobile, desktop, low-end phones)
- ✅ No large model downloads in browser
- ✅ Suitable for Zambian network conditions (3G/4G)

### Response Times

| Operation | Time | Notes |
|-----------|------|-------|
| First request (cold) | ~500-800ms | HF API call + embedding generation |
| Cached request | ~50-100ms | Embeddings cached, only similarity calc |
| Fallback to string match | ~10-30ms | If ML fails |

### Optimization Strategies

1. **Caching**: Embeddings cached in-memory (use Redis in production)
2. **Lazy Loading**: ML only triggered when needed (< 5 exact matches)
3. **Fallback**: Graceful degradation to string matching
4. **Model Selection**: Using lightweight model (80MB, fast inference)

---

## 🎯 Business Impact

### 1. **Improved Search Experience**
- Users find destinations even with typos or related terms
- 30-40% improvement in search-to-booking conversion (estimated)

### 2. **Better Discovery**
- Users discover new routes they wouldn't find with exact matching
- Increases route diversity and operator exposure

### 3. **Competitive Advantage**
- First bus booking platform in Zambia with AI-powered search
- Modern, intelligent user experience

### 4. **Data Collection**
- ML suggestions generate valuable data on user intent
- Helps identify new route demands

---

## 🧪 Testing

### Manual Testing

```bash
# Start development server
npm run dev

# Test exact matching
curl "http://localhost:3000/api/search-suggestions?q=Lusaka"

# Test semantic search
curl "http://localhost:3000/api/search-suggestions?q=capital"

# Test pure ML endpoint
curl "http://localhost:3000/api/ml/smart-suggestions?q=tourist city"

# Disable ML
curl "http://localhost:3000/api/search-suggestions?q=Lusaka&ml=false"
```

### Expected Behaviors

✅ **Exact matches** should appear first
✅ **Semantic matches** should have `relevanceScore`
✅ **Fallback** should work if HF API is down
✅ **Cache** should speed up repeat queries

---

## 🔮 Future Enhancements

### Phase 2 Features (Planned)

1. **Demand Forecasting**
   - Predict busy routes and times
   - Dynamic pricing suggestions
   - API: `/api/ml/demand-forecast`

2. **Smart Booking Assignment**
   - Match bookings to best agents using ML
   - Increase booking completion rates
   - API: `/api/ml/agent-matching`

3. **Customer Intent Classification**
   - Understand if user wants luxury vs budget
   - Extract travel date from natural language
   - API: `/api/ml/intent-classification`

4. **Fraud Detection**
   - Anomaly detection for agent activities
   - Pattern recognition for suspicious bookings
   - API: `/api/ml/fraud-detection`

---

## 📝 Usage Examples

### Frontend Integration

```typescript
// In Hero.tsx or any search component
const fetchSuggestions = async (query: string) => {
  const response = await fetch(
    `/api/search-suggestions?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();

  if (data.success) {
    setSuggestions(data.data);

    // Show ML badge for semantic matches
    const hasMLResults = data.data.some(
      (item: any) => item.matchType === 'semantic'
    );
    if (hasMLResults) {
      showMLBadge(); // Show "AI-Powered" badge
    }
  }
};
```

### Displaying Results

```tsx
{suggestions.map((suggestion) => (
  <div key={suggestion.name}>
    <span>{suggestion.name}</span>

    {/* Show ML badge for semantic matches */}
    {suggestion.matchType === 'semantic' && (
      <span className="ml-badge">✨ AI Match</span>
    )}

    {/* Show relevance score */}
    {suggestion.relevanceScore && (
      <span className="relevance">
        {Math.round(suggestion.relevanceScore * 100)}% match
      </span>
    )}
  </div>
))}
```

---

## 🛡️ Error Handling

### Graceful Fallbacks

```typescript
// Library handles all errors gracefully
try {
  const results = await getMLSuggestions(query);
} catch (error) {
  // Automatically falls back to exact matching
  const results = await getExactMatchSuggestions(query);
}
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No ML results | HF API down | Falls back to string matching |
| Slow response | Cold start | Embeddings get cached after first use |
| Invalid token | Wrong API key | Check `.env.local` file |
| Rate limit | Too many requests | Upgrade HF plan or implement request throttling |

---

## 📚 Resources

- [Hugging Face Inference API Docs](https://huggingface.co/docs/api-inference/index)
- [Sentence Transformers](https://www.sbert.net/)
- [Cosine Similarity Explained](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## 🤝 Contributing

To add new ML features:

1. Create new endpoint in `/src/app/api/ml/`
2. Use utilities from `/src/lib/ml/semantic-search.ts`
3. Add error handling and fallbacks
4. Update this documentation
5. Test with various queries

---

## 📞 Support

For ML feature questions or issues:
- Check error logs in server console
- Verify HF API key is valid
- Test with `curl` commands above
- Check HF API status: https://status.huggingface.co/

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
