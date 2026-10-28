// Armazenamento das reservas.
//  - Na Vercel: Upstash Redis (variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN,
//    criadas ao adicionar o Upstash em Storage/Marketplace do projeto).
//  - No computador (teste): um arquivo .dev-data/store.json.
// Sem nenhum dos dois na Vercel, as reservas ficam desligadas e o site usa só o WhatsApp.
import { env, naNuvem } from "./http.js";

export interface Store {
  get<T>(chave: string): Promise<T | null>;
  set(chave: string, valor: unknown, ttlSeg?: number): Promise<void>;
  setNX(chave: string, valor: unknown, ttlSeg?: number): Promise<boolean>;
  del(chave: string): Promise<void>;
  incr(chave: string, ttlSeg: number): Promise<number>;
  push(lista: string, valor: string): Promise<void>;
  todos(lista: string): Promise<string[]>;
}

// ---------------- Upstash (REST) ----------------
function upstash(url: string, token: string): Store {
  const cmd = async (...args: (string | number)[]) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const j = (await r.json()) as { result?: unknown; error?: string };
    if (!r.ok || j.error) throw new Error(`Upstash: ${j.error ?? r.status}`);
    return j.result;
  };
  return {
    async get<T>(chave: string) {
      const v = (await cmd("GET", chave)) as string | null;
      return v ? (JSON.parse(v) as T) : null;
    },
    async set(chave, valor, ttl) {
      const args: (string | number)[] = ["SET", chave, JSON.stringify(valor)];
      if (ttl) args.push("EX", ttl);
      await cmd(...args);
    },
    async setNX(chave, valor, ttl) {
      const args: (string | number)[] = ["SET", chave, JSON.stringify(valor), "NX"];
      if (ttl) args.push("EX", ttl);
      return (await cmd(...args)) === "OK";
    },
    async del(chave) { await cmd("DEL", chave); },
    async incr(chave, ttl) {
      const n = Number(await cmd("INCR", chave));
      if (n === 1) await cmd("EXPIRE", chave, ttl);
      return n;
    },
    async push(lista, valor) { await cmd("RPUSH", lista, valor); },
    async todos(lista) { return ((await cmd("LRANGE", lista, 0, -1)) as string[]) ?? []; },
  };
}

// ---------------- Arquivo local (só para teste) ----------------
type Dados = { kv: Record<string, { v: unknown; exp?: number }>; listas: Record<string, string[]> };

function arquivoLocal(): Store {
  const caminho = ".dev-data/store.json";
  const ler = async (): Promise<Dados> => {
    const fs = await import("node:fs/promises");
    try { return JSON.parse(await fs.readFile(caminho, "utf8")) as Dados; } catch { return { kv: {}, listas: {} }; }
  };
  const gravar = async (d: Dados) => {
    const fs = await import("node:fs/promises");
    await fs.mkdir(".dev-data", { recursive: true });
    await fs.writeFile(caminho, JSON.stringify(d, null, 2), "utf8");
  };
  const vivo = (e?: { v: unknown; exp?: number }) => (e && (!e.exp || e.exp > Date.now()) ? e : undefined);
  const exp = (ttl?: number) => (ttl ? Date.now() + ttl * 1000 : undefined);
  return {
    async get<T>(chave: string) { return (vivo((await ler()).kv[chave])?.v as T) ?? null; },
    async set(chave, valor, ttl) { const d = await ler(); d.kv[chave] = { v: valor, exp: exp(ttl) }; await gravar(d); },
    async setNX(chave, valor, ttl) {
      const d = await ler();
      if (vivo(d.kv[chave])) return false;
      d.kv[chave] = { v: valor, exp: exp(ttl) };
      await gravar(d);
      return true;
    },
    async del(chave) { const d = await ler(); delete d.kv[chave]; await gravar(d); },
    async incr(chave, ttl) {
      const d = await ler();
      const atual = vivo(d.kv[chave]);
      const n = (Number(atual?.v) || 0) + 1;
      d.kv[chave] = { v: n, exp: atual?.exp ?? exp(ttl) };
      await gravar(d);
      return n;
    },
    async push(lista, valor) { const d = await ler(); (d.listas[lista] ??= []).push(valor); await gravar(d); },
    async todos(lista) { return (await ler()).listas[lista] ?? []; },
  };
}

export function armazenamento(): Store | null {
  const url = env("UPSTASH_REDIS_REST_URL") ?? env("KV_REST_API_URL");
  const token = env("UPSTASH_REDIS_REST_TOKEN") ?? env("KV_REST_API_TOKEN");
  if (url && token) return upstash(url, token);
  return naNuvem() ? null : arquivoLocal();
}
