const json = (data, status=200) => Response.json(data, { status });
async function makeHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name:"PBKDF2", salt, iterations:100000, hash:"SHA-256" }, key, 256);
  const hex = a => Array.from(a, b => b.toString(16).padStart(2,"0")).join("");
  return `${hex(salt)}:${hex(new Uint8Array(bits))}`;
}
export async function onRequestPost({ request, env }) {
  try {
    const { nama, email, password } = await request.json();
    if (!nama || !email || !password || String(password).length < 8) return json({ error:"Nama, email, dan password minimal 8 karakter wajib diisi." },400);
    await env.DB.prepare("INSERT INTO users (nama,email,password_hash) VALUES (?,?,?)").bind(String(nama).trim(),String(email).trim().toLowerCase(),await makeHash(String(password))).run();
    return json({ message:"Pendaftaran berhasil. Silakan login." },201);
  } catch (e) {
    if (String(e).includes("UNIQUE")) return json({ error:"Email sudah terdaftar." },409);
    return json({ error:"Pendaftaran gagal. Periksa koneksi database." },500);
  }
}
