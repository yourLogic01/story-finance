"use client";

interface RetroTierIconProps {
  tierId: "bronze" | "silver" | "gold" | "platinum" | "immortal";
  className?: string;
  size?: number;
}

/**
 * Pure 8-bit Pixel Art Icons rendered with crisp pixel edges.
 * Replaces modern device emojis with authentic retro game sprites.
 */
export function RetroTierIcon({
  tierId,
  className = "",
  size = 16,
}: RetroTierIconProps) {
  switch (tierId) {
    case "bronze":
      // 8-bit Pixel Sprout 🌱 (Tunas Hijau Bertumbuh)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Soil Base */}
          <rect x="4" y="13" width="8" height="2" fill="#78350F" />
          <rect x="5" y="12" width="6" height="1" fill="#92400E" />
          {/* Stem */}
          <rect x="7" y="7" width="2" height="5" fill="#15803D" />
          <rect x="7" y="6" width="2" height="2" fill="#22C55E" />
          {/* Left Leaf */}
          <rect x="3" y="6" width="3" height="2" fill="#15803D" />
          <rect x="2" y="7" width="2" height="2" fill="#15803D" />
          <rect x="4" y="5" width="3" height="2" fill="#22C55E" />
          <rect x="3" y="6" width="2" height="1" fill="#4ADE80" />
          <rect x="5" y="5" width="1" height="1" fill="#86EFAC" />
          {/* Right Leaf */}
          <rect x="9" y="4" width="3" height="2" fill="#15803D" />
          <rect x="11" y="5" width="2" height="2" fill="#15803D" />
          <rect x="8" y="3" width="3" height="2" fill="#22C55E" />
          <rect x="9" y="4" width="2" height="1" fill="#4ADE80" />
          <rect x="9" y="3" width="1" height="1" fill="#86EFAC" />
        </svg>
      );

    case "silver":
      // 8-bit Pixel Shield
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Shield Border */}
          <rect x="2" y="2" width="12" height="2" fill="#334155" />
          <rect x="2" y="4" width="2" height="5" fill="#334155" />
          <rect x="12" y="4" width="2" height="5" fill="#334155" />
          <rect x="3" y="9" width="2" height="2" fill="#334155" />
          <rect x="11" y="9" width="2" height="2" fill="#334155" />
          <rect x="4" y="11" width="2" height="2" fill="#334155" />
          <rect x="10" y="11" width="2" height="2" fill="#334155" />
          <rect x="6" y="13" width="4" height="2" fill="#334155" />
          {/* Shield Plate (Silver) */}
          <rect x="4" y="4" width="8" height="5" fill="#CBD5E1" />
          <rect x="5" y="9" width="6" height="2" fill="#94A3B8" />
          <rect x="6" y="11" width="4" height="2" fill="#64748B" />
          {/* Highlight Cross */}
          <rect x="7" y="4" width="2" height="7" fill="#FFFFFF" />
          <rect x="5" y="6" width="6" height="2" fill="#FFFFFF" />
        </svg>
      );

    case "gold":
      // 8-bit Pixel Star / Sword
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Star Outline */}
          <rect x="7" y="1" width="2" height="2" fill="#78350F" />
          <rect x="6" y="3" width="4" height="2" fill="#78350F" />
          <rect x="1" y="5" width="14" height="2" fill="#78350F" />
          <rect x="3" y="7" width="10" height="2" fill="#78350F" />
          <rect x="4" y="9" width="8" height="2" fill="#78350F" />
          <rect x="3" y="11" width="3" height="3" fill="#78350F" />
          <rect x="10" y="11" width="3" height="3" fill="#78350F" />
          {/* Star Body (Gold) */}
          <rect x="7" y="2" width="2" height="8" fill="#FBBF24" />
          <rect x="3" y="6" width="10" height="1" fill="#FBBF24" />
          <rect x="5" y="7" width="6" height="3" fill="#F59E0B" />
          <rect x="4" y="11" width="2" height="2" fill="#F59E0B" />
          <rect x="10" y="11" width="2" height="2" fill="#F59E0B" />
          {/* Gleam Sparkle */}
          <rect x="7" y="4" width="2" height="2" fill="#FEF08A" />
          <rect x="6" y="5" width="4" height="1" fill="#FFFFFF" />
        </svg>
      );

    case "platinum":
      // 8-bit Pixel Emerald Gem
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Gem Border */}
          <rect x="5" y="2" width="6" height="1" fill="#064E3B" />
          <rect x="3" y="3" width="2" height="2" fill="#064E3B" />
          <rect x="11" y="3" width="2" height="2" fill="#064E3B" />
          <rect x="1" y="5" width="2" height="3" fill="#064E3B" />
          <rect x="13" y="5" width="2" height="3" fill="#064E3B" />
          <rect x="3" y="8" width="2" height="3" fill="#064E3B" />
          <rect x="11" y="8" width="2" height="3" fill="#064E3B" />
          <rect x="5" y="11" width="2" height="2" fill="#064E3B" />
          <rect x="9" y="11" width="2" height="2" fill="#064E3B" />
          <rect x="7" y="13" width="2" height="2" fill="#064E3B" />
          {/* Gem Facets (Emerald) */}
          <rect x="5" y="3" width="6" height="2" fill="#34D399" />
          <rect x="3" y="5" width="10" height="3" fill="#10B981" />
          <rect x="5" y="8" width="6" height="3" fill="#059669" />
          <rect x="7" y="11" width="2" height="2" fill="#047857" />
          {/* Sparkle Reflection */}
          <rect x="5" y="4" width="2" height="3" fill="#A7F3D0" />
          <rect x="6" y="3" width="3" height="1" fill="#FFFFFF" />
        </svg>
      );

    case "immortal":
      // 8-bit Pixel Imperial Crown
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Crown Outline */}
          <rect x="2" y="12" width="12" height="2" fill="#3B0764" />
          <rect x="1" y="7" width="2" height="5" fill="#3B0764" />
          <rect x="13" y="7" width="2" height="5" fill="#3B0764" />
          <rect x="2" y="5" width="2" height="2" fill="#3B0764" />
          <rect x="7" y="3" width="2" height="2" fill="#3B0764" />
          <rect x="12" y="5" width="2" height="2" fill="#3B0764" />
          {/* Crown Body (Amethyst Purple & Gold Jewels) */}
          <rect x="3" y="7" width="10" height="5" fill="#9333EA" />
          <rect x="4" y="6" width="2" height="2" fill="#A855F7" />
          <rect x="7" y="5" width="2" height="3" fill="#C084FC" />
          <rect x="10" y="6" width="2" height="2" fill="#A855F7" />
          {/* Base Rim with Jewels */}
          <rect x="3" y="11" width="10" height="1" fill="#F59E0B" />
          <rect x="4" y="9" width="1" height="1" fill="#FDE047" />
          <rect x="7" y="8" width="2" height="1" fill="#FFFFFF" />
          <rect x="11" y="9" width="1" height="1" fill="#FDE047" />
        </svg>
      );
  }
}
