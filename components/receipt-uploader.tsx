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
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState<ReceiptItem[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      setFileUrl(dataUrl)
      setItems(null)
    }
    reader.readAsDataURL(f)
  }

  async function extract() {
    if (!fileUrl) return
    setLoading(true)
    const extracted = await mockExtractItemsFromImage(fileUrl)
    setItems(extracted)
    setLoading(false)
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
    setFileUrl(undefined)
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
              <Button onClick={extract} disabled={!fileUrl || loading}>
                {loading ? "Memproses..." : "Ekstrak Item (Mock)"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setItems(null)
                  setFileUrl(undefined)
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="border rounded-md bg-muted/30 min-h-48 flex items-center justify-center p-2">
            {fileUrl ? (
              <Image
                src={fileUrl || "/placeholder.svg"}
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
