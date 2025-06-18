import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <h2>Our Privacy Promise</h2>
          <p>
            CVGenius is built with privacy at its core. We believe your personal information 
            should stay personal, which is why we've designed our platform to be completely 
            privacy-first.
          </p>

          <h2>What We Don't Collect</h2>
          <ul>
            <li>No user accounts or registration required</li>
            <li>No personal data stored on our servers</li>
            <li>No tracking cookies or pixels</li>
            <li>No email addresses or contact information</li>
            <li>No CV content or personal details</li>
          </ul>

          <h2>Local Storage Only</h2>
          <p>
            All your CV data is stored locally in your browser's storage. This means:
          </p>
          <ul>
            <li>Your data never leaves your device</li>
            <li>We have no access to your CV content</li>
            <li>You maintain complete control over your information</li>
            <li>Data is automatically deleted when you clear browser data</li>
          </ul>

          <h2>Analytics</h2>
          <p>
            We use privacy-first analytics (Plausible) to understand general usage patterns 
            without collecting personal information. This helps us improve the service while 
            respecting your privacy.
          </p>

          <h2>AI Features</h2>
          <p>
            When you use AI features, your content is processed by Google's Gemini API. 
            This processing is done in real-time and Google does not store or train on 
            your personal data.
          </p>

          <h2>GDPR Compliance</h2>
          <p>
            As an Irish service, we fully comply with GDPR requirements. Since we don't 
            collect personal data, there's nothing to delete, access, or modify.
          </p>

          <h2>Contact</h2>
          <p>
            If you have any privacy concerns, you can reach us through our community 
            channels or GitHub issues.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}