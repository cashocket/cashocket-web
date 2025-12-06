"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- TEAM DATA ---
// NOTE: Apni images ko 'client/public/team/' folder mein rakhein.
// Example: public/team/alex.jpg
const team = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop", // Replace with "/team/alex.jpg"
    socials: { twitter: "#", linkedin: "#" },
  },
  {
    name: "Sarah Williams",
    role: "Head of Product",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop", // Replace with "/team/sarah.jpg"
    socials: { twitter: "#", linkedin: "#" },
  },
  {
    name: "David Chen",
    role: "Engineering Lead",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop", // Replace with "/team/david.jpg"
    socials: { github: "#", linkedin: "#" },
  },
  {
    name: "Emily Davis",
    role: "Creative Director",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop", // Replace with "/team/emily.jpg"
    socials: { twitter: "#", linkedin: "#" },
  },
];

export function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="team"
      className="py-32 bg-background border-t border-border/40"
    >
      <div className="container mx-auto px-6">
        {/* Header - Minimal & Clean */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6"
        >
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-foreground">
              The minds behind <br /> the mission.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We are a team of builders, designers, and financial experts
              obsessed with simplicity.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-6 h-12 border-foreground/20 hover:bg-foreground hover:text-background transition-all"
          >
            Join the team <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {/* Team Grid - Editorial Style */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16"
        >
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-xl bg-muted aspect-[3/4] mb-6">
                {/* Image itself */}
                <div className="relative h-full w-full grayscale transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105">
                  {/* NOTE: Next/Image use kar rahe hain for optimization. */}
                  {/* Agar external URL use kar rahe ho to next.config.mjs me hostname add karna padega. */}
                  {/* Local images ke liye seedha path use karein. */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Social Overlay (Appears on Hover) */}
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                  {member.socials.twitter && (
                    <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                      <Twitter className="h-5 w-5 fill-current" />
                    </div>
                  )}
                  {member.socials.linkedin && (
                    <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                      <Linkedin className="h-5 w-5 fill-current" />
                    </div>
                  )}
                  {/* @ts-ignore */}
                  {member.socials.github && (
                    <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                      <Github className="h-5 w-5 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
