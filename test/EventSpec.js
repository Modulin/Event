const assert = require('assert');
const Event = require('../dist/Event.node');

describe('Event', () => {
  const throwOnCall = ()=>{throw new Error("failed");};
  describe('#on()', () => {
    it('should add an event listener', () => {
      const source = new Event();

      let callCount = 0;
      const increment = ()=>callCount++;
      source.on(increment);

      source.dispatch();
      source.dispatch();
      assert.equal(callCount, 2, "Event listener was not attached");
    });

    it('should not accept function values', () => {
      const source = new Event();

      assert.throws(()=>source.on(), TypeError, "Undefined should throw an exception");
      assert.throws(()=>source.on(null), TypeError, "null should throw an exception");
      assert.throws(()=>source.on({}), TypeError, "{} should throw an exception");
    });

    it('should only add one event listener ', () => {
      const source = new Event();

      let callCount = 0;
      const increment = ()=>callCount++;
      source.on(increment);
      source.on(increment);

      source.dispatch();
      assert.equal(callCount, 1, "Event listener was not attached");
    });

    it('should returns an un-listener', () => {
      const source = new Event();

      const unListen = source.on(throwOnCall);
      unListen();

      source.dispatch();
    });

    it('should be filtered', ()=>{
      const source = new Event();

      source.on(throwOnCall, ()=>false);

      source.dispatch();
    });

    it('should not be filtered', ()=>{
      const source = new Event();

      let callCount = 0;
      const increment = ()=>callCount++;
      source.on(increment, ()=>true);

      source.dispatch();

      assert.equal(callCount, 1);
    });

    it('should not filter all', ()=>{
      const source = new Event();

      let callCount = 0;
      const increment = ()=>callCount++;
      source.on(throwOnCall, ()=>false);
      source.on(increment, ()=>true);

      source.dispatch();

      assert.equal(callCount, 1);
    });
  });

  describe('#once()', ()=> {
    it('should only trigger once', ()=>{
      const source = new Event();

      let callCount = 0;
      const increment = ()=>callCount++;
      source.once(increment);

      source.dispatch();
      source.dispatch();
      assert.equal(callCount, 1, "Event listener was not attached or attached to many times");
    });

    it('should trigger all events', ()=>{
      const source = new Event();

      let callCount = 0;
      const increment1 = ()=>callCount++;
      const increment2 = ()=>callCount++;
      source.once(increment1);
      source.once(increment2);

      source.dispatch();
      assert.equal(callCount, 2, "Event listener was not attached or attached to many times");
    });

    it('should only be added once', ()=>{
      const source = new Event();

      let callCount = 0;
      const increment = ()=>callCount++;
      source.once(increment);
      source.once(increment);

      source.dispatch();
      assert.equal(callCount, 1, "Event listener was not attached or attached to many times");
    });

    it('show returns an un-listener', () => {
      const source = new Event();

      const unListen = source.once(throwOnCall);
      unListen();

      source.dispatch();
    });
  });

  describe('#off()', ()=>{
    it('should only remove the event listener', () => {
      const source = new Event();
      let callCount = 0;
      const increment = ()=>callCount++;

      source.on(increment);
      source.on(throwOnCall);
      source.off(throwOnCall);

      source.dispatch();
      assert.equal(callCount, 1, "Event listener was detached");
    });

    it('should remove multiple', () => {
      const source = new Event();
      const throwOnCall2 = ()=>{throw new Error("failed");};

      source.on(throwOnCall);
      source.on(throwOnCall2);
      source.off(throwOnCall, throwOnCall2);

      source.dispatch();
    });

    it('should not do anything if no listeners exist', () => {
      const source = new Event();
      source.off(throwOnCall);
    });

    it('should not do anything if null is provided', () => {
      const source = new Event();
      source.off(null);
    });

    it('should not do anything if listener is not found', () => {
      const source = new Event();
      let callCount = 0;
      const increment = ()=>callCount++;

      source.on(increment);
      source.off(throwOnCall);

      source.dispatch();
      assert.equal(callCount, 1, "Event listener was detached");
    });
  });

  describe('#clear', ()=>{
    it('should remove all listeners', ()=>{
      const source = new Event();

      source.on(throwOnCall);

      source.clear();
      source.dispatch();
    });
  });

  describe('#dispatch', ()=> {
    it('should forward varargs', () => {
      const source = new Event();
      let result={};
      source.on((a,b,c)=>result={a,b,c});

      source.dispatch(1,2,3);
      assert.deepEqual(result, {a:1,b:2,c:3}, "Varargs where not forwarded");
    });

    it('should blow up on classes', () => {
      const source = new Event();

      source.on(class {});

      assert.throws(()=>source.dispatch(), TypeError, "Classes should blow up the dispatch");
    });
  })
});