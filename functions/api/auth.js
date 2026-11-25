const SITE_ORIGIN = "https://violetachang.com";
const CALLBACK_URL = `${SITE_ORIGIN}/api/callback`;
const STATE_COOKIE = "vc_oauth_state";

function randomState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") {
    return new Response("Método no permitido", { status: 405 });
  }
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== SITE_ORIGIN) {
    return new Response("Origen no permitido", { status: 400 });
  }
  const provider = requestUrl.searchParams.get("provider") || "github";
  if (provider !== "github") {
    return new Response("Proveedor no permitido", { status: 400 });
  }
  if (!env.GITHUB_CLIENT_ID) {
    return new Response("Falta configurar GITHUB_CLIENT_ID en Cloudflare", { status: 500 });
  }
  const state = randomState();
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  authorizeUrl.searchParams.set("scope", "public_repo");
  authorizeUrl.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      "Set-Cookie": `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/callback; Max-Age=600`,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
