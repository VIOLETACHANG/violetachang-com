const SITE_ORIGIN = "https://violetachang.com";
const CALLBACK_URL = `${SITE_ORIGIN}/api/callback`;
const STATE_COOKIE = "vc_oauth_state";
const CLEAR_STATE_COOKIE = `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/callback; Max-Age=0`;

function textResponse(message, status, headers = {}) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": CLEAR_STATE_COOKIE,
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") {
    return textResponse("Método no permitido", 405);
  }
  const url = new URL(request.url);
  if (url.origin !== SITE_ORIGIN) {
    return textResponse("Origen no permitido", 400);
  }
  if (url.searchParams.has("error")) {
    return textResponse("Autorización cancelada. Puedes cerrar esta ventana.", 400);
  }
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)vc_oauth_state=([^;]+)/);
  const savedState = match ? match[1] : "";
  if (!code || !returnedState || !savedState || returnedState !== savedState) {
    return textResponse("La autorización no pudo validarse. Cierra esta ventana e inténtalo otra vez.", 400);
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return textResponse("Falta configurar la aplicación OAuth en Cloudflare.", 500);
  }
  let tokenData;
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: CALLBACK_URL,
      }),
    });
    if (!tokenResponse.ok) {
      return textResponse("GitHub no aceptó la autorización. Revisa la configuración e inténtalo otra vez.", 502);
    }
    tokenData = await tokenResponse.json();
  } catch {
    return textResponse("No se pudo completar la autorización con GitHub.", 502);
  }
  if (!tokenData || typeof tokenData.access_token !== "string") {
    return textResponse("GitHub no entregó un token válido.", 502);
  }
  const payload = JSON.stringify({ token: tokenData.access_token, provider: "github" }).replace(/</g, "\\u003c");
  const nonce = crypto.randomUUID();
  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Acceso al panel</title></head>
<body>
  <p>Conectando con el panel editorial…</p>
  <script nonce="${nonce}">
    (() => {
      const targetOrigin = ${JSON.stringify(SITE_ORIGIN)};
      const payload = ${payload};
      const opener = window.opener;
      if (!opener) {
        document.body.textContent = "No se encontró la ventana del panel. Cierra esta ventana e inténtalo otra vez.";
        return;
      }
      const receiveMessage = (event) => {
        if (event.source !== opener || event.origin !== targetOrigin) return;
        opener.postMessage("authorization:github:success:" + JSON.stringify(payload), targetOrigin);
        window.removeEventListener("message", receiveMessage, false);
        window.close();
      };
      window.addEventListener("message", receiveMessage, false);
      opener.postMessage("authorizing:github", targetOrigin);
    })();
  </script>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": CLEAR_STATE_COOKIE,
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
    },
  });
}
