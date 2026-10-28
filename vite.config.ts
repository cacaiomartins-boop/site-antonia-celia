import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Roda a pasta api/ no servidor de teste (na Vercel, ela roda como funções).
// Variáveis do arquivo .env.local entram aqui; sem elas, o pagamento fica simulado.
function apiLocal(mode: string): Plugin {
  return {
    name: "api-local",
    configureServer(server) {
      for (const [k, v] of Object.entries(loadEnv(mode, process.cwd(), ""))) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const m = url.pathname.match(/^\/api\/([a-z-]+)$/);
        if (!m) return next();

        const bruto = await new Promise<string>((ok) => {
          let s = "";
          req.on("data", (c) => (s += c));
          req.on("end", () => ok(s));
        });
        let body: unknown = bruto;
        if ((req.headers["content-type"] ?? "").includes("json")) {
          try { body = JSON.parse(bruto || "{}"); } catch { body = {}; }
        }
        const query: Record<string, string> = {};
        url.searchParams.forEach((v, k) => (query[k] = v));

        const r: any = res;
        r.status = (c: number) => { res.statusCode = c; return r; };
        r.json = (d: unknown) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(d)); };

        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.ts`);
          await mod.default({ method: req.method, headers: req.headers, query, body }, r);
        } catch (e) {
          console.error(e);
          if (!res.headersSent) { res.statusCode = 500; res.setHeader("Content-Type", "application/json"); res.end('{"erro":"falha no servidor de teste"}'); }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), apiLocal(mode)],
  server: { port: 8080, host: true },
  preview: { port: 8080, host: true },
}));
