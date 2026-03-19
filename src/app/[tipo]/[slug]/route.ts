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

    return new NextResponse(page.html, {
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
