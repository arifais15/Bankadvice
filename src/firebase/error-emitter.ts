type Listener = (event: any) => void;

class Emitter {
  private listeners: { [event: string]: Listener[] } = {};

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }

  off(event: string, listener: Listener) {
     if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
     }
  }
}

export const errorEmitter = new Emitter();
