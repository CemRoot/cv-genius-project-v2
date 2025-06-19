# Hugging Face ATS Integration Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Get Hugging Face API Key
1. Sign up at [Hugging Face](https://huggingface.co/join)
2. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
3. Create a new token with "Make calls to the serverless Inference API" permission
4. Copy the token

### 3. Configure Environment
Add your Hugging Face API key to `.env.local`:
```env
HUGGINGFACE_API_KEY=hf_YOUR_API_KEY_HERE
```

### 4. Test the Integration
Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000/ats-check` and test the AI-powered ATS analysis.

## 📱 Mobile Features

The ATS analyzer automatically detects mobile devices and provides:
- Touch-optimized UI
- Simplified analysis for better performance
- Real-time keyword suggestions
- Mobile-friendly file upload

## 🤖 AI Features

### Basic Analysis (Free)
- Keyword extraction
- ATS compatibility score
- Format validation
- Basic suggestions

### Enterprise Analysis (PRO)
- AI-powered content analysis
- Job matching score
- Industry-specific recommendations
- CV improvement suggestions
- Multiple ATS system simulation

## 🛠️ Optional Configuration

### Custom Models
You can specify different models in `.env.local`:
```env
# Use a different text generation model
HUGGINGFACE_TEXT_MODEL=meta-llama/Llama-2-7b-chat-hf

# Use a different embedding model
HUGGINGFACE_EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
```

### Providers
The system uses automatic provider selection by default. To specify a provider:
```env
HUGGINGFACE_PROVIDER=hf-inference  # or other providers like groq, together, etc.
```

## 🔧 API Endpoints

### ATS Analysis
```
POST /api/ats/analyze
```
Standard ATS analysis with optional AI enhancement.

### Hugging Face AI Analysis
```
POST /api/ats/huggingface
```
Direct AI-powered analysis with multiple modes:
- `full`: Complete analysis
- `keywords`: Keyword extraction only
- `match`: Job matching analysis
- `improve`: CV improvement suggestions

## 💰 Rate Limits

### Free Tier
- ~100 requests per hour
- Basic models only
- Limited analysis depth

### PRO Tier ($9/month)
- Higher rate limits
- Access to advanced models
- Priority processing
- Full enterprise features

## 🐛 Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Make sure `HUGGINGFACE_API_KEY` is set in `.env.local`
   - Restart the development server after adding the key

2. **"Rate limit exceeded" error**
   - Free tier has limited requests
   - Consider upgrading to PRO or waiting for reset

3. **"Model not available" error**
   - Some models require PRO access
   - Check model availability at [Hugging Face Models](https://huggingface.co/models)

### Testing Without API Key

To test the UI without Hugging Face:
1. The system will use fallback analysis
2. Basic ATS scoring will still work
3. AI features will show placeholder results

## 📚 Resources

- [Hugging Face Documentation](https://huggingface.co/docs)
- [Inference API Docs](https://huggingface.co/docs/api-inference/en/index)
- [Model Hub](https://huggingface.co/models)
- [Pricing](https://huggingface.co/pricing)