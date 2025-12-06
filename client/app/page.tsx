"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { DownloadSection } from "@/components/landing/download-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TeamSection } from "@/components/landing/team-section";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Smartphone, Wallet } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/10">
      {/* Background Grid */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <Navbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <DownloadSection />
        <PricingSection />
        <TeamSection />
        <Footer />
      </main>
    </div>
  );
}
