import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Apenas permitir método GET (ou POST se necessário, mas o original usa GET params)
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const searchParams = url.searchParams;

  // Parâmetros esperados pelo Google Translate
  // client: gtx
  // sl: auto
  // tl: pt (ou outro)
  // dt: t
  // q: texto
  
  // Como o proxy local no vite rewrite: (path) => path.replace(/^\/api\/translate/, '')
  // A URL de destino é https://translate.googleapis.com/translate_a/single
  
  const targetUrl = new URL("https://translate.googleapis.com/translate_a/single");
  
  // Copiar todos os parâmetros da requisição original para a de destino
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      return new Response(`Upstream Error: ${response.status}`, { status: 502 });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Permitir CORS para o frontend
      }
    });
  } catch (error) {
    console.error("Translation proxy error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
