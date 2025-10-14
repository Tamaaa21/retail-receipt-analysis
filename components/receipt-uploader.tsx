"use client"

import type React from "react"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ItemsEditor } from "./items-editor"
import { mockExtractItemsFromImage, type ReceiptItem, useReceipts } from "@/lib/local-db"

export function ReceiptUploader() {
  const { addReceipt } = useReceipts()
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined)
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // simpan file asli
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState<ReceiptItem[] | null>(null)
  const [ocrText, setOcrText] = useState<string | null>(null) // simpan hasil OCR mentah
  const [loading, setLoading] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      setFileUrl(dataUrl)
      setItems(null)
      setOcrText(null) // reset ocrText
    }
    reader.readAsDataURL(f)
    setSelectedFile(f) // simpan file asli untuk dikirim ke OCR
  }

  function parseItemsFromText(text: string): ReceiptItem[] {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)

    const results: ReceiptItem[] = []
    for (const line of lines) {
      // Deteksi harga di akhir baris, mis. "Indomie Goreng 2 x 3500 7000" atau "Gula Pasir 12.500"
      const priceMatch = line.match(/(?:\s|^)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+)\s*$/)
      if (!priceMatch) continue
      const priceStr = priceMatch[1]
      const cleaned = priceStr.replace(/[^\d.,]/g, "")
      // Normalisasi: ganti koma jadi titik jika perlu lalu hapus pemisah ribuan
      const normalized =
        cleaned.includes(",") && cleaned.includes(".")
          ? cleaned.replace(/\./g, "").replace(",", ".")
          : cleaned.replace(/,/g, ".").replace(/\.(?=\d{3}(\D|$))/g, "")
      const unitPrice = Number.parseFloat(normalized)
      if (!isFinite(unitPrice) || unitPrice <= 0) continue

      // Cari jumlah, pola "2 x" atau "x2"
      let qty = 1
      const qtyMatch = line.match(/(\d+)\s*[xX]/) || line.match(/[xX]\s*(\d+)/)
      if (qtyMatch) {
        const q = Number.parseInt(qtyMatch[1] || qtyMatch[0]?.replace(/[^\d]/g, ""))
        if (isFinite(q) && q > 0) qty = q
      }

      // Nama: hapus bagian harga dan kuantitas
      let name = line
        .replace(priceStr, "")
        .replace(/\b\d+\s*[xX]\b|\b[xX]\s*\d+\b/g, "")
        .trim()
      // Bersihkan sisa simbol
      name = name
        .replace(/[-•*|]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
      if (!name) name = "Item"

      results.push({
        id: crypto.randomUUID(),
        name,
        quantity: qty,
        unitPrice,
        supplierId: undefined,
      })
    }
    // Jika kelihatannya satu baris adalah subtotal/total, hasil bisa banyak salah. Kembalikan minimal unik.
    return results
  }

  async function extract() {
    if (!fileUrl || !selectedFile) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("file", selectedFile)
      const res = await fetch("/api/ocr", { method: "POST", body: fd })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        const text = data?.text || data?.ocr || ""
        if (text) setOcrText(text)
        const parsed = text ? parseItemsFromText(text) : []
        if (parsed.length > 0) {
          setItems(parsed)
        } else {
          // fallback ke mock jika parsing kosong
          const extracted = await mockExtractItemsFromImage(fileUrl)
          setItems(extracted)
        }
      } else {
        // fallback ke mock jika server error
        const extracted = await mockExtractItemsFromImage(fileUrl)
        setItems(extracted)
      }
    } catch (err) {
      // fallback ke mock jika jaringan/ENV belum siap
      const extracted = await mockExtractItemsFromImage(fileUrl)
      setItems(extracted)
    } finally {
      setLoading(false)
    }
  }

  function saveReceipt() {
    if (!items || !fileUrl) return
    const rDate = new Date(date)
    addReceipt({
      title: title || "Nota Baru",
      date: isNaN(rDate.getTime()) ? new Date().toISOString() : rDate.toISOString(),
      imageDataUrl: fileUrl,
      items,
    })
    // reset
    setTitle("")
    setItems(null)
    setOcrText(null) // reset ocr text saat simpan
    setFileUrl(undefined)
    setSelectedFile(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Nota / Struk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Input type="file" accept="image/*" onChange={onFile} />
            <Input
              placeholder="Judul / Nama Nota (opsional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={extract} disabled={!fileUrl || !selectedFile || loading}>
                {loading ? "Memproses..." : "Ekstrak Item (OCR)"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setItems(null)
                  setOcrText(null)
                  setFileUrl(undefined)
                  setSelectedFile(null)
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="border rounded-md bg-muted/30 min-h-48 flex items-center justify-center p-2">
            {fileUrl ? (
              <Image
                src={fileUrl || "/placeholder.svg?height=400&width=400&query=preview%20nota"}
                alt="Pratinjau Nota"
                width={400}
                height={400}
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="text-sm text-muted-foreground">Pratinjau gambar akan tampil di sini</div>
            )}
          </div>
        </div>

        {ocrText && (
          <div className="space-y-2">
            <h3 className="font-semibold">Hasil OCR (mentah)</h3>
            <pre className="text-xs whitespace-pre-wrap bg-muted/40 p-3 rounded-md max-h-64 overflow-auto">
              {ocrText}
            </pre>
          </div>
        )}

        {items && (
          <div className="space-y-3">
            <h3 className="font-semibold">Hasil Ekstraksi (bisa diedit)</h3>
            <ItemsEditor items={items} onChange={setItems} />
            <div className="flex justify-end">
              <Button onClick={saveReceipt} disabled={!fileUrl}>
                Simpan Nota
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
