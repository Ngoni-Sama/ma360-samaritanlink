// Single wrapper around lucide-react so the rest of the app references icons by
// name. NO EMOJIS anywhere in this product — professional line icons only.
import {
  Activity, AlertTriangle, ArrowRight, BadgeCheck, Bell, CalendarClock,
  CheckCircle2, ClipboardList, Compass, FlaskConical, HeartPulse, HeartHandshake,
  Home, LayoutDashboard, LineChart, LogOut, MapPin, Menu, MessageSquareText,
  Package, Pill, Route, Send, Shield, ShieldCheck, Stethoscope, Users, UserRound,
  X, Building2, GraduationCap, Landmark, TestTube, Truck, ClipboardCheck,
  Cross, Mail, Phone, ExternalLink, Search, Fingerprint,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Activity, AlertTriangle, ArrowRight, BadgeCheck, Bell, CalendarClock,
  CheckCircle2, ClipboardList, Compass, FlaskConical, HeartPulse, HeartHandshake,
  Home, LayoutDashboard, LineChart, LogOut, MapPin, Menu, MessageSquareText,
  Package, Pill, Route, Send, Shield, ShieldCheck, Stethoscope, Users, UserRound,
  X, Building2, GraduationCap, Landmark, TestTube, Truck, ClipboardCheck,
  Cross, Mail, Phone, ExternalLink, Search, IdCard: Fingerprint,
};

export function Icon({
  name,
  className,
  strokeWidth = 1.8,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = ICONS[name] ?? Activity;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
