import {
  Briefcase,
  Car,
  GraduationCap,
  Heart,
  Home,
  Plane,
  ShieldCheck,
  Sparkles,
  Umbrella,
  type LucideIcon,
} from "lucide-react";
import type { GoalCategory } from "@/types/finance";

export const GOAL_META: Record<GoalCategory, { icon: LucideIcon; label: string; accent: string }> = {
  car: { icon: Car, label: "Car", accent: "var(--chart-1)" },
  home: { icon: Home, label: "Home", accent: "var(--chart-3)" },
  education: { icon: GraduationCap, label: "Education", accent: "var(--chart-5)" },
  travel: { icon: Plane, label: "Travel", accent: "var(--chart-6)" },
  wedding: { icon: Heart, label: "Wedding", accent: "var(--chart-4)" },
  retirement: { icon: Umbrella, label: "Retirement", accent: "var(--chart-2)" },
  business: { icon: Briefcase, label: "Business", accent: "var(--chart-3)" },
  emergency: { icon: ShieldCheck, label: "Emergency fund", accent: "var(--chart-2)" },
  other: { icon: Sparkles, label: "Other", accent: "var(--chart-6)" },
};

export const GOAL_CATEGORIES = Object.keys(GOAL_META) as GoalCategory[];
