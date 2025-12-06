"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  ArrowRight,
  Heart,
  Apple,
  Smartphone,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Download", href: "#download" },
      { name: "Changelog", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Contact", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Security", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-border/40 bg-background pt-16 pb-8 relative overflow-hidden">
      {/* Subtle Gradient Blob */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 translate-y-1/2 translate-x-1/4"></div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand & Newsletter (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl tracking-tight w-fit"
            >
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Wallet className="h-5 w-5 fill-current" />
              </div>
              <span>Cashocket</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Empowering you to take control of your financial destiny with
              smart tools, insights, and seamless tracking.
            </p>

            <div className="mt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Subscribe to newsletter
              </p>
              <div className="flex gap-2 max-w-sm">
                <Input
                  placeholder="Enter your email"
                  className="rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:ring-primary/20 h-10 text-sm"
                />
                <Button size="icon" className="rounded-full shrink-0 h-10 w-10">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links Sections (Span 2 each) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- NEW RIGHT SECTION: DOWNLOAD APP (Span 3) --- */}
          <div className="lg:col-span-3 lg:col-start-10">
            <h4 className="font-semibold text-foreground mb-4">Get the App</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Track expenses on the go. Available on iOS and Android.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="justify-start gap-3 h-12 rounded-xl bg-background hover:bg-muted/50 w-full max-w-[200px]"
              >
                <Apple className="h-5 w-5" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] uppercase text-muted-foreground">
                    Download on the
                  </span>
                  <span className="text-sm font-semibold">App Store</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-3 h-12 rounded-xl bg-background hover:bg-muted/50 w-full max-w-[200px]"
              >
                <Smartphone className="h-5 w-5" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] uppercase text-muted-foreground">
                    Get it on
                  </span>
                  <span className="text-sm font-semibold">Google Play</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-muted-foreground order-2 md:order-1">
            <p>© {currentYear} Cashocket Inc.</p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 order-1 md:order-2">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors bg-muted/50 p-2 rounded-full hover:bg-muted"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors bg-muted/50 p-2 rounded-full hover:bg-muted"
            >
              <Github className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors bg-muted/50 p-2 rounded-full hover:bg-muted"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors bg-muted/50 p-2 rounded-full hover:bg-muted"
            >
              <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Made with Love */}
        <div className="mt-8 text-center border-t border-border/40 pt-4">
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            Made with{" "}
            <Heart className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />{" "}
            by Oxzeen Team
          </p>
        </div>
      </div>
    </footer>
  );
}
