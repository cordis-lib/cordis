export interface QueueItem<T = void> {
  cb: () => Promise<T>;
  resolve: (item: T) => void;
  reject: (reason?: any) => void;
}

/**
 * A queue for async operations - where the results of the promises are retrieveable
 */
export class Queue<T = void> {
  /**
   * Internal item list
   */
  private readonly _queue: QueueItem<T>[] = [];

  /**
   * Wether or not the queue is currently busy
   */
  private _processing = false;

  /**
   * Queues up the given async operation for processing, yielding the result once done
   * @param cb The function to execute
   * @param urgent Wether or not this item should be added to the top of the queue, or at the bottom, as always
   */
  public run(cb: () => Promise<T>, urgent = false) {
    return new Promise<T>((resolve, reject) => {
      this._queue[urgent ? 'unshift' : 'push']({ cb, resolve, reject });
      this._process();
    });
  }

  /**
   * Shifts the queue forward
   */
  private _process() {
    // If we're already processing something else the item that summoned this has to wait
    if (this._processing) return;

    const item = this._queue.shift();
    if (!item) {
      // If we've got nothing else just exit
      this._processing = false;
      return;
    }

    this._processing = true;

    // No matter what happens, re-run the process function
    void item.cb()
      .then(data => item.resolve(data))
      .catch(err => item.reject(err))
      .finally(() => {
        this._processing = false;
        this._process();
      });
  }
}
