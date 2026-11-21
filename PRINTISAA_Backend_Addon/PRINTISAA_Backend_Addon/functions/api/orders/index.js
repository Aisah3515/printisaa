const json = (data, status=200) => Response.json(data, { status });
async function getUser(request, env) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i,"");
  if (!token) return null;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)));
  const hash = Array.from(digest,b=>b.toString(16).padStart(2,"0")).join("");
  return env.DB.prepare("SELECT users.id,users.nama FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?").bind(hash,Math.floor(Date.now()/1000)).first();
}
export async function onRequestGet({ request, env }) {
  const user = await getUser(request,env);
  if (!user) return json({error:"Silakan login terlebih dahulu."},401);
  const { results } = await env.DB.prepare("SELECT * FROM orders WHERE user_id=? ORDER BY id DESC").bind(user.id).all();
  return json({orders:results});
}
export async function onRequestPost({ request, env }) {
  const user = await getUser(request,env);
  if (!user) return json({error:"Silakan login terlebih dahulu."},401);
  try {
    const body = await request.json();
    if (!body.jenis_layanan || !Number.isFinite(Number(body.total_harga)) || Number(body.total_harga)<0) return json({error:"Jenis layanan dan total harga wajib valid."},400);
    const nomor = "PRT-"+Date.now().toString(36).toUpperCase();
    const result = await env.DB.prepare("INSERT INTO orders (user_id,nomor_pesanan,jenis_layanan,total_harga,catatan) VALUES (?,?,?,?,?)").bind(user.id,nomor,String(body.jenis_layanan),Number(body.total_harga),body.catatan||null).run();
    const orderId = result.meta.last_row_id;
    for (const item of (Array.isArray(body.items)?body.items:[])) await env.DB.prepare("INSERT INTO order_details (order_id,nama_file,jenis_kertas,ukuran_kertas,warna,jumlah,harga) VALUES (?,?,?,?,?,?,?)").bind(orderId,item.nama_file||null,item.jenis_kertas||null,item.ukuran_kertas||null,item.warna||null,Math.max(1,Number(item.jumlah)||1),Math.max(0,Number(item.harga)||0)).run();
    await env.DB.prepare("INSERT INTO notifications (user_id,judul,pesan) VALUES (?,?,?)").bind(user.id,"Pesanan diterima",`Pesanan ${nomor} berhasil dibuat.`).run();
    return json({message:"Pesanan berhasil dibuat.",nomor_pesanan:nomor},201);
  } catch { return json({error:"Pesanan gagal disimpan."},500); }
}
