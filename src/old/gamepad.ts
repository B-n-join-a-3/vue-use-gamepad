import {
  App,
  defineComponent,
  inject,
  onBeforeUnmount,
  ref,
  Ref,
  UnwrapRef,
  watchEffect,
  VNode,
} from 'vue'
import {
  ComposableOptions,
  GamepadModifiers,
  GamepadBinding
} from '../types.d'
import { set, get } from './utils';
import { getAxisNameFromValue, getAxisNames } from './main';

export default function (app: App, options: ComposableOptions) {
  return class Gamepad {
    public options: ComposableOptions = options
    public holding: { [char: string]: any }
    public events: { [char: string]: any }
    public layers: { [char: string]: any }
    public layer: number
    public animationFrame: any

    public constructor() {
      this.holding = {};
      this.events = {};
      this.layer = 0;
      this.layers = {};
      window.addEventListener('gamepadconnected', this.gamepadHandler.bind(this, true));
      window.addEventListener('gamepaddisconnected', this.gamepadHandler.bind(this, false));

      this.animationFrame = requestAnimationFrame(this.run.bind(this));
    }

    public gamepadHandler(connecting, event) {
      if (connecting) {
        app.config.globalProperties.$isGamepadConnected = true
      } else {
        if (this.getGamepads().length === 0) {
          app.config.globalProperties.$isGamepadConnected = false
          // document.body.classList.remove('gamepad-connected');
        }
      }
    }

    /**
     * add an event handler
     * @param {string} event name of the button event
     * @param {object} modifiers vue binding modifiers
     * @param {function} callback function to trigger
     * @param {object} vnode vue directive vnode
     */
    public addListener(event: string, modifiers: GamepadModifiers, callback: any, vnode: VNode | null = null) {
      const action = modifiers.released ? 'released' : 'pressed';
      const repeat = !!modifiers.repeat;

      // if we don't already have an array initialised for the current event
      // do it now
      const events = get(this.events, [this.layer, action, event], []);
      if (events.length === 0) {
        set(this.events, [this.layer, action, event], []);
      }

      // register the event
      this.events[this.layer][action][event].push({ vnode, repeat, callback });
    }

    /**
     * remove an event handler
     * @param {string} event name of the button event
     * @param {object} modifiers vue binding modifiers
     * @param {function} callback trigger function
     */
    public removeListener(event: string, modifiers: GamepadModifiers, callback: any) {
      const action = modifiers.released ? 'released' : 'pressed';

      // get a list of all events for the current action
      let events = get(this.events, [this.layer, action, event], []);
      if (events.length > 0) {
        // filter any events which have same callback
        events = events.filter((event: any) => event.callback !== callback);

        // if we have any remaining events after the filter, update the array
        // otherwise delete the object
        if (events.length > 0) {
          set(this.events, [this.layer, action, event], events);
        } else {
          delete this.events[this.layer][action][event];
        }
      }
    }

    /**
     * switch to a new layer
     * @param {number} layer layer number to switch to
     */
    public switchToLayer(layer: number) {
      if (this.layer !== layer) {
        // keep track of the old layer before we switch
        this.layers[layer] = this.layer;
        this.layer = layer;
      }
    }

    /**
     * remove a layer, delete the registered events and switch back to the old layer
     * @param {number} layer layer number to remove
     */
    public removeLayer(layer: number) {
      // switch back to the previous layer
      this.layer = this.layers[layer];
      delete this.layers[layer];

      // delete the layer events
      delete this.events[layer];
    }

    /**
     * main loop
     */
    public run() {
      this.getGamepads().forEach((pad) => {
        // check gamepad buttons
        pad.buttons.forEach((button: { [char: string]: any }, index: number) => {
          const name = options.buttonMapping[index]
          const gamepadName = 'gamepad:' + name;
          const gamepadVibrationName = 'gamepad-vibrate:' + name;
          // button is pressed
          if (button.pressed) {
            const events = get(this.events, [this.layer, 'pressed', gamepadName], []);
            const vibrationEvents = get(this.events, [this.layer, 'pressed', gamepadVibrationName], []);
            if (vibrationEvents.length > 0) {
              const vibrationEvent = vibrationEvents[vibrationEvents.length - 1];
              const now = Date.now();
              const initial = typeof this.holding[gamepadVibrationName] === 'undefined';

              // button was just pressed, or is repeating
              if (initial || (vibrationEvent.repeat && (now - this.holding[gamepadVibrationName]) >= options.repeatTimeout)) {
                this.holding[gamepadVibrationName] = now;
                if (initial) {
                  this.holding[gamepadVibrationName] += (Number(options.initialTimeout) - Number(options.repeatTimeout));
                }
                vibrationEvent.callback.call(this, pad);
              }
            }
            if (events.length > 0) {
              const event = events[events.length - 1];
              const now = Date.now();
              const initial = typeof this.holding[gamepadName] === 'undefined';

              // button was just pressed, or is repeating
              if (initial || (event.repeat && (now - this.holding[gamepadName]) >= options.repeatTimeout)) {
                this.holding[gamepadName] = now;
                if (initial) {
                  this.holding[gamepadName] += (Number(options.initialTimeout) - Number(options.repeatTimeout));
                }
                event.callback.call(this, pad);
              }
            }
          // button was released
          } else if (!button.pressed && typeof this.holding[gamepadName] !== 'undefined') {
            delete this.holding[gamepadName];
            delete this.holding[gamepadVibrationName];

            const events = get(this.events, [this.layer, 'released', gamepadName], []);
            const vibrationEvents = get(this.events, [this.layer, 'released', gamepadVibrationName], []);
            if (vibrationEvents.length > 0) {
              const event = vibrationEvents[events.length - 1];
              event.callback.call(this, pad);
            }
            if (events.length > 0) {
              const event = events[events.length - 1];
              event.callback.call(this, pad);
            }
          }
        });

        // check gamepad axis
        pad.axes.forEach((value: any, index: number) => {
          if (value >= options.threshold || value <= -(options.threshold)) {
            const name = getAxisNameFromValue(index, value);
            const events = get(this.events, [this.layer, 'pressed', name], []);

            if (events.length > 0) {
              const event = events[events.length - 1];
              const now = Date.now();
              const initial = typeof this.holding[name] === 'undefined';

              // axis was just moved, or is repeating
              if (initial
                  || (event.repeat
                      && (now - this.holding[name]) >= options.repeatTimeout)) {
                this.holding[name] = now;
                if (initial) {
                  this.holding[name] += (Number(options.initialTimeout)
                                         - Number(options.repeatTimeout));
                }
                event.callback.call(this, pad);
              }
            }
          } else {
            const names = getAxisNames(index);

            // trigger the release event if this axis was previously pressed
            names.filter((name) => this.holding[name])
              .forEach((name) => {
                delete this.holding[name];

                const events = get(this.events, [this.layer, 'released', name], []);
                if (events.length > 0) {
                  const event = events[events.length - 1];
                  event.callback.call(this, pad);
                }
              });
          }
        });
      });

      this.animationFrame = requestAnimationFrame(this.run.bind(this));
    }

    /**
     * get an array of active gamepads
     * @return {array}
     */
    public getGamepads(): any[] {
      return Array.from(navigator.getGamepads()).filter((pad) => pad !== null);
    }

    /**
     * helper function to test if a binding is valid
     * @param {object} binding binding to test which includes arg & value
     * @return {boolean}
     */
    public isValidBinding(binding: GamepadBinding) {
      return typeof binding.arg !== 'undefined' && (typeof binding.value === 'function' || (typeof binding.value === 'undefined' && typeof binding.expression === 'undefined'));
    }
  };
}