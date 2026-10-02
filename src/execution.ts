export type TraceExecutionStatus = 'loading' | 'executing';

type WorkerResponse =
  | { id: number; type: 'status'; status: TraceExecutionStatus }
  | { id: number; type: 'result'; result: string }
  | { id: number; type: 'error'; error: string };

type WorkerRequest = { id: number; program: string };

export type TraceWorker = {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onmessageerror?: ((event: MessageEvent) => void) | null;
  postMessage(message: WorkerRequest): void;
  terminate(): void;
};

type PendingTrace = {
  resolve(value: string): void;
  reject(reason: Error): void;
  onStatus?: (status: TraceExecutionStatus) => void;
  timer?: ReturnType<typeof setTimeout>;
};

export class TraceExecutionTimeout extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TraceExecutionTimeout';
  }
}

export class TraceWorkerClient {
  private worker: TraceWorker | undefined;
  private nextId = 1;
  private readonly pending = new Map<number, PendingTrace>();

  constructor(
    private readonly createWorker: () => TraceWorker,
    private readonly loadTimeoutMs = 120_000,
    private readonly executionTimeoutMs = 15_000,
  ) {}

  execute(program: string, onStatus?: (status: TraceExecutionStatus) => void): Promise<string> {
    if (this.pending.size) return Promise.reject(new Error('A Python trace is already running.'));
    let worker: TraceWorker;
    try {
      worker = this.getWorker();
    } catch (error) {
      return Promise.reject(error);
    }

    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const pending: PendingTrace = { resolve, reject, onStatus };
      this.pending.set(id, pending);
      this.arm(pending, this.loadTimeoutMs, () => this.failWorker(new Error('Python runtime did not finish loading within 120 seconds. Check your connection and try again.')));
      try {
        worker.postMessage({ id, program });
      } catch (error) {
        this.failWorker(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  cancel(reason = 'Python execution was canceled because the code changed.') {
    if (!this.worker && !this.pending.size) return;
    this.failWorker(new Error(reason));
  }

  private getWorker(): TraceWorker {
    if (this.worker) return this.worker;
    const worker = this.createWorker();
    worker.onmessage = event => {
      if (this.worker !== worker) return;
      const message = event.data;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      if (message.type === 'status') {
        pending.onStatus?.(message.status);
        if (message.status === 'loading') {
          this.arm(pending, this.loadTimeoutMs, () => this.failWorker(new Error('Python runtime did not finish loading within 120 seconds. Check your connection and try again.')));
        } else {
          this.arm(pending, this.executionTimeoutMs, () => this.failWorker(new TraceExecutionTimeout(`Python execution exceeded ${this.executionTimeoutMs / 1000} seconds and was stopped.`)));
        }
        return;
      }
      this.clear(pending);
      this.pending.delete(message.id);
      if (message.type === 'result') pending.resolve(message.result);
      else {
        pending.reject(new Error(message.error));
        this.discardWorker(worker);
      }
    };
    worker.onerror = event => {
      event.preventDefault();
      if (this.worker === worker) this.failWorker(new Error(event.message || 'The Python worker stopped unexpectedly.'));
    };
    worker.onmessageerror = () => {
      if (this.worker === worker) this.failWorker(new Error('The Python worker returned a message the app could not read.'));
    };
    this.worker = worker;
    return worker;
  }

  private arm(pending: PendingTrace, delay: number, onTimeout: () => void) {
    this.clear(pending);
    pending.timer = setTimeout(onTimeout, delay);
  }

  private clear(pending: PendingTrace) {
    if (pending.timer !== undefined) clearTimeout(pending.timer);
    pending.timer = undefined;
  }

  private discardWorker(worker: TraceWorker) {
    if (this.worker !== worker) return;
    this.worker = undefined;
    worker.terminate();
  }

  private failWorker(error: Error) {
    const worker = this.worker;
    this.worker = undefined;
    worker?.terminate();
    for (const pending of this.pending.values()) {
      this.clear(pending);
      pending.reject(error);
    }
    this.pending.clear();
  }
}

export const traceWorkerClient = new TraceWorkerClient(
  () => new Worker(new URL('./trace.worker.ts', import.meta.url), { type: 'classic' }) as unknown as TraceWorker,
);
