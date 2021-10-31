<template>
  <slot name="no-gamepads" v-if="$slots['no-gamepads'] && gamepads.length == 0" />
  <slot v-else :gamepads="gamepads" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { _onGamepadListUpdated, _onGamepadsInput } from '../utils'
export default defineComponent({
  name: 'GamepadDiscover',
  props: {
    discoverNew: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      discoveredGamepads: [],
      gamepads: []
    }
  },
  mounted() {
    _onGamepadListUpdated((gamepads) => {
      if (this.discoverNew) {
        this.discoveredGamepads = gamepads
      }
    })
    _onGamepadsInput((gamepads) => {
      this.gamepads = gamepads
    })
  }
})
</script>
