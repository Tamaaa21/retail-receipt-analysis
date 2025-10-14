"use client"

import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useReceipts, useSuppliers } from "@/lib/local-db"

export default function HomePage() {
  const { receipts } = useReceipts()
  const { suppliers } = useSuppliers()
  const totalItems = receipts.reduce((acc, r) => acc + r.items.length, 0)

  return (
    <main>
      <AppHeader />
      <section className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-balance">Perbandingan Harga Nota Retail</h1>
          <div className="flex gap-2">
            <Link href="/upload">
              <Button>Upload Nota</Button>
            </Link>
            <Link href="/compare">
              <Button variant="secondary">Bandingkan Harga</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{suppliers.length}</div>
              <div className="text-sm text-muted-foreground">Total supplier terdaftar</div>
              <div className="mt-3">
                <Link href="/suppliers" className="underline">
                  Kelola supplier
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Nota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{receipts.length}</div>
              <div className="text-sm text-muted-foreground">Total nota tersimpan</div>
              <div className="mt-3">
                <Link href="/upload" className="underline">
                  Tambah nota baru
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{totalItems}</div>
              <div className="text-sm text-muted-foreground">Total item terekstrak</div>
              <div className="mt-3">
                <Link href="/compare" className="underline">
                  Lihat perbandingan
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Langkah Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ol className="list-decimal pl-4 text-sm leading-6">
              <li>Tambahkan supplier toko Anda di halaman Supplier.</li>
              <li>Upload foto/scan nota pada halaman Upload Nota dan sesuaikan hasil ekstraksi.</li>
              <li>Simpan nota, lalu buka Perbandingan untuk melihat harga terendah per item.</li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
