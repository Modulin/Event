/**
 * An event source which can be used to add event's to objects. A minimal functional
 * implementation based on the WebExtension Event class:
 * {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/events}
 * <br><br>
 * Provides a way to add events to any object through composition instead of inheritance.
 * Due to events being properties on an object or class, a quick inspection of the
 * constructor or an instance exposes all event's the object might trigger.
 * <br><br>
 * This can also help IDEs with auto completion of available events.
 *
 * @example
 * class Ticker {
 *   constructor() {
 *    this.tick = new Event();
 *
 *    this.count = 0;
 *    setInterval(()=>this.increment(),100);
 *   }
 *
 *   increment() {
 *     this.count++;
 *     this.tick.dispatch(this.count);
 *   }
 * }
 *
 * const ticker = new Ticker();
 * ticker.tick.on(console.log); // -> 1,2,3,4,...
 * ticker.tick.once(console.log); //-> 1
 */
class Event {

  /**
   * @param {Array} listeners=Array - An optional list of listeners which can be a custom array implementation if
   * push, pop, splice, indexOf and [array index] are implemented
   */
  constructor(listeners=[]) {
    this._listeners = listeners;
  }

  /**
   * Registers a listener on the event source. An un-listener is returned which should be called without
   * arguments to unregister the event. This eases the use of anonymous functions as the event listener
   * since it's possible to unregister the listener without a reference to the anonymous function.
   *
   * @example
   * const source = new Event();
   * const log = ()=>console.log('i will be called');
   * const log2 = ()=>console.log('i will also be called');
   *
   * source.on(log);
   * source.on(log2);
   * source.dispatch(); // -> "i will be called", "i will also be called"
   *
   * @param {function} listener - The listener which will be called when triggered by
   * [dispatch]{@link Event#dispatch} - The listener which only will be called
   * @returns {function(): void} - A function which unregisters the listener
   */
  on(listener) {
    if(typeof listener !== 'function') {
      const type = typeof listener;
      throw new TypeError("Only functions can be used as callbacks, the provided listener was a " + type);
    }

    const index = this._listeners.indexOf(listener);
    if(index === -1) {
      this._listeners.push(listener);
    }
    return () => this.off(listener);
  }

  /**
   * Unregisters itself after it's first call, otherwise identical to [on]{Event#on}.
   *
   * @example
   * const source = new Event();
   * const log = ()=>console.log('i will be called once');
   *
   * source.once(log);
   * source.dispatch(); // -> "i will be called once"
   * source.dispatch(); // ->
   *
   * @param {function} listener - The listener which only will be called once
   * @returns {function(): void} - A function which unregisters the listener
   */
  once(listener) {
    const unListener = this.on(wrapperListener);
    return unListener;

    function wrapperListener(...args) {
      unListener();
      listener(...args);
    }
  }

  /**
   * Remove a specific event listener by reference. Multiple listeners can be removed at the same time
   * by passing multiple parameters
   *
   * @example
   * const source = new Event();
   * const log1 = ()=>console.log('i will not be called');
   * const log2 = ()=>console.log('i will not be called either');
   * 
   * source.on(log1);
   * source.on(log2);
   * source.off(log1, log2);
   * source.dispatch(); // ->
   *
   * @param {...function} listeners - The event listener
   */
  off(...listeners) {
    for(let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }
  }

  /**
   * Clear all event listeners.
   *
   * @example
   * const source = new Event();
   * const log = ()=>console.log('i will not be called');
   *
   * source.on(log);
   * source.clear();
   * source.dispatch(); // ->
   */
  clear() {
    while(this._listeners.length > 0) {
      this._listeners.pop();
    }
  }

  /**
   * Dispatch an event to all listeners where all provided arguments are treated as
   * varargs and passed through to the listener.
   *
   * @example
   * const source = new Event();
   *
   * source.on(console.log);
   * source.dispatch('hello', 'world'); // -> "hello, world"
   *
   * @param {...*} args - Any arguments which should be passed to the listeners
   */
  dispatch(...args) {
    for(let i = 0; i < this._listeners.length; i++) {
      const listener = this._listeners[i];
      listener(...args);
    }
  }
}

export default Event;