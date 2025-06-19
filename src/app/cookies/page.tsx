import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"

export default function CookiesPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-IE')}</p>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Commitment to Privacy</h2>
            <p>
              CVGenius is designed with privacy at its core. We use minimal cookies and tracking, 
              focusing only on what's necessary to provide you with a great experience while 
              respecting your privacy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device 
              when you visit a website. They are widely used to make websites work more 
              efficiently and provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p>
              CVGenius uses cookies for the following purposes:
            </p>

            <div className="bg-muted/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-3 text-green-600">✅ Essential Cookies (Always Active)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                These cookies are necessary for the website to function properly:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>LocalStorage:</strong> Stores your CV data locally in your browser</li>
                <li><strong>Session Storage:</strong> Maintains your session while using the CV builder</li>
                <li><strong>Preferences:</strong> Remembers your chosen settings and preferences</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                These cannot be disabled as they are essential for the service to work.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-3 text-blue-600">📊 Analytics Cookies (Privacy-First)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We use Plausible Analytics for privacy-friendly website analytics:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>No personal data collection</li>
                <li>No cross-site tracking</li>
                <li>No fingerprinting</li>
                <li>GDPR compliant</li>
                <li>Data processed in the EU</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                This helps us understand how to improve CVGenius without compromising your privacy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We DON'T Use</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-red-600">🚫 No Tracking Cookies</h3>
              <p className="text-sm text-muted-foreground mb-3">
                CVGenius explicitly does NOT use:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Google Analytics or Facebook Pixel</li>
                <li>Advertising or marketing cookies</li>
                <li>Cross-site tracking technologies</li>
                <li>Social media tracking pixels</li>
                <li>Third-party advertising networks</li>
                <li>Behavioral profiling tools</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Storage</h2>
            <p>Your CV data is stored using your browser's local storage capabilities:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Local Storage:</strong> Stores your CV content, templates, and preferences</li>
              <li><strong>Session Storage:</strong> Temporary data for your current session</li>
              <li><strong>No Server Storage:</strong> We never store your personal data on our servers</li>
              <li><strong>Complete Control:</strong> You can clear this data anytime through your browser settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p>CVGenius uses minimal third-party services:</p>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Google Gemini AI</h4>
                <p className="text-sm text-muted-foreground">
                  Used for AI content suggestions. Your data is processed in real-time and not stored by Google.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Plausible Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Privacy-first analytics that doesn't use cookies or collect personal data.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Vercel Hosting</h4>
                <p className="text-sm text-muted-foreground">
                  Our hosting provider may use essential cookies for security and performance.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Managing Your Cookies</h2>
            <p>You have several options for managing cookies:</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Browser Settings</h4>
                <p className="text-sm text-muted-foreground">
                  You can control cookies through your browser settings. However, disabling essential 
                  cookies may affect CVGenius functionality.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Clear Local Data</h4>
                <p className="text-sm text-muted-foreground">
                  You can clear all CVGenius data by clearing your browser's local storage or 
                  using our export feature to backup before clearing.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Opt-out of Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  While our analytics are already privacy-friendly, you can block Plausible 
                  through browser extensions or ad blockers.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights Under GDPR</h2>
            <p>As an Irish service, we fully comply with GDPR. You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Know what data we process (minimal analytics only)</li>
              <li><strong>Rectification:</strong> Correct any inaccurate data (stored locally)</li>
              <li><strong>Erasure:</strong> Delete your data (clear browser storage)</li>
              <li><strong>Portability:</strong> Export your CV data in JSON format</li>
              <li><strong>Object:</strong> Opt-out of any processing (use ad blockers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>
              We may update this cookie policy to reflect changes in our practices or for legal reasons. 
              We will notify users of significant changes by updating the date at the top of this policy 
              and posting announcements in our community channels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have questions about our cookie policy or privacy practices, please reach out 
              through our community channels or GitHub repository.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-green-800">Privacy-First Promise</h3>
          <p className="text-sm text-green-700 mb-4">
            CVGenius was built from the ground up with privacy in mind. We collect the absolute 
            minimum data necessary to provide our service, and your CV data never leaves your device.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/privacy">Read Privacy Policy</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/faq">Privacy FAQ</Link>
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
    </MainLayout>
  )
}