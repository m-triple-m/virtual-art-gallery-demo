function GamepadWrapper(gamepad) {
    this.gamepad = gamepad;
    this.listeners = {};
    this.axesState = [];
  
    // Add a polling function to check for changes in the gamepad state
    var that = this;
    setInterval(function() {
      that.poll();
    }, 1000);
  }
  
  GamepadWrapper.prototype = {
    constructor: GamepadWrapper,
  
    // Add a method to add event listeners
    addEventListener: function(type, listener) {
      if(!(type in this.listeners)) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    },
  
    // Add a method to remove event listeners
    removeEventListener: function(type, listener) {
      if(!(type in this.listeners)) {
        return;
      }
      var index = this.listeners[type].indexOf(listener);
      if(index !== -1) {
        this.listeners[type].splice(index, 1);
      }
    },
  
    // Add a method to dispatch events to listeners
    dispatchEvent: function(event) {
      if(!(event.type in this.listeners)) {
        return;
      }
      var listeners = this.listeners[event.type];
      for(var i = 0; i < listeners.length; i++) {
        listeners[i].call(this, event);
      }
    },
  
    // Add a method to poll the gamepad state and fire events if there are changes
    poll: function() {
      var gamepad = this.gamepad;
      if(!gamepad) {
        return;
      }
  
      for(var i = 0; i < gamepad.buttons.length; i++) {
        var pressed = gamepad.buttons[i].pressed;
        // console.log(this.listeners);
        // this.listeners.buttonpress[0](e => {
        //    this.dispatchEvent(e);
        // })
        // return;
        if(pressed !== this.buttonsState[i]) {
          this.buttonsState[i] = pressed;
          var event = new CustomEvent("button" + i + (pressed ? "press" : "release"), {detail: {button: i}});
          this.dispatchEvent(event);
        }
      }
  
      for(var i = 0; i < gamepad.axes.length; i++) {
        var value = gamepad.axes[i];
        if(value !== this.axesState[i]) {
          this.axesState[i] = value;
          var event = new CustomEvent("axismove", {detail: {axis: i, value: value}});
          this.dispatchEvent(event);
        }
      }
    }
  };
  

  module.exports = {GamepadWrapper};