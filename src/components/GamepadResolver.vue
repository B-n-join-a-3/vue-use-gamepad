<template>
  <slot
    v-bind="gamepad"
  />
</template>

<script>
import { _onGamepadInput } from '../utils'
export default {
  name: 'GamepadResolver',
  props: {
    gamepad: {
      type: Object
    }
  },
  data() {
    return {
      gamepadData: Object,
    }
  },
  mounted() {
    /* _onGamepadInput(gamepad, (gamepad) => {
      this.gamepadData = gamepad
    }) */
  }
}
</script>
