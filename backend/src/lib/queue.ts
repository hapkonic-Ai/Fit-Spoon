import { AI_QUEUE } from './constants.js';
import { Errors } from './errors.js';

type QueuedTask<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

class AIRequestQueue {
  private running = 0;
  private queue: QueuedTask<unknown>[] = [];

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const idx = this.queue.findIndex((t) => t.resolve === (resolve as (v: unknown) => void));
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          reject(Errors.aiQueueFull());
        }
      }, AI_QUEUE.TIMEOUT_MS);

      this.queue.push({
        fn: fn as () => Promise<unknown>,
        resolve: resolve as (v: unknown) => void,
        reject,
        timeoutId,
      });

      this.process();
    });
  }

  private process() {
    if (this.running >= AI_QUEUE.MAX_CONCURRENT || this.queue.length === 0) return;

    const task = this.queue.shift()!;
    clearTimeout(task.timeoutId);
    this.running++;

    task
      .fn()
      .then(task.resolve)
      .catch(task.reject)
      .finally(() => {
        this.running--;
        this.process();
      });
  }

  get stats() {
    return { running: this.running, queued: this.queue.length };
  }
}

export const aiQueue = new AIRequestQueue();
