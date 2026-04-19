import React from "react";
import { cn } from "@/lib/utils";

interface PageBannerProps {
  image: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  height?: "sm" | "md" | "lg";
  align?: "left" | "center";
  children?: React.ReactNode;
  className?: string;
}

const heightMap = {
  sm: "h-40 md:h-48",
  md: "h-56 md:h-72",
  lg: "h-72 md:h-96",
};

const PageBanner: React.FC<PageBannerProps> = ({
  image,
  title,
  subtitle,
  eyebrow,
  icon,
  height = "md",
  align = "left",
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border shadow-sm",
        heightMap[height],
        className,
      )}
    >
      {/* Background image */}
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay - works for both light & dark */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {/* Brand accent glow */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />

      <div
        className={cn(
          "relative z-10 h-full px-6 md:px-10 py-6 flex flex-col justify-end gap-2 text-white",
          align === "center" && "items-center text-center",
        )}
      >
        {eyebrow && (
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-semibold w-fit",
              align === "center" && "mx-auto",
            )}
          >
            {icon}
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base text-white/85 max-w-2xl drop-shadow">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

// Curated royalty-free Unsplash solar / clean-energy banners
export const BANNERS = {
  studio:
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=70", // sun & solar panels
  idCards:
    "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1600&q=70", // engineer with badge
  visiting:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=70", // modern office
  social:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1600&q=70", // creative gradient
  proposals:
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1600&q=70", // solar farm aerial
  dashboard:
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=70", // solar field at dawn
  admin:
    "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1600&q=70", // server / ops feel
  auth:
    "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1600&q=70", // sunrise solar
  landing:
    "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=1920&q=75", // hero solar field
  comingSoon:
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=70",
};

export default PageBanner;
