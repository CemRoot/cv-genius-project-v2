import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-IE')}</p>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Welcome to CVGenius</h2>
            <p>
              CVGenius is a free, open-source CV builder designed specifically for the Irish job market. 
              By using our service, you agree to these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using CVGenius, you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p>
              CVGenius grants you a personal, non-transferable license to use our service for 
              creating and managing your professional CV. This license includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creating unlimited CVs using our templates</li>
              <li>Using AI features for content suggestions</li>
              <li>Exporting your CVs in various formats</li>
              <li>Participating in our community features</li>
            </ul>
            <p>
              This license is automatically revoked if you violate any of these restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensuring all information in your CV is accurate and truthful</li>
              <li>Backing up your CV data (stored locally in your browser)</li>
              <li>Using the service in compliance with Irish and EU laws</li>
              <li>Not using the service for any unlawful or prohibited activities</li>
              <li>Respecting intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Privacy and Data</h2>
            <p>
              CVGenius is built with privacy at its core:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not collect or store personal data on our servers</li>
              <li>All CV data is stored locally in your browser</li>
              <li>AI features process data in real-time without storage</li>
              <li>We use privacy-first analytics that don't track individuals</li>
            </ul>
            <p>
              For detailed information, please read our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4a. Advertising and Third-Party Services</h2>
            <p>
              To provide CVGenius free of charge, we display advertisements through trusted partners:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>PropellerAds:</strong> Contextual advertising network</li>
              <li><strong>Google AdSense:</strong> Personalized advertising service</li>
              <li><strong>Media.net:</strong> Microsoft/Yahoo advertising network</li>
              <li><strong>Amazon Associates:</strong> Affiliate marketing program</li>
            </ul>
            <p>
              By using CVGenius, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Third-party advertising partners may use cookies and tracking technologies</li>
              <li>Advertisements are served based on content context and user behavior</li>
              <li>You can opt-out of personalized advertising through partner settings</li>
              <li>Ad blocking software may be used but could affect site functionality</li>
              <li>We are not responsible for the content or practices of advertiser websites</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. AI Services</h2>
            <p>
              Our AI features are provided through Google's Gemini API. When you use AI features:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your content is processed by Google's AI systems</li>
              <li>Processing is done in real-time for suggestions only</li>
              <li>Google does not store or train on your personal data</li>
              <li>AI suggestions are provided "as is" without guarantees</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Service Availability</h2>
            <p>
              CVGenius is provided on an "as is" and "as available" basis. We strive for 
              continuous service but cannot guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uninterrupted access to the service</li>
              <li>Error-free operation</li>
              <li>Protection against data loss due to browser issues</li>
              <li>Compatibility with all browsers or devices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Community Guidelines</h2>
            <p>
              When participating in our WhatsApp or Slack communities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be respectful and professional</li>
              <li>Help others and share knowledge</li>
              <li>No spam, self-promotion, or inappropriate content</li>
              <li>Respect privacy - don't share others' personal information</li>
              <li>Follow platform-specific terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p>
              CVGenius respects intellectual property rights:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain full ownership of your CV content</li>
              <li>Our templates and code are open source</li>
              <li>Do not use copyrighted content without permission</li>
              <li>Report any intellectual property violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimers</h2>
            <p>
              CVGenius is provided "as is" without warranties of any kind. We disclaim:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responsibility for job application outcomes</li>
              <li>Guarantees about CV effectiveness</li>
              <li>Liability for data loss or technical issues</li>
              <li>Accuracy of AI-generated suggestions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by Irish law, CVGenius shall not be liable 
              for any indirect, incidental, special, consequential, or punitive damages, 
              including but not limited to loss of profits, data, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be 
              posted on this page with an updated date. Continued use of the service 
              constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p>
              These terms are governed by the laws of Ireland. Any disputes will be 
              resolved in the courts of Dublin, Ireland.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p>
              For questions about these terms, please contact us through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Our WhatsApp community group</li>
              <li>Slack community channels</li>
              <li>GitHub repository issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Open Source</h2>
            <p>
              CVGenius is an open-source project. The source code is available on GitHub 
              under the MIT license. You are free to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View and study the source code</li>
              <li>Contribute improvements and bug fixes</li>
              <li>Fork the project for your own use</li>
              <li>Report issues and suggest features</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">Questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have any questions about these terms, join our community for help and clarification.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/faq">FAQ</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}