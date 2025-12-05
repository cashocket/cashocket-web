import { cn } from "@/lib/utils";
import Image from "next/image";

interface CategoryIconViewProps {
  icon: string;
  color?: string;
  className?: string;
}

export function CategoryIconView({
  icon,
  color,
  className,
}: CategoryIconViewProps) {
  // Check agar icon image data (base64) hai ya URL hai
  const isImage = icon?.startsWith("data:image") || icon?.startsWith("http");

  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 border",
        !isImage && "bg-muted", // Agar emoji hai to background gray rakho
        className
      )}
      style={{ borderColor: color }}
    >
      {isImage ? (
        <img src={icon} alt="icon" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xl">{icon || "🏷️"}</span>
      )}
    </div>
  );
}
