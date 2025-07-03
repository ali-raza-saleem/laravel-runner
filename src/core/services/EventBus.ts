import mitt from "mitt";

export type BusEvents = {
  scriptRunning: boolean // true ⇒ started, false ⇒ stopped
  output: string // stdout / stderr chunk
}

class EventBus {
  private running = false;
  private bus = mitt<BusEvents>();

  /* ——— state ——— */
  isRunning() {
    return this.running;
  }

  /* ——— publishers ——— */
  setRunning(running: boolean) {
    if (this.running === running) return;
    this.running = running;
    this.bus.emit("scriptRunning", running);
  }
  //   emitOutput(chunk: string) { this.bus.emit("output", chunk); }

  /* ——— subscribers ——— */
  on = this.bus.on;
  off = this.bus.off;
}

export const eventBus = new EventBus();
