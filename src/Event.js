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
   * push, pop, findIndex and [array index] are implemented
   */
  constructor(listeners=[]) {
    this._listeners = listeners;
    this._removedIndexes = [];
  }

  /**
   * Registers a listener on the event source. An un-listener is returned which should be called without
   * arguments to unregister the event. This eases the use of anonymous functions as the event listener
   * since it's possible to unregister the listener without a reference to the anonymous function.
   * <br><br>
   * Important note!
   * <br>
   * Adding the same event twice will be seen as a no op, event if the filters are different
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
   * @param {...function} filters - A set of function which all must return true for the listener to fire
   * @returns {function(): void} - A function which unregisters the listener
   */
  on(listener, ...filters) {
    if(typeof listener !== 'function') {
      const type = typeof listener;
      throw new TypeError("Only functions can be used as callbacks, the provided listener was a " + type);
    }

    if(!listener.eventId) {
      const originalListener = listener;
      listener = (...args)=>originalListener(...args);
      listener.eventId = originalListener;
    }

    const index = this._indexOf(listener.eventId);
    if(index === -1) {
      listener.filters = filters;
      this._listeners.push(listener);
    }
    return () => this.off(listener.eventId);
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
   * @param {...function} filters - An optional list of filters which all must
   *                                return true for the listener to be run
   * @returns {function(): void} - A function which unregisters the listener
   */
  once(listener, ...filters) {
    wrapperListener.eventId = listener;
    const unListener = this.on(wrapperListener, ...filters);
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
      const index = this._indexOf(listener);
      if (index !== -1) {
        this._removedIndexes.push(index);
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

    while(this._removedIndexes.length > 0) {
      this._removedIndexes.pop();
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
    this._purgeRemovedListeners();

    listenerLoop:
    for(let i = 0; i < this._listeners.length; i++) {
      const listener = this._listeners[i];

      for(let j = 0; j < listener.filters.length; j++){
        const filter = listener.filters[j];
        const filterPassed = filter.call(filter, ...args);
        if(!filterPassed) {
          continue listenerLoop;
        }
      }

      listener(...args);
    }
  }


  /**
   * Behaves the same as Array#indexOf
   *
   * @param {function} eventId - The function which is used to identify an event listener
   *
   * @returns {number}
   * @private
   */
  _indexOf(eventId) {
    return this._listeners.findIndex(it=>it.eventId === eventId);
  }

  /**
   * Removes all event listeners which are marked for removal.
   *
   * The removal algorithm is operates in O(k) time where k is the amount of items to remove.
   * It uses a simple "swap then pop" approach which swaps the value to be removed with the
   * last value in the array and pops of the item to be removed.
   * <br><br>
   * This makes the array "unstable" since the removal algorithm reorders the items in the array.
   *
   * @private
   */
  _purgeRemovedListeners() {
    while(this._removedIndexes.length > 0) {
      const tail = this._listeners.length - 1;
      const index = this._removedIndexes.pop();

      this._listeners[index] = this._listeners[tail];
      this._listeners.pop();
    }
  }
}

export default Event;