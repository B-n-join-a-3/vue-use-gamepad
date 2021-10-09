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
  VNode,
} from 'vue'
import GamepadFactory from './gamepad';
import {
  ComposableOptions
} from '../types.d'

export const ButtonNames: string[] = [
  'button-a', 'button-b', 'button-x', 'button-y',
  'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right',
  'button-select', 'button-start',
  'left-stick-in', 'right-stick-in',
  'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right',
  'vendor',
];

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
      console.error('vue-gamepad: your browser does not support the Gamepad API!');
      return;
    }

    const Gamepad = GamepadFactory(app, { ...DefaultOptions, ...options });
    const gamepad = new Gamepad();

    app.directive('gamepad', {
      beforeMount: (el, binding, vnode: VNode, prevVnode) => {
        if (gamepad.isValidBinding(binding)) {
          const callback = typeof binding.value !== 'undefined' ? binding.value : vnode.props.onClick;
          gamepad.addListener('gamepad:' + binding.arg, binding.modifiers, callback, vnode);
        } else {
          console.error(`invalid binding. '${binding.arg}' was not bound.`);
        }
      },
      unmounted: (el, binding, vnode: VNode, prevVnode) => {
        if (gamepad.isValidBinding(binding)) {
          const callback = typeof binding.value !== 'undefined' ? binding.value : vnode.props.onClick;
          gamepad.removeListener('gamepad:' + binding.arg, binding.modifiers, callback);
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

export const PositiveAxisNames: string[] = [
  'left-analog-right', 'left-analog-down',
  'right-analog-right', 'right-analog-down',
];

export const NegativeAxisNames: string[] = [
  'left-analog-left', 'left-analog-up',
  'right-analog-left', 'right-analog-up',
];

/**
 * get name of axis from input value
 * @param {number} axis axis id
 * @param {number} value current input value
 * @return {string} string representing the axis name
 */
export function getAxisNameFromValue(axis: number, value: number) {
  if (value > 0) return PositiveAxisNames[axis];
  return NegativeAxisNames[axis];
}

/**
 * get the name of both position and negative names from an axis
 * @param {number} axis axis is
 * @return {array} array containing both position and negative axis names
 */
export function getAxisNames(axis: number) {
  return [PositiveAxisNames[axis], NegativeAxisNames[axis]];
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