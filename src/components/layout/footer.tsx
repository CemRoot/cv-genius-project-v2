import Link from "next/link"
import { Logo } from "./logo"
import { MessageCircle, Users } from "lucide-react"

const footerLinks = {
  product: [
    { label: "CV Builder", href: "/builder" },
    { label: "Cover Letters", href: "/cover-letter" },
    { label: "ATS Checker", href: "/ats-check" },
    { label: "Templates", href: "/templates" },
  ],
  resources: [
    { label: "Dublin Jobs Guide", href: "/dublin-jobs" },
    { label: "Dublin Tech Jobs", href: "/dublin-tech-jobs" },
    { label: "Examples", href: "/examples" },
    { label: "FAQ", href: "/faq" },
    { label: "Tips & Guides", href: "/guides" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
  community: [
    { 
      label: "WhatsApp Group", 
      href: "https://chat.whatsapp.com/COtiAFIipkHA9PLo6G3pTT", 
      external: true,
      icon: MessageCircle 
    },
    { 
      label: "Slack Community", 
      href: "https://join.slack.com/t/corporatecare-x2t7491/shared_invite/zt-36v0dw0pf-5Pic~nMl_soYczCI3hZIXw", 
      external: true,
      icon: Users 
    },
  ]
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo size="lg" className="mb-4" />
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Create ATS-friendly CVs with AI for the Irish job market. 
              100% free, no signup required, privacy-first.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for <a href="https://www.linkedin.com/in/cem-koyluoglu/" target="_blank" rel="noopener noreferrer" className="text-cvgenius-purple hover:underline">Cem Koyluoglu</a>
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cvgenius-purple transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cvgenius-purple transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community & Legal */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cvgenius-purple transition-colors flex items-center gap-2"
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                  >
                    {link.icon && <link.icon size={14} />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="font-medium mb-2 text-sm">Legal</h4>
            <ul className="space-y-1">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-cvgenius-purple transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CVGenius. All rights reserved. 
            No user data is stored or tracked.
          </p>
        </div>
      </div>
    </footer>
  )
}