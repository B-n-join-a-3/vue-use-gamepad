---
home: true
title: Home
#actions:
#  - text: Get Started
#    link: /guide/getting-started.html
#    type: primary
features:
  - title: Browser API
    details: The package uses the standard browser API and simplifies the process of using it with Vue
  - title: Vue-Powered
    details: Enjoy the dev experience of Gamepads within Vue.
footer: MIT Licensed | Copyright © 2021-present Alexander Wennerstrøm
---

<GamepadDiscover>
  <template v-slot="{gamepads}">
    <div
      v-for="(gamepad, index) in gamepads"
      :key="index"
    >
      <controller :gamepad="gamepad" />
      <br />
      {{ gamepad.id }} - {{gamepad.mapping}}
      <br />
    </div>
  </template>
  <template v-slot:no-gamepads>
    <h4 style="text-align:center;background-color:var(--c-brand);color:var(--c-bg);padding:15px;">Press any key on a gamepad to connect it</h4>
  </template>
</GamepadDiscover>

### As Easy as 1, 2, 3

<CodeGroup>
  <CodeGroupItem title="NPM">
  
```bash
# install in your project
npm install vue-use-gamepad --save-dev
```

  </CodeGroupItem>
</CodeGroup>

<CodeGroup>
  <CodeGroupItem title="ts">
  
```ts
// Add library to vue instance
import { createApp } from 'vue'
import App from './App.vue'
import useGamepad from 'vue-use-gamepad'

const app = createApp(App)
app.use(useGamepad)
app.mount('#app')
```

  </CodeGroupItem>
</CodeGroup>
