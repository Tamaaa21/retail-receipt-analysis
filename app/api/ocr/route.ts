export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const apiBase = process.env.OCR_API_URL
    if (!apiBase) {
      return new Response(JSON.stringify({ error: "OCR_API_URL is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const forward = new FormData()
    forward.append("file", file)

    const resp = await fetch(`${apiBase.replace(/\/$/, "")}/api/ocr`, {
      method: "POST",
      body: forward,
    })

    const text = await resp.text()
    return new Response(text, {
      status: resp.status,
      headers: { "Content-Type": resp.headers.get("Content-Type") || "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
