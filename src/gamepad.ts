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
} from './types.d'

import {
  getGamepads,
  PlayerEventNames,
  ButtonNames
} from './utils'

export default function (app: App, options: ComposableOptions) {
  return class Gamepad {
    private app: App = app
    public options: ComposableOptions = options
    public holding: { [char: string]: any }
    public events: { [char: string]: any }
    // Player events - Events added to a specific player
    public playerEvents: { [char: string]: { [char: string]: any } }
    public playerHolding: { [char: string]: { [char: string]: any } }
    // public layers: { [char: string]: any }
    // public layer: number
    public animationFrame: any

    public constructor() {
      window.addEventListener('gamepadconnected', this.gamepadHandler.bind(this, true));
      window.addEventListener('gamepaddisconnected', this.gamepadHandler.bind(this, false));

      this.playerEvents = {}
      this.playerHolding = {}
      this.animationFrame = requestAnimationFrame(this.run.bind(this));
    }

    public gamepadHandler(connecting, event) {
      if (connecting) {
        this.app.config.globalProperties.$isGamepadConnected = event
      } else {
        if (getGamepads().length === 0) {
          this.app.config.globalProperties.$isGamepadConnected = event
          // document.body.classList.remove('gamepad-connected');
        }
      }
    }

    public run() {
      window.dispatchEvent(new Event('gamepadinput'));
      this.gamepadButtonHandler()
      this.animationFrame = requestAnimationFrame(this.run.bind(this));
    }

    public gamepadButtonHandler() {

      getGamepads().forEach((gamepad, index) => {
        const player = `player-${index+1}`
        gamepad.buttons.forEach((button: { [char: string]: any }, index: number) => {
          if (!this.playerEvents[player]) {
            return
          }
          const buttonName = options.buttonMapping[index]

          // button is pressed
          if (button.pressed) {
            // const events = get(this.events, [this.layer, 'pressed', gamepadName], []);
            const events = this.playerEvents[player]['pressed'][buttonName] || []
            if (events.length === 0) {
              return
            }
            const event = events[events.length - 1];
            const now = Date.now();
            this.playerHolding[player] || (this.playerHolding[player] = {})
            const initial = typeof this.playerHolding[player][buttonName] === 'undefined';

            // button was just pressed, or is repeating
            if (initial || (event.repeat && (now - this.playerHolding[player][buttonName]) >= options.repeatTimeout)) {
              this.playerHolding[player][buttonName] = now;
              if (initial) {
                this.playerHolding[player][buttonName] += (Number(options.initialTimeout) - Number(options.repeatTimeout));
              }
              event.callback.call(this, gamepad);
            }
          // button was released
          } else if (!button.pressed && this.playerHolding[player] && typeof this.playerHolding[player][buttonName] !== 'undefined') {
            delete this.playerHolding[player][buttonName];
            if (!this.playerEvents[player]['released']) {
              return
            }

            const events = this.playerEvents[player]['released'][buttonName]
            if (events.length > 0) {
              const event = events[events.length - 1];
              event.callback.call(this, gamepad);
            }
          }
        });
      });
    }
/*
    public gamepadAxesHandler() {
      getGamepads().forEach((pad) => {
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
    }
*/
    public isValidBinding(binding: GamepadBinding) {
      return typeof binding.arg !== 'undefined' && (typeof binding.value === 'function' || (typeof binding.value === 'undefined' && typeof binding.expression === 'undefined'));
    }

    public isValidPlayerEvent(playerEvent: string) {
      return PlayerEventNames.indexOf(playerEvent) > -1;
    }

    /**
     * add an event handler
     * @param {string} player name of the button event
     * @param {object} modifiers vue binding modifiers
     * @param {function} callback function to trigger
     * @param {object} vnode vue directive vnode
     */
     public addListener(player: string, modifiers: GamepadModifiers, callback: any, vnode: VNode | null = null) {
      const action = modifiers.released ? 'released' : 'pressed';
      const repeat = !!modifiers.repeat;

      const getButtonEvents = ButtonNames.filter((button) => {
        return Object.keys(modifiers).indexOf(button) > -1
      })
      
      if (this.isValidPlayerEvent(player)) {
        this.playerEvents[player] || (this.playerEvents[player] = {})
        this.playerEvents[player][action] || (this.playerEvents[player][action] = {})
        for (let index = 0; index < getButtonEvents.length; index++) {
          const button = getButtonEvents[index]
          if (!Array.isArray(this.playerEvents[player][action][button])) {
            this.playerEvents[player][action][button] = []
          }
          this.playerEvents[player][action][button].push({
            vnode,
            repeat,
            callback
          });
        }
      } else {

      }

      // if we don't already have an array initialised for the current event
      // do it now
      /* const events = get(this.events, [this.layer, action, event], []);
      if (events.length === 0) {
        set(this.events, [this.layer, action, event], []);
      }

      // register the event
      this.events[this.layer][action][event].push({ vnode, repeat, callback }); */
    }

    /**
     * remove an event handler
     * @param {string} event name of the button event
     * @param {object} modifiers vue binding modifiers
     * @param {function} callback trigger function
     */
    public removeListener(event: string, modifiers: GamepadModifiers, callback: any) {
      const action = modifiers.released ? 'released' : 'pressed';

      console.log(modifiers)

      // get a list of all events for the current action
      /*let events = get(this.events, [this.layer, action, event], []);
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
      }*/
    }
  }
}