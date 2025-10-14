# Python OCR API (Flask)

File OCR kamu telah diimpor ke `scripts/ocr_api.py`. Jalankan server ini di lingkungan Python kamu (lokal/VM) lalu set Vars `OCR_API_URL` di sidebar v0:

Contoh:
- Jalankan Flask di http://localhost:5000
- Set Vars: `OCR_API_URL = http://localhost:5000`

Frontend memanggil Next.js route `/api/ocr` yang mem-proxy ke server Python tersebut, sehingga tidak terkena CORS. Komponen uploader akan mencoba OCR terlebih dahulu lalu fallback ke ekstraksi mock bila server/env belum siap.
