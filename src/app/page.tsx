export default function Home() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <title>Eventos Indaiá</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff}.container{text-align:center;padding:2rem}h1{font-size:2rem;margin:0}p{color:#888;margin-top:1rem}`,
          }}
        />
      </head>
      <body>
        <div className="container">
          <h1>Eventos Indaiá</h1>
          <p>Plataforma de landing pages</p>
        </div>
      </body>
    </html>
  );
}
