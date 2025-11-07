/**
 * Web Worker Manager
 * Manages worker lifecycle and communication
 */

class WorkerManager {
  private worker: Worker | null = null;

  initialize() {
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers not supported');
      return false;
    }

    try {
      this.worker = new Worker(
        new URL('../workers/pdfWorker.ts', import.meta.url),
        { type: 'module' }
      );
      return true;
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      return false;
    }
  }

  async executeTask<T>(type: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SUCCESS') {
          this.worker?.removeEventListener('message', handleMessage);
          resolve(event.data.result);
        } else if (event.data.type === 'ERROR') {
          this.worker?.removeEventListener('message', handleMessage);
          reject(new Error(event.data.error));
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({ type, data });
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const workerManager = new WorkerManager();
