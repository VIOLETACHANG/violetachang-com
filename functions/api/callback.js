export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const provider = url.searchParams.get("state") || "github";

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });
  const data = await response.json();
  const token = data.access_token;

  const html = `<!DOCTYPE html><html><head><script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage('authorization:${provider}:success:{"token":"${token}","provider":"${provider}"}', e.origin);
        window.close();
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:${provider}", "*");
    })();
  </script></head><body><p>Autorizando...</p></body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
