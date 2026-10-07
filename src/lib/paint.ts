// Pincel simples: um único traço liso, que engrossa devagar e afina na pressa.
export const PALETA = ["#C42A1D", "#5A6A2B", "#12308F", "#3A1A4A", "#C9A24B", "#16130F"];

export class Traco {
  cor = PALETA[0];
  private x = 0;
  private y = 0;
  private mx = 0;
  private my = 0;
  private w = 14;
  private t = 0;
  private ativo = false;

  constructor(private ctx: CanvasRenderingContext2D) {}

  inicio(x: number, y: number) {
    this.x = this.mx = x; this.y = this.my = y;
    this.t = performance.now();
    this.w = 14;
    this.ativo = true;
    const c = this.ctx;
    c.fillStyle = this.cor;
    c.beginPath(); c.arc(x, y, this.w / 2, 0, Math.PI * 2); c.fill();
  }

  mover(x: number, y: number) {
    if (!this.ativo) return;
    const agora = performance.now();
    const d = Math.hypot(x - this.x, y - this.y);
    if (d < 1.5) return;
    const v = d / Math.max(8, agora - this.t);
    const alvo = Math.max(5, Math.min(20, 20 - v * 7));
    this.w += (alvo - this.w) * 0.18;
    const nx = (this.x + x) / 2, ny = (this.y + y) / 2;
    const c = this.ctx;
    c.strokeStyle = this.cor;
    c.lineWidth = this.w;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(this.mx, this.my);
    c.quadraticCurveTo(this.x, this.y, nx, ny);
    c.stroke();
    this.mx = nx; this.my = ny; this.x = x; this.y = y; this.t = agora;
  }

  fim() { this.ativo = false; }
}
