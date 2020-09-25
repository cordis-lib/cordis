export interface QueueItem<T = never> {
  cb: () => Promise<T>;
  resolve: (item: T) => void;
  reject: (reason?: any) => void;
}

/**
 * A queue for async operations
 */
export class AsyncQueue<T = never> {
  private readonly _queue: QueueItem<T>[] = [];

  private _processing = false;

  public run(
    cb: () => Promise<T>,
    urgent = false
  ) {
    return new Promise<T>((resolve, reject) => {
      this._queue[urgent ? 'unshift' : 'push']({
        cb,
        resolve,
        reject
      });

      this._process();
    });
  }

  private _process() {
    if (this._processing) return;

    const item = this._queue.shift();
    if (!item) {
      this._processing = false;
      return;
    }

    this._processing = true;

    void item.cb()
      .then(data => item.resolve(data))
      .catch(err => item.reject(err))
      .finally(() => {
        this._processing = false;
        this._process();
      });
  }
}
