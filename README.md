# Modulin Event
A small event emitter, around 450 bytes minified and gziped, which can be used to add events to objects. This is a minimal 
implementation based on the [WebExtension Event class](https://developer.chrome.com/extensions/events)

Provides a way to add events to any object through composition instead of inheritance.
Due to events being properties on an object or class, a quick inspection of the
constructor or an instance exposes all event's the object may trigger.

This can also help IDEs with auto completion of available events, since they are ordinary properties.

# Example
```javascript
// Create a ticker class which will dispatch an
// event every 100ms
class Ticker {
  constructor() {
    // Add an event emitter to the Ticker which
    // can be listened to using instance.tick.on(...)
    this.tick = new Event();

    // Reset the count and start the ticker
    this.count = 0;
    setInterval(()=>this.increment(),100);
  }
  
  increment() {
    // Increment a counter and dispatch an event
    // with the new count
    this.count++;
    this.tick.dispatch(this.count);
  }
}

// Create a new ticker
const ticker = new Ticker();

const onlyEven = (val)=>val % 2 === 0;

// log to the console on every 'tick'
ticker.tick.on(console.log); // -> 1,2,3,4,...

// log to the console on every event 'tick'
ticker.tick.on(console.log, onlyEven); // -> 2,4,...

// log to the console the first time tick
// dispatches an event with an even value
ticker.tick.once(console.log, onlyEven); //-> 2
```

# Documentation
Documentation can be found
[here](https://htmlpreview.github.io/?https://raw.githubusercontent.com/Modulin/Event/master/docs/Event.html)
