# Modulin Event
An event source which can be used to add event's to objects. A minimal functional
implementation based on the WebExtension Event class:
https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/events

Provides a way to add events to any object through composition instead of inheritance.
Due to events being properties on an object or class, a quick inspection of the
constructor or an instance exposes all event's the object might trigger.

This can also help IDEs with auto completion of available events.

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
Documentation of the class can be found
[here](https://htmlpreview.github.io/?https://raw.githubusercontent.com/RikardLegge/modulin-event/master/docs/ModulinEvent.html)
