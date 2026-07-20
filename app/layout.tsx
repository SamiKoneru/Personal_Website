import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { profile } from "@/data/profile";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${profile.name} | ${profile.tagline}`,
  description: profile.about,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <div className="bg-blobs" aria-hidden />

        <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--background)]/70 backdrop-blur-md animate-fade-in-up">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm sm:px-10 lg:px-16">
            <Link
              href="/"
              className="link-underline font-medium tracking-tight"
            >
              {profile.name}
            </Link>
            <div className="flex gap-7 text-[color:var(--muted)]">
              <Link
                href="/"
                className="link-underline hover:text-[color:var(--foreground)]"
              >
                About
              </Link>
              <Link
                href="/projects"
                className="link-underline hover:text-[color:var(--foreground)]"
              >
                Projects
              </Link>
              <a
                href={`mailto:${profile.email}`}
                className="link-underline hover:text-[color:var(--foreground)]"
              >
                Contact
              </a>
            </div>
          </nav>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          {children}
          <footer className="mt-24 border-t border-[color:var(--border)] pt-6 text-sm text-[color:var(--muted)] sm:mt-28">
            © {new Date().getFullYear()} {profile.name}
          </footer>
        </div>
      </body>
    </html>
  );
}
