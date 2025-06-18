# CVGenius - AI-Powered CV Builder for Irish Market

CVGenius is a privacy-first, AI-powered CV builder platform specifically designed for the Irish/Dublin job market. Create professional, ATS-friendly CVs with no signup required.

## 🌟 Features

- **AI-Powered Optimization** - Smart suggestions using Google Gemini API
- **Privacy-First** - No user accounts, no tracking, data stays local
- **ATS-Friendly** - Optimized for Applicant Tracking Systems
- **Irish Market Focus** - Tailored for Dublin and Irish job market
- **Multiple Templates** - Professional templates for different industries
- **Real-time Preview** - See your CV as you build it
- **Export Options** - PDF, DOCX, and plain text formats
- **Cover Letter Generator** - AI-powered cover letters in 6 templates
- **Mobile Responsive** - Works perfectly on all devices
- **PWA Support** - Install as a mobile app

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **PDF Export**: @react-pdf/renderer
- **AI Integration**: Google Gemini API
- **Storage**: localStorage (no database)

## 📂 Project Structure

```
src/
├── app/                  # Next.js app router pages
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Navigation, footer, etc.
│   ├── cv/              # CV builder components
│   └── forms/           # Form components
├── lib/                 # Utility functions
├── store/               # Zustand stores
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## 🔧 Configuration

1. Copy `.env.example` to `.env.local`
2. Add your Google Gemini API key:
   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```
3. Configure other optional environment variables as needed

## 🚦 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌍 Irish Market Features

- Phone number formatting (+353)
- Dublin address defaults
- GDPR-compliant (no photos)
- EU work authorization keywords
- Irish date format (DD/MM/YYYY)
- 2-page CV limit standard

## 🤝 Contributing

This is a community project for the Dublin tech scene. Contributions welcome!

## 📄 License

Open source - Made with ❤️ for [Cem Koyluoglu](https://www.linkedin.com/in/cem-koyluoglu/)

## 🔒 Privacy

- No user accounts or authentication
- No data collection or tracking
- All data stored locally in browser
- No server-side data storage
- Privacy-first analytics with Plausible

## 📞 Community

- Join our WhatsApp group for Dublin job seekers
- Connect on Slack for tech community support
- Share feedback and suggestions

---

**CVGenius** - Helping Dublin's tech talent land their dream jobs! 🍀