import {
  Coffee,
  ShoppingCart,
  Bus,
  FileText,
  Sparkles,
  HeartPulse,
  Tag,
  Briefcase,
  TrendingUp,
  DollarSign,
  PlusCircle,
  LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  coffee: Coffee,
  "shopping-cart": ShoppingCart,
  bus: Bus,
  "file-text": FileText,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  tag: Tag,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  "plus-circle": PlusCircle,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return CATEGORY_ICON_MAP[iconName] || Tag;
}
