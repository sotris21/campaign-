"use client";
// components/layout/SideNav.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  FileText,
  Calendar,
  Hash,
  Wrench,
  ShieldCheck,
  Image as ImageIcon,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate Content", icon: Zap },
  { href: "/content", label: "Content Review", icon: FileText },
  { href: "/calendar", label: "Content Calendar", icon: Calendar },
  { href: "/assets", label: "Campaign Assets", icon: ImageIcon },
  { href: "/hashtags", label: "Hashtag Bank", icon: Hash },
  { href: "/tools", label: "Free Tools", icon: Wrench },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
];

export function SideNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-campaign-border">
        <div className="text-campaign-gold font-serif font-black text-lg leading-tight">
          Campaign Hub
        </div>
        <div className="text-campaign-muted text-xs mt-1">
          Andreas Karagiannopoulos
        </div>
        <div className="text-campaign-muted text-xs">Reform UK · Bromford & Hodge Hill</div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? "bg-campaign-gold text-black"
                  : "text-campaign-muted hover:text-white hover:bg-campaign-dark"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Warning footer */}
      <div className="px-4 pb-4">
        <div className="bg-yellow-950 border border-yellow-700 rounded-lg p-3 text-xs text-yellow-300">
          ⚠️ All content requires human review before publishing.
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-campaign-dark border border-campaign-border rounded-lg p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-campaign-dark border-r border-campaign-border flex-col z-30">
        <NavContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-campaign-dark border-r border-campaign-border flex flex-col z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
