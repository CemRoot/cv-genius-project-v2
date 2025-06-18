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

## 🚀 Features

- **AI-Powered Assistance**: Get intelligent suggestions for your CV content
- **Multiple Templates**: Professional CV templates to choose from
- **Real-time Preview**: See your CV as you build it
- **Export Options**: Download as PDF or Word document
- **Responsive Design**: Works perfectly on all devices
- **ATS-Friendly**: Optimized for Applicant Tracking Systems

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **PDF Generation**: @react-pdf/renderer
- **Animations**: Framer Motion

## 📦 Installation

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/cv-genius.git
cd cv-genius
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env.local
```

4. **Add your API keys** to `.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

5. **Run the development server**:
```bash
npm run dev
```

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Set Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key
   - `NEXT_TELEMETRY_DISABLED`: 1
   - `NODE_ENV`: production

4. **Deploy**: Click "Deploy" and your app will be live!

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | No |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | No |

### Vercel Configuration

The project includes a `vercel.json` file with optimized settings:

- **Regions**: Frankfurt (fra1) and Dublin (dub1) for EU users
- **Security Headers**: XSS protection, content-type options
- **API Configuration**: Optimized for serverless functions
- **Build Settings**: Node.js 18.x runtime

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check  # Type checking with TypeScript
```

## 🔐 Security

- Content Security Policy headers
- XSS protection
- CORS configured for API routes
- Input validation with Zod schemas

## 🎨 Customization

### Adding New Templates

1. Create a new template component in `src/components/cv/templates/`
2. Export from the templates index file
3. Add template metadata to the templates list

### Modifying AI Prompts

Update prompts in `src/lib/ai/global-prompts.ts` to customize AI behavior.

## 📊 Analytics & Monetization

The project is prepared for:
- Google AdSense integration
- PropellerAds monetization
- Vercel Analytics
- Custom analytics tracking

## 🛡️ License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support or questions:
- Create an issue on GitHub
- Email: support@cvgenius.com

---

Built with ❤️ using Next.js and deployed on Vercel