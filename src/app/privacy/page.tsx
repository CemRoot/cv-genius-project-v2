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

          <h2>Advertising and Third-Party Services</h2>
          <p>
            To keep CVGenius free for everyone, we display advertisements from trusted partners. 
            Here's what you need to know:
          </p>

          <h3>Advertisement Networks</h3>
          <ul>
            <li><strong>PropellerAds:</strong> We use PropellerAds to serve contextual advertisements. They may use cookies and similar technologies to provide relevant ads based on your browsing behavior.</li>
            <li><strong>Google AdSense:</strong> Google AdSense may display personalized ads based on your interests. You can manage your ad preferences through Google's Ad Settings.</li>
            <li><strong>Media.net:</strong> Microsoft/Yahoo advertising network that may serve contextual ads based on page content.</li>
          </ul>

          <h3>Cookie Usage</h3>
          <p>
            Our advertising partners may place cookies on your device to:
          </p>
          <ul>
            <li>Serve relevant advertisements</li>
            <li>Prevent the same ad from continuously reappearing</li>
            <li>Measure advertising effectiveness</li>
            <li>Provide aggregate reporting to advertisers</li>
          </ul>

          <h3>Your Advertising Choices</h3>
          <p>
            You can control advertising cookies and personalization:
          </p>
          <ul>
            <li><strong>Google Ads:</strong> Visit <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ad Settings</a> to opt-out of personalized ads</li>
            <li><strong>Browser Settings:</strong> Disable cookies in your browser settings</li>
            <li><strong>Ad Blockers:</strong> Use ad-blocking software if you prefer not to see ads</li>
            <li><strong>NAI Opt-out:</strong> Visit <a href="http://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Network Advertising Initiative</a> for industry-wide opt-out</li>
          </ul>

          <h3>International Data Transfers</h3>
          <p>
            Our advertising partners may transfer data outside of Ireland/EU for ad serving purposes. 
            These transfers are governed by appropriate safeguards as required by GDPR.
          </p>

          <h2>AI Features</h2>
          <p>
            When you use AI features, your content is processed by Google's Gemini API. 
            This processing is done in real-time and Google does not store or train on 
            your personal data.
          </p>

          <h2>Data Retention</h2>
          <p>
            <strong>CVGenius Platform:</strong> We do not store any personal data on our servers. 
            All CV data remains in your browser's local storage.
          </p>
          <p>
            <strong>Advertising Data:</strong> Our advertising partners may retain data according 
            to their privacy policies:
          </p>
          <ul>
            <li>PropellerAds: Up to 24 months for analytics and optimization</li>
            <li>Google AdSense: Up to 26 months for ad personalization</li>
            <li>Analytics data: Aggregated and anonymized data may be retained indefinitely</li>
          </ul>

          <h2>GDPR Compliance</h2>
          <p>
            As an Irish service, we fully comply with GDPR requirements:
          </p>
          <ul>
            <li><strong>Legal Basis:</strong> Legitimate interest for providing free services through advertising</li>
            <li><strong>Data Minimization:</strong> We collect only what's necessary for ad serving</li>
            <li><strong>Transparency:</strong> This privacy policy explains all data practices</li>
            <li><strong>User Rights:</strong> You can opt-out of personalized ads at any time</li>
            <li><strong>Data Protection:</strong> Your CV data never leaves your device</li>
          </ul>

          <h2>Updates to Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time to reflect changes in our 
            advertising partnerships or legal requirements. The latest version will always 
            be available on this page with the effective date noted.
          </p>
          <p>
            <strong>Last updated:</strong> January 2025
          </p>

          <h2>Contact</h2>
          <p>
            If you have any privacy concerns or questions about our advertising practices, 
            you can reach us through our community channels or GitHub issues.
          </p>
          <p>
            For GDPR-related requests or advertising opt-outs, please contact us at: 
            <strong>privacy@cvgenius.ie</strong>
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