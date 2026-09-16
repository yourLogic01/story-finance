"use client";

import {
  Gamepad2,
  Headphones,
  Laptop,
  Smartphone,
  Shield,
  Car,
  Watch,
  Gift,
  Camera,
  Sparkles,
  Shirt,
  Plane,
} from "lucide-react";

export type WishlistIconKey =
  | "gamepad"
  | "headphones"
  | "laptop"
  | "phone"
  | "shield"
  | "car"
  | "watch"
  | "gift"
  | "camera"
  | "sparkles"
  | "shirt"
  | "plane";

export const WISHLIST_ICON_LIST: {
  key: WishlistIconKey;
  label: string;
}[] = [
  { key: "gamepad", label: "Gaming" },
  { key: "headphones", label: "Audio" },
  { key: "laptop", label: "Laptop" },
  { key: "phone", label: "Gadget" },
  { key: "camera", label: "Kamera" },
  { key: "shirt", label: "Fashion" },
  { key: "watch", label: "Aksesoris" },
  { key: "plane", label: "Liburan" },
  { key: "car", label: "Kendaraan" },
  { key: "shield", label: "Darurat" },
  { key: "gift", label: "Kado" },
  { key: "sparkles", label: "Impian" },
];

interface RetroItemIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export function RetroItemIcon({
  icon,
  className = "",
  size = 20,
}: RetroItemIconProps) {
  const iconProps = {
    className,
    style: { width: size, height: size },
  };

  switch (icon) {
    case "gamepad":
      return <Gamepad2 {...iconProps} />;
    case "headphones":
      return <Headphones {...iconProps} />;
    case "laptop":
      return <Laptop {...iconProps} />;
    case "phone":
      return <Smartphone {...iconProps} />;
    case "shield":
      return <Shield {...iconProps} />;
    case "car":
      return <Car {...iconProps} />;
    case "watch":
      return <Watch {...iconProps} />;
    case "camera":
      return <Camera {...iconProps} />;
    case "sparkles":
      return <Sparkles {...iconProps} />;
    case "shirt":
      return <Shirt {...iconProps} />;
    case "plane":
      return <Plane {...iconProps} />;
    case "gift":
    default:
      return <Gift {...iconProps} />;
  }
}
