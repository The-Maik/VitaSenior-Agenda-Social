/** Deadline monotônica: abas em segundo plano não acumulam atraso de intervalos. */
export class ReadingTimer {
  constructor({ now = () => performance.now(), duration = 60 } = {}) {
    this.now = now;
    this.reset(duration);
  }
  reset(duration = this.duration) {
    if (!Number.isFinite(duration) || duration <= 0)
      throw new RangeError("Duração inválida");
    this.duration = duration;
    this.remainingMs = duration * 1000;
    this.deadline = null;
  }
  get running() {
    return this.deadline !== null;
  }
  get seconds() {
    return Math.ceil(
      Math.max(
        0,
        this.running ? this.deadline - this.now() : this.remainingMs,
      ) / 1000,
    );
  }
  start() {
    if (this.running) return;
    if (this.remainingMs <= 0) this.remainingMs = this.duration * 1000;
    this.deadline = this.now() + this.remainingMs;
  }
  pause() {
    if (!this.running) return;
    this.remainingMs = Math.max(0, this.deadline - this.now());
    this.deadline = null;
  }
  tick() {
    if (!this.running || this.seconds > 0) return false;
    this.remainingMs = 0;
    this.deadline = null;
    return true;
  }
}

export function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
