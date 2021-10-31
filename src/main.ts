/* import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app') */

import {
  App,
  defineComponent,
  inject,
  onBeforeUnmount,
  ref,
  Ref,
  UnwrapRef,
  watchEffect,
  VNode
} from 'vue'

import {
  ComposableOptions
} from './types.d'

import GamepadFactory from './gamepad';
import {
  // Mappings
  ButtonNames,
  PositiveAxisNames,
  NegativeAxisNames,

  // Helpers
  getGamepads,
  _onGamepadConnected,
  _onGamepadDisconnected,
  _onGamepadListUpdated,
  _resolveButton,
  _vibrateController
} from './utils'

import GamepadDiscover from './components/GamepadDiscover.vue'
import GamepadResolver from './components/GamepadResolver.vue'

// import GamepadFactory from './gamepad';

export const DefaultOptions = {
  threshold: 0.5,
  buttonMapping: ButtonNames,
  repeatTimeout: 200,
  initialTimeout: 200,
  controllerVibration: true,
  mobileVibration: false
};

export default {
  install(app: App, options = {}) {
    const version = Number(app.version.split('.')[0])

    if (version < 3) {
      console.warn('This plugin requires Vue 3')
    }

    if (!('getGamepads' in navigator)) {
      console.error('vue-use-gamepad: your browser does not support the Gamepad API!');
      return;
    }

    const Gamepad = GamepadFactory(app, { ...DefaultOptions, ...options });
    const gamepad = new Gamepad();
    app.config.globalProperties.$gamepad = gamepad

    app.component(GamepadDiscover.name, GamepadDiscover)
    app.component(GamepadResolver.name, GamepadResolver)

    app.directive('gamepad', {
      beforeMount: (el, binding, vnode: VNode, prevVnode) => {
        console.log(binding)
        if (gamepad.isValidBinding(binding)) {
          const callback = typeof binding.value !== 'undefined' ? binding.value : vnode.props.onClick;
          gamepad.addListener(binding.arg, binding.modifiers, callback, vnode);
        } else {
          console.error(`invalid binding. '${binding.arg}' was not bound.`);
        }
      },
      unmounted: (el, binding, vnode: VNode, prevVnode) => {
        if (gamepad.isValidBinding(binding)) {
          const callback = typeof binding.value !== 'undefined' ? binding.value : vnode.props.onClick;
          gamepad.removeListener(binding.arg, binding.modifiers, callback);
        } else {
          console.error(`invalid binding. '${binding.arg}' was not unbound.`);
        }
      },
    });

    app.directive('gamepad-vibrate', {
      beforeMount: (el, binding, vnode: VNode, prevVnode) => {
        if (binding.arg !== 'undefined') {
          const value = typeof binding.value !== 'undefined' ? binding.value : 200;
          function callback(controller) {
            if (gamepad.options.controllerVibration || gamepad.options.mobileVibration) {
              controller.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: value,
                weakMagnitude: 0.1,
                strongMagnitude: 0.1
              })
            }
          }(value)
          gamepad.addListener('gamepad-vibrate:' + binding.arg, binding.modifiers, callback, vnode);
        } else {
          console.error(`invalid binding. '${binding.arg}' was not bound.`);
        }
      },
      unmounted: (el, binding, vnode: VNode, prevVnode) => {
        if (gamepad.isValidBinding(binding)) {
          const callback = typeof binding.value !== 'undefined' ? binding.value : vnode.props.onClick;
          gamepad.removeListener('gamepad-vibrate:' + binding.arg, binding.modifiers, callback);
        } else {
          console.error(`invalid binding. '${binding.arg}' was not unbound.`);
        }
      },
    });
  }
}

export function useGamepad(
  {
    threshold = DefaultOptions.threshold,
    initialTimeout = DefaultOptions.initialTimeout,
    repeatTimeout = DefaultOptions.repeatTimeout,
    buttonMapping = DefaultOptions.buttonMapping
  }: ComposableOptions
) {

}

export const onGamepadConnected = _onGamepadConnected

export const onGamepadDisconnected = _onGamepadDisconnected

export const onGamepadListUpdated = _onGamepadListUpdated

export const resolveButton = _resolveButton

export const vibrateController = _vibrateController