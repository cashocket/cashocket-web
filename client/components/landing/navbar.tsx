"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-border/40 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Wallet className="h-5 w-5 fill-current" />
          </div>
          <span>Cashocket</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            href="#features"
            className="hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          <Link href="#team" className="hover:text-primary transition-colors">
            Team
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Button
              onClick={() => router.push("/dashboard")}
              className="rounded-full px-6 h-10 font-medium shadow-md hover:shadow-lg transition-all"
            >
              Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground h-10 rounded-full px-5"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full px-6 h-10 shadow-md hover:shadow-lg transition-all">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
