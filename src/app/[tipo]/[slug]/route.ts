import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const TIPOS_VALIDOS = ["casamento", "15-anos", "formaturas", "corporativo"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tipo: string; slug: string }> }
) {
  const { tipo, slug } = await params;

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  }

  try {
    const { data: page, error } = await supabaseAdmin
      .from("mkt_landing_pages")
      .select("html, titulo")
      .eq("tipo", tipo)
      .eq("slug", slug)
      .eq("ativa", true)
      .single();

    if (error || !page) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Página não encontrada</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff}
.container{text-align:center;padding:2rem}h1{font-size:4rem;margin:0;opacity:.3}p{color:#888;margin-top:1rem}</style></head>
<body><div class="container"><h1>404</h1><p>Landing page não encontrada ou não publicada.</p></div></body></html>`,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        }
      );
    }

    // Corrige URL do tracking se estiver apontando pro frontend em vez do backend
    let html = page.html
      .replace(/https:\/\/indaia-crm\.vercel\.app\/api\/marketing-platform\/tracking/g, 'https://comercial-api.squareweb.app/api/marketing-platform/tracking')
      .replace(/https:\/\/localhost:\d+\/api\/marketing-platform\/tracking/g, 'https://comercial-api.squareweb.app/api/marketing-platform/tracking');

    // Injeta favicon universal se a LP não tem
    if (!/<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(html)) {
      const faviconTag = '<link rel="icon" type="image/svg+xml" href="/favicon.svg">';
      if (html.includes('</head>')) {
        html = html.replace('</head>', faviconTag + '</head>');
      } else if (html.includes('<body')) {
        const bodyMatch = html.match(/<body[^>]*>/);
        if (bodyMatch) html = html.replace(bodyMatch[0], faviconTag + bodyMatch[0]);
      }
    }

    // Injeta captura de UTMs se o HTML não tem (LPs antigas)
    if (!html.includes("p.get('utm_source')") && !html.includes('utm_source=p.get')) {
      const utmScript = `<script>
(function(){
  var p=new URLSearchParams(window.location.search);
  var utms={utm_source:p.get('utm_source'),utm_medium:p.get('utm_medium'),utm_campaign:p.get('utm_campaign'),utm_content:p.get('utm_content'),utm_term:p.get('utm_term')};
  var orig=window.fetch;
  window.fetch=function(url,opts){
    if(url&&url.indexOf('marketing-platform/tracking')>-1&&opts&&opts.body){
      try{var d=JSON.parse(opts.body);Object.assign(d,utms);opts.body=JSON.stringify(d)}catch(e){}
    }
    return orig.call(this,url,opts);
  };
})();
</script>`;
      // Injeta logo após o <head> ou no início do <body>
      if (html.includes('</head>')) {
        html = html.replace('</head>', utmScript + '</head>');
      } else if (html.includes('<body')) {
        const bodyMatch = html.match(/<body[^>]*>/);
        if (bodyMatch) html = html.replace(bodyMatch[0], bodyMatch[0] + utmScript);
      }
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[LP Serve] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
