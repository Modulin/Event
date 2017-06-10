
class Event {

  
  constructor(listeners=[]) {
    this._listeners = listeners;
    this._removedIndexes = [];
  }

  
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

  
  once(listener, ...filters) {
    wrapperListener.eventId = listener;
    const unListener = this.on(wrapperListener, ...filters);
    return unListener;

    function wrapperListener(...args) {
      unListener();
      listener(...args);
    }
  }

  
  off(...listeners) {
    for(let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      const index = this._indexOf(listener);
      if (index !== -1) {
        this._removedIndexes.push(index);
      }
    }
  }

  
  clear() {
    while(this._listeners.length > 0) {
      this._listeners.pop();
    }

    while(this._removedIndexes.length > 0) {
      this._removedIndexes.pop();
    }
  }

  
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


  
  _indexOf(eventId) {
    return this._listeners.findIndex(it=>it.eventId === eventId);
  }

  
  _purgeRemovedListeners() {
    while(this._removedIndexes.length > 0) {
      const tail = this._listeners.length - 1;
      const index = this._removedIndexes.pop();

      this._listeners[index] = this._listeners[tail];
      this._listeners.pop();
    }
  }
}

