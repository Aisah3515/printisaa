PRINTISAA - Backend Add-on (Cloudflare Pages Functions + D1)

PENTING:
- Paket ini menambahkan backend API, bukan mengganti desain frontend.
- Upload file frontend yang sudah dipilih di GitHub BERSAMA folder functions/ dan file wrangler.toml.
- Untuk memakai Pages Functions, proyek perlu dideploy sebagai Cloudflare Pages yang terhubung ke GitHub (bukan Worker static-assets yang lama).
- Binding D1 harus bernama DB.

Database:
Nama: printisaa-db
Database ID: 1505e2ae-ddef-4471-a71c-587d4295a333

Langkah setelah upload ke GitHub:
1. Commit semua file.
2. Cloudflare Dashboard > Workers & Pages > Create application > Pages > Connect to Git.
3. Pilih repository Aisah3515/printisaa.
4. Framework preset: None; Build command kosong; Build output directory: / (atau biarkan root sesuai petunjuk Pages).
5. Setelah Pages project dibuat: Settings > Functions > D1 database bindings.
6. Add binding: Variable name DB, pilih database printisaa-db.
7. Deploy ulang.

API awal:
GET  /api/health
POST /api/auth/register JSON: {"nama":"...","email":"...","password":"..."}
POST /api/auth/login JSON: {"email":"...","password":"..."}
GET  /api/orders (Authorization: Bearer <token>)
POST /api/orders (Authorization: Bearer <token>)

Catatan:
- Backend dasar untuk demonstrasi/proyek kuliah.
- Pembayaran belum terhubung ke payment gateway.
- Upload dokumen fisik belum disimpan ke R2; hanya metadata/nama file.
- Jangan pernah memasukkan password Cloudflare atau API token ke GitHub.
