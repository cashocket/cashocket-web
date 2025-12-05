"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface ProfileFormProps {
  user: any; // Parent se user data aayega
  onUpdate: () => void; // Refresh trigger
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- IMAGE VALIDATION LOGIC ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Check Size (Limit: 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      toast.error("File is too large! Please upload an image under 2MB.", {
        description: "Compress the image and try again.",
      });
      // Input reset karo
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Hamein baki fields bhi bhejni padengi warna wo null ho sakti hain (Backend logic dependent)
      // Safe side ke liye hum purana currency/theme bhej rahe hain
      await api.put("/users/profile", {
        name,
        avatar,
        currency: user.currency,
        theme: user.theme,
      });

      toast.success("Profile updated successfully!");

      // Update local storage
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...savedUser, name, avatar })
      );

      onUpdate(); // Parent ko refresh karo
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your photo and personal details.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar
                className="h-24 w-24 cursor-pointer border-4 border-muted/50 transition-all hover:border-primary/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <AvatarImage src={avatar} className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                  {name?.charAt(0).toUpperCase()}
                </AvatarFallback>
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex flex-col gap-2 text-center sm:text-left">
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Photo
                </Button>
                {avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setAvatar("")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG. Max size <strong>2MB</strong>.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
