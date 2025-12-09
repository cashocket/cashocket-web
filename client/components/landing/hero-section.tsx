"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, PieChart, TrendingUp, Trophy } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function HeroSection() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- 3D TILT LOGIC ---
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xRotation = (y / rect.height - 0.5) * -5;
    const yRotation = (x / rect.width - 0.5) * 5;
    setRotateX(xRotation);
    setRotateY(yRotation);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const springConfig = { damping: 20, stiffness: 100 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-background selection:bg-primary/10">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
        {/* --- PRODUCT HUNT BADGE --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm hover:bg-muted/50 transition-colors cursor-pointer group">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6154] text-white">
              <Trophy className="h-3 w-3 fill-current" />
            </span>
            <span className="group-hover:text-foreground transition-colors">
              Product of the Day on Product Hunt
            </span>
            <ArrowRight className="ml-1 h-3 w-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.div>

        {/* --- MAIN HEADING --- */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]"
        >
          <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Stop losing track of money.
          </span>
          <br />
          <span className="bg-gradient-to-b from-foreground/70 to-muted-foreground bg-clip-text text-transparent">
            Start building your future.
          </span>
        </motion.h1>

        {/* --- SUBHEADING --- */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed font-normal"
        >
          The simplest tool to track income, manage expenses, and set budgets.
          No complex spreadsheets, just clarity.
        </motion.p>

        {/* --- BUTTONS --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            onClick={() => router.push(isLoggedIn ? "/dashboard" : "/signup")}
            size="lg"
            className="rounded-full h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {isLoggedIn ? "Open Dashboard" : "Get Started Free"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-12 px-8 text-base bg-transparent border-primary/20 hover:bg-primary/5"
          >
            View Live Demo
          </Button>
        </motion.div>

        {/* --- SOCIAL PROOF --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-4 mb-20"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <Avatar key={i} className="border-2 border-background w-8 h-8">
                <AvatarImage src={`https://i.pravatar.cc/100?u=${i}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              +2k
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex gap-0.5 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Loved by 2,000+ creators
            </span>
          </div>
        </motion.div>

        {/* --- 3D TILT DASHBOARD (THEME AWARE FIX) --- */}
        <div
          className="w-full max-w-6xl mx-auto px-4 perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          ref={ref}
        >
          <motion.div
            style={{ rotateX: smoothRotateX, rotateY: smoothRotateY }}
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative rounded-xl border border-border/40 bg-card shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9] group"
          >
            {/* Fake Dashboard UI - THEME AWARE */}
            <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 p-2 md:p-4 transition-colors duration-300">
              <div className="w-full h-full rounded-lg overflow-hidden bg-background border border-border/60 relative flex shadow-sm">
                {/* Sidebar */}
                <div className="w-16 md:w-60 border-r border-border/40 hidden md:flex flex-col p-4 gap-6 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="h-8 w-8 bg-primary rounded-lg mb-2 shadow-sm"></div>
                  <div className="space-y-3 opacity-60">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-full"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-background">
                  {/* Header */}
                  <div className="h-14 border-b border-border/40 flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
                    <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800"></div>
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800"></div>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                    {/* Cards */}
                    <div className="h-32 rounded-xl border border-border/40 bg-card p-4 flex flex-col justify-between shadow-sm">
                      <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                    </div>
                    <div className="h-32 rounded-xl border border-border/40 bg-card p-4 flex flex-col justify-between shadow-sm">
                      <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <PieChart className="h-4 w-4" />
                      </div>
                      <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                    </div>
                    <div className="h-32 rounded-xl border border-border/40 bg-card p-4 flex flex-col justify-between shadow-sm">
                      <div className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Star className="h-4 w-4" />
                      </div>
                      <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                    </div>

                    {/* Chart */}
                    <div className="md:col-span-2 h-64 rounded-xl border border-border/40 bg-card p-4 relative overflow-hidden shadow-sm group-hover:border-primary/20 transition-colors">
                      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-primary/5 to-transparent"></div>
                      {/* Animated Lines */}
                      <svg
                        className="w-full h-full text-primary opacity-30"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 50"
                      >
                        <path
                          d="M0,50 L10,40 L20,45 L30,30 L40,35 L50,20 L60,25 L70,10 L80,15 L90,5 L100,20 L100,50 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>

                    {/* Recent List */}
                    <div className="h-64 rounded-xl border border-border/40 bg-card p-4 space-y-4 shadow-sm">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800"></div>
                            <div className="space-y-1">
                              <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
                              <div className="h-2 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                            </div>
                          </div>
                          <div className="h-2 w-8 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glossy Overlay (Theme Aware) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent dark:from-black/20 pointer-events-none rounded-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
