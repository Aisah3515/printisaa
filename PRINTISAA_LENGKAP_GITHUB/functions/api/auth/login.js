const json = (data, status=200) => Response.json(data, { status });
const hex = a => Array.from(a, b => b.toString(16).padStart(2,"0")).join("");
async function verify(password, stored) {
  const [saltHex, expected] = stored.split(":");
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g).map(x => parseInt(x,16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name:"PBKDF2", salt, iterations:100000, hash:"SHA-256" }, key, 256);
  return hex(new Uint8Array(bits)) === expected;
}
async function sha256(value) { return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))); }
export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return json({ error:"Email dan password wajib diisi." },400);
    const user = await env.DB.prepare("SELECT id,nama,email,password_hash FROM users WHERE email=?").bind(String(email).trim().toLowerCase()).first();
    if (!user || !(await verify(String(password),user.password_hash))) return json({ error:"Email atau password salah." },401);
    const token = hex(crypto.getRandomValues(new Uint8Array(32)));
    await env.DB.prepare("INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)").bind(await sha256(token),user.id,Math.floor(Date.now()/1000)+604800).run();
    return json({ message:"Login berhasil.", token, user:{id:user.id,nama:user.nama,email:user.email} });
  } catch { return json({ error:"Login gagal. Pastikan tabel sessions sudah dibuat." },500); }
}
