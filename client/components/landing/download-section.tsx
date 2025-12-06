"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Apple,
  Smartphone,
  QrCode,
  TrendingUp,
  Wallet,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="download" className="py-24 px-4 sm:px-6">
      <div
        ref={ref}
        className="container mx-auto max-w-7xl bg-[#09090b] rounded-[3rem] overflow-hidden relative border border-white/10 shadow-2xl"
      >
        {/* --- AMBIENT GLOW EFFECTS --- */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 md:p-20 gap-16 lg:gap-24">
          {/* --- LEFT CONTENT (Text) --- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 text-xs font-medium mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Syncs across all devices
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Don&apos;t let your spending <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                get ahead of you.
              </span>
            </h2>

            <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
              Expenses happen on the go, not when you're at your desk. Track
              transactions instantly, get budget alerts, and never wonder where
              your money went.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                className="h-14 px-8 rounded-full bg-white text-black hover:bg-zinc-200 transition-all gap-3 text-base font-semibold shadow-xl shadow-white/5"
              >
                <Apple className="h-6 w-6" />
                <span>App Store</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 transition-all gap-3 text-base font-semibold"
              >
                <Smartphone className="h-6 w-6" />
                <span>Play Store</span>
              </Button>
            </div>

            {/* Desktop QR Hint */}
            <div className="mt-12 hidden lg:flex items-center gap-5 p-4 bg-white/5 rounded-2xl border border-white/5 w-fit backdrop-blur-sm">
              <div className="h-14 w-14 bg-white rounded-lg p-1 shrink-0">
                <QrCode className="w-full h-full text-black" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">
                  Scan to install
                </p>
                <p className="text-zinc-500 text-xs">Direct download link</p>
              </div>
            </div>
          </motion.div>

          {/* --- RIGHT CONTENT (Phone Mockup) --- */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{
              duration: 1,
              delay: 0.2,
              type: "spring",
              stiffness: 50,
            }}
            className="flex-1 relative w-full flex justify-center lg:justify-end"
          >
            {/* Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-gradient-to-b from-blue-600/20 to-purple-600/20 blur-3xl -z-10 rounded-full"></div>

            {/* Floating Notification (Visual Flair) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute top-32 -left-12 z-30 hidden lg:flex items-center gap-3 p-3 pr-5 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl"
            >
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <Bell className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Budget Alert</p>
                <p className="text-sm font-medium text-white">
                  Food limit exceeded!
                </p>
              </div>
            </motion.div>

            {/* CSS iPhone 15 Pro Frame */}
            <div className="relative w-[300px] h-[620px] bg-[#000] rounded-[3.5rem] border-[6px] border-[#1f1f1f] shadow-2xl overflow-hidden ring-1 ring-white/10 rotate-[-5deg] hover:rotate-0 transition-all duration-700">
              {/* Dynamic Island */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20 flex items-center justify-center gap-2 border-b border-l border-r border-[#1f1f1f]"></div>

              {/* Screen UI */}
              <div className="w-full h-full bg-[#09090b] text-white pt-14 p-6 flex flex-col gap-6 font-sans">
                {/* App Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-500 text-xs font-medium">
                      Total Balance
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight">
                      ₹42,500
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Chart Card */}
                <div className="h-40 w-full bg-gradient-to-b from-zinc-800/50 to-transparent rounded-2xl border border-white/5 p-4 relative">
                  {/* Fake Line Chart */}
                  <div className="absolute bottom-4 left-4 right-4 h-24 flex items-end justify-between gap-1">
                    {[30, 50, 40, 70, 50, 80, 60].map((h, i) => (
                      <div
                        key={i}
                        className="w-full bg-white/10 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" /> +12% this week
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-white rounded-xl flex items-center justify-center text-black font-semibold text-sm shadow-lg">
                    Add Expense
                  </div>
                  <div className="h-12 w-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-white/10">
                    <ArrowUpRight className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Recent List */}
                <div className="flex-1 flex flex-col gap-4 mt-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Recent
                  </p>
                  {[
                    {
                      title: "Netflix",
                      sub: "Subscription",
                      amt: "-₹649",
                      color: "text-white",
                    },
                    {
                      title: "Grocery",
                      sub: "Food & Drinks",
                      amt: "-₹1,200",
                      color: "text-white",
                    },
                    {
                      title: "Salary",
                      sub: "Freelance",
                      amt: "+₹45,000",
                      color: "text-green-400",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                          {item.title[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-[10px] text-zinc-500">
                            {item.sub}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${item.color}`}>
                        {item.amt}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Tab Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-14 bg-[#1a1a1a]/90 backdrop-blur-xl rounded-full flex items-center justify-around border border-white/5 shadow-2xl">
                  <div className="h-1 w-12 bg-white/20 rounded-full absolute bottom-2"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
