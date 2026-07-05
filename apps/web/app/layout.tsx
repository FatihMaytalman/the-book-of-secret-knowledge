import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "AOM Legacy Family Tree",
  description: "Private digital family legacy platform for media, genealogy, AI heritage, and social memory preservation."
};

const navItems = [
  { href: "/", label: "Museum" },
  { href: "/people", label: "People" },
  { href: "/review", label: "Review" },
  { href: "/social", label: "Social Hub" }
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="page-shell">
          <nav className="top-nav" aria-label="Primary navigation">
            <Link className="brand" href="/">
              <span className="brand-mark">AOM Legacy</span>
              <span className="brand-subtitle">Family Tree master archive</span>
            </Link>
            <div className="nav-links">
              {navItems.map((item) => (
                <Link className="nav-link" href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
