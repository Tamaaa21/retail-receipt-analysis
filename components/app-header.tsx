"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"

const links = [
  { href: "/", label: "Beranda" },
  { href: "/upload", label: "Upload Nota" },
  { href: "/suppliers", label: "Supplier" },
  { href: "/compare", label: "Perbandingan" },
]

export function AppHeader() {
  const pathname = usePathname()
  return (
    <header className="w-full border-b bg-card">
      <div className="h-1 w-full bg-primary" aria-hidden />
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/placeholder-logo.svg"
            alt="Retail Nota Compare"
            width={28}
            height={28}
            className="rounded-sm"
            priority
          />
          <span className="font-semibold text-lg text-primary">Retail Nota Compare</span>
        </Link>
        <nav className="flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === l.href
                  ? "bg-primary text-primary-foreground hover:bg-primary"
                  : "text-foreground hover:bg-accent",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
