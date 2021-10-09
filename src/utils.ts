export const PositiveAxisNames: string[] = [
  'left-analog-right', 'left-analog-down',
  'right-analog-right', 'right-analog-down',
];

export const NegativeAxisNames: string[] = [
  'left-analog-left', 'left-analog-up',
  'right-analog-left', 'right-analog-up',
];

export const ButtonNames: string[] = [
  'button-a', 'button-b', 'button-x', 'button-y',
  'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right',
  'button-select', 'button-start',
  'left-stick-in', 'right-stick-in',
  'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right',
  'vendor',
];

export const PlayerEventNames: string[] = [
  'player-1', 'player-2', 'player-3', 'player-4',
  'player-5', 'player-6', 'player-7', 'player-8',
];

export const defaultVibrationActuator: any = {
  startDelay: 0,
  duration: 200,
  weakMagnitude: 0.1,
  strongMagnitude: 0.1
}

export const getGamepads = (): Gamepad[] => {
  return Array.from(navigator.getGamepads()).filter((pad) => pad !== null);
}

export const _onGamepadConnected = (callback: Function) => {
  window.addEventListener('gamepadconnected', (event) => {
    if (event.gamepad.mapping !== 'standard') {
      console.warn('The connected gamepad might not be supported. Mapping name:', event.gamepad.mapping)
    }
    callback.bind(this, event)()
  });
}

export const _onGamepadDisconnected = (callback: Function) => {
  window.addEventListener('gamepaddisconnected', callback.bind(this));
}

export const _onGamepadListUpdated = (callback: Function) => {
  const fetchList = () => {
    callback.bind(this, getGamepads())()
  }
  window.addEventListener('gamepadconnected', fetchList.bind(this));
  window.addEventListener('gamepaddisconnected', fetchList.bind(this));
}
export const _onGamepadsInput = (callback: Function) => {
  const fetchList = () => {
    callback.bind(this, getGamepads())()
  }
  window.addEventListener('gamepadinput', fetchList.bind(this));
}
export const _onGamepadInput = (gamepad: Gamepad, callback: Function) => {
  const fetchList = () => {
    const gamepad = getGamepads().find((item) => {
      return item.index === gamepad.index
    })[0]
    callback.bind(this, gamepad)()
  }
  window.addEventListener('gamepadinput', fetchList.bind(this));
}

export const _resolveButton = (key: string) => {
  return Object.values(ButtonNames).indexOf(key)
}

export const _vibrateController = (gamepad: any, vibrationActuator: any = defaultVibrationActuator) => {
  vibrationActuator = {
    ...defaultVibrationActuator,
    ...vibrationActuator
  }
  gamepad.vibrationActuator.playEffect("dual-rumble", vibrationActuator)
}
