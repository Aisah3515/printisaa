export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare("SELECT 1 AS ok").first();
    return Response.json({ ok: true, database: result?.ok === 1 ? "connected" : "unknown" });
  } catch {
    return Response.json({ ok: false, error: "Database binding DB belum terhubung." }, { status: 500 });
  }
}
