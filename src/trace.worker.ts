type WorkerRequest = { id: number; program: string };
type WorkerScope = {
  importScripts(...urls: string[]): void;
  loadPyodide?: (options: { indexURL: string }) => Promise<{ runPythonAsync(source: string): Promise<unknown> }>;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: unknown): void;
};

const scope = self as unknown as WorkerScope;
const pyodideBase = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';
let runtimePromise: ReturnType<NonNullable<WorkerScope['loadPyodide']>> | undefined;

function loadPythonRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      if (typeof scope.loadPyodide !== 'function') scope.importScripts(`${pyodideBase}pyodide.js`);
      if (typeof scope.loadPyodide !== 'function') throw new Error('Pyodide did not expose its runtime loader.');
      return scope.loadPyodide({ indexURL: pyodideBase });
    })();
  }
  return runtimePromise;
}

scope.onmessage = async ({ data }) => {
  scope.postMessage({ id: data.id, type: 'status', status: 'loading' });
  try {
    const pyodide = await loadPythonRuntime();
    scope.postMessage({ id: data.id, type: 'status', status: 'executing' });
    const result = await pyodide.runPythonAsync(data.program);
    scope.postMessage({ id: data.id, type: 'result', result: String(result) });
  } catch (error) {
    scope.postMessage({ id: data.id, type: 'error', error: error instanceof Error ? error.message : String(error) });
  }
};
