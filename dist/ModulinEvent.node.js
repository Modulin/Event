
class ModulinEvent {

  
  constructor(listeners=[]) {
    this._listeners = listeners;
  }

  
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

  
  once(listener) {
    const unListener = this.on(wrapperListener);
    return unListener;

    function wrapperListener(...args) {
      unListener();
      listener(...args);
    }
  }

  
  off(...listeners) {
    for(let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }
  }

  
  clear() {
    while(this._listeners.length > 0) {
      this._listeners.pop();
    }
  }

  
  dispatch(...args) {
    for(let i = 0; i < this._listeners.length; i++) {
      const listener = this._listeners[i];
      listener(...args);
    }
  }
}

module.exports = ModulinEvent;