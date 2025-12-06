"use client";

import { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PricingSection() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  const tiers = [
    {
      name: "Starter",
      description: "For individuals just getting started.",
      price: { monthly: 0, yearly: 0 },
      features: [
        "2 Accounts connected",
        "Basic Expense Tracking",
        "1 Budget Category",
        "7-day History",
        "Community Support",
      ],
      notIncluded: ["Export Data", "AI Insights", "Multi-currency"],
      cta: "Get Started Free",
      variant: "outline",
      popular: false,
    },
    {
      name: "Pro",
      description: "For creators & freelancers scaling up.",
      price: { monthly: 9, yearly: 90 }, // 2 months free
      features: [
        "Unlimited Accounts",
        "Smart AI Budgets",
        "Full Transaction History",
        "Export to CSV/PDF",
        "Multi-Currency Support",
        "Priority Support",
      ],
      notIncluded: ["Team Collaboration"],
      cta: "Start Free Trial",
      variant: "default",
      popular: true,
    },
    {
      name: "Team",
      description: "For small teams and agencies.",
      price: { monthly: 29, yearly: 290 },
      features: [
        "Everything in Pro",
        "5 Team Members",
        "Admin Roles & Permissions",
        "Audit Logs",
        "Dedicated Account Manager",
        "SLA Support",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      variant: "outline",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose the plan that fits your financial goals. No hidden fees.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center mt-8 gap-4">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                !isYearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative h-7 w-12 rounded-full bg-input transition-colors hover:bg-muted-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "absolute left-1 top-1 h-5 w-5 rounded-full bg-primary transition-transform duration-200",
                  isYearly ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2",
                isYearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Yearly
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
              >
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={cn(
                "relative rounded-3xl p-8 border transition-all duration-300 flex flex-col h-full",
                tier.popular
                  ? "bg-background border-primary/50 shadow-2xl shadow-primary/10 z-10 scale-105"
                  : "bg-background/50 border-border/50 hover:border-border hover:shadow-lg"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="h-3 w-3 fill-current" /> Most Popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 h-10">
                  {tier.description}
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    $
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isYearly ? "year" : "month"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isYearly ? tier.price.yearly : tier.price.monthly}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="text-muted-foreground">
                    /{isYearly ? "year" : "mo"}
                  </span>
                </div>
                {isYearly && tier.price.monthly > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed ${tier.price.yearly} yearly
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
                {tier.notIncluded.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm text-muted-foreground/50"
                  >
                    <div className="h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="h-3 w-3" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => router.push("/signup")}
                variant={tier.variant === "default" ? "default" : "outline"}
                className={cn(
                  "w-full rounded-full h-11 text-base transition-all",
                  tier.popular
                    ? "shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    : "hover:bg-muted"
                )}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise / Custom */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need a custom plan for a large organization? <br />
            <button className="text-primary hover:underline font-medium mt-2">
              Contact our sales team
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
