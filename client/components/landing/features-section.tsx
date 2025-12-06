"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Wallet,
  PieChart,
  Zap,
  ShieldCheck,
  Globe,
  Users,
  ArrowUpRight,
  Lock,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- BENTO GRID COMPONENT ---
const BentoGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: React.ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      key={name}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
        "bg-background border border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20",
        className
      )}
    >
      {/* Background Content (Abstract UI) */}
      <div className="absolute inset-0 z-0 transition-all duration-300 group-hover:scale-105 opacity-80">
        {background}
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="pointer-events-none z-20 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2 h-full justify-end mt-32">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">{name}</h3>
        <p className="max-w-lg text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* CTA Button (Appears on Hover) */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-6 right-6 z-20 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
        )}
      >
        {cta}
        <ArrowUpRight className="ml-1 h-3 w-3" />
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-primary/[.03]" />
    </motion.div>
  );
};

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      name: "Smart Budgeting",
      description:
        "Set monthly limits for Food, Travel, or Shopping. We'll notify you automatically before you overspend.",
      href: "#",
      cta: "Learn more",
      className: "md:col-span-2",
      Icon: Zap,
      background: (
        <div className="absolute right-0 top-0 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105">
          {/* Abstract Budget UI */}
          <div className="absolute right-10 top-10 w-[80%] h-full bg-zinc-50 dark:bg-zinc-900 border border-border/50 rounded-xl p-4 shadow-sm flex flex-col gap-4 opacity-50 rotate-3 group-hover:rotate-0 transition-all">
            <div className="flex justify-between items-center">
              <div className="h-2 w-20 bg-muted-foreground/20 rounded-full"></div>
              <div className="h-6 w-16 bg-red-100 text-red-600 text-[10px] flex items-center justify-center rounded-full font-medium">
                Over Limit
              </div>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-[90%]"></div>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-2 w-32 bg-muted-foreground/20 rounded-full"></div>
                <div className="h-2 w-24 bg-muted-foreground/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Bank-Grade Security",
      description:
        "Your financial data is encrypted end-to-end. We maintain strict privacy standards.",
      href: "#",
      cta: "Security details",
      className: "md:col-span-1",
      Icon: ShieldCheck,
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black)]">
          <Lock className="h-48 w-48 text-muted-foreground/10 absolute -right-4 -top-4 rotate-12" />
          <div className="grid grid-cols-4 gap-2 p-4">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary/20 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      ),
    },
    {
      name: "Multi-Account Sync",
      description:
        "Manage Bank accounts, Digital Wallets, and Cash in hand from a single dashboard.",
      href: "#",
      cta: "See integration",
      className: "md:col-span-1",
      Icon: Wallet,
      background: (
        <div className="absolute inset-0 p-6 flex flex-col items-center opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black)]">
          <div className="w-full h-12 bg-background border border-border rounded-lg shadow-sm mb-2 flex items-center px-3 gap-3 -rotate-3 hover:rotate-0 transition-all">
            <div className="h-6 w-6 rounded-full bg-blue-500/20"></div>
            <div className="h-2 w-20 bg-muted-foreground/20 rounded-full"></div>
          </div>
          <div className="w-full h-12 bg-background border border-border rounded-lg shadow-sm mb-2 flex items-center px-3 gap-3 rotate-2 hover:rotate-0 transition-all">
            <div className="h-6 w-6 rounded-full bg-green-500/20"></div>
            <div className="h-2 w-20 bg-muted-foreground/20 rounded-full"></div>
          </div>
          <div className="w-full h-12 bg-background border border-border rounded-lg shadow-sm flex items-center px-3 gap-3 -rotate-1 hover:rotate-0 transition-all">
            <div className="h-6 w-6 rounded-full bg-purple-500/20"></div>
            <div className="h-2 w-20 bg-muted-foreground/20 rounded-full"></div>
          </div>
        </div>
      ),
    },
    {
      name: "Deep Analytics",
      description:
        "Visualize spending habits with interactive charts. Know exactly where your money goes.",
      href: "#",
      cta: "View reports",
      className: "md:col-span-2",
      Icon: PieChart,
      background: (
        <div className="absolute right-0 top-0 h-[300px] w-[600px] border-none opacity-50 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
          <div className="absolute right-4 top-4 w-[70%] h-full bg-background border border-border/50 rounded-xl p-4 shadow-sm flex items-end gap-2">
            <div className="w-full bg-primary/5 rounded-t-sm h-[30%] group-hover:h-[40%] transition-all duration-500"></div>
            <div className="w-full bg-primary/10 rounded-t-sm h-[50%] group-hover:h-[70%] transition-all duration-500"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[40%] group-hover:h-[50%] transition-all duration-500"></div>
            <div className="w-full bg-primary/30 rounded-t-sm h-[70%] group-hover:h-[90%] transition-all duration-500"></div>
            <div className="w-full bg-primary/40 rounded-t-sm h-[55%] group-hover:h-[65%] transition-all duration-500"></div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background Dots */}
      <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:opacity-10 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
            Everything you need to{" "}
            <span className="text-primary">scale your wealth</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We stripped away the complexity of traditional finance tools and
            focused on what matters most: speed, clarity, and control.
          </p>
        </motion.div>

        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
