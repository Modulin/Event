# Modulin Event
A small event emitter, around 250 bytes minified and gziped, which can be used to add events to objects. This is a minimal 
implementation based on the WebExtension Event class:
https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/events

Provides a way to add events to any object through composition instead of inheritance.
Due to events being properties on an object or class, a quick inspection of the
constructor or an instance exposes all event's the object may trigger.

This can also help IDEs with auto completion of available events, since they are ordinary properties.

# Example
```javascript
class Ticker {
  constructor() {
    this.tick = new ModulinEvent();
    
    this.count = 0;
    setInterval(()=>this.increment(),100);
  }
  
  increment() {
    this.count++;
    this.tick.dispatch(this.count);
  }
}

const ticker = new Ticker();
ticker.tick.on(console.log); // -> 1,2,3,4,...
ticker.tick.once(console.log); //-> 1
```

# Documentation
Documentation can be found
[here](https://htmlpreview.github.io/?https://raw.githubusercontent.com/RikardLegge/modulin-event/master/docs/ModulinEvent.html)
