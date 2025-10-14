"use client"

import { useState } from "react"
import type { ReceiptItem } from "@/lib/local-db"
import { SupplierSelect } from "./supplier-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  items: ReceiptItem[]
  onChange: (items: ReceiptItem[]) => void
}

export function ItemsEditor({ items, onChange }: Props) {
  const [local, setLocal] = useState<ReceiptItem[]>(items)

  function commit(next: ReceiptItem[]) {
    setLocal(next)
    onChange(next)
  }

  function updateField(id: string, patch: Partial<ReceiptItem>) {
    const next = local.map((it) => (it.id === id ? { ...it, ...patch } : it))
    commit(next)
  }

  function addRow() {
    const next = [...local, { id: crypto.randomUUID(), name: "", qty: 1, price: 0 }]
    commit(next)
  }

  function removeRow(id: string) {
    const next = local.filter((it) => it.id !== id)
    commit(next)
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-3">Item</th>
            <th className="py-2 pr-3">Qty</th>
            <th className="py-2 pr-3">Harga</th>
            <th className="py-2 pr-3">Supplier</th>
            <th className="py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {local.map((it) => (
            <tr key={it.id} className="border-b">
              <td className="py-2 pr-3 min-w-40">
                <Input
                  value={it.name}
                  onChange={(e) => updateField(it.id, { name: e.target.value })}
                  placeholder="Nama item"
                />
              </td>
              <td className="py-2 pr-3 min-w-20">
                <Input
                  type="number"
                  min={0}
                  value={String(it.qty)}
                  onChange={(e) => updateField(it.id, { qty: Number(e.target.value) || 0 })}
                />
              </td>
              <td className="py-2 pr-3 min-w-28">
                <Input
                  type="number"
                  min={0}
                  value={String(it.price)}
                  onChange={(e) => updateField(it.id, { price: Number(e.target.value) || 0 })}
                />
              </td>
              <td className="py-2 pr-3 min-w-40">
                <SupplierSelect value={it.supplierId} onChange={(supplierId) => updateField(it.id, { supplierId })} />
              </td>
              <td className="py-2">
                <Button variant="destructive" onClick={() => removeRow(it.id)}>
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3">
        <Button onClick={addRow}>Tambah Baris</Button>
      </div>
    </div>
  )
}
