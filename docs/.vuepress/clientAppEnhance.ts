import { defineClientAppEnhance,  } from '@vuepress/client'

export default defineClientAppEnhance(async ({ app }) => {
  if (!__VUEPRESS_SSR__) {
    const useGamepad = await import('../../src/main')
    console.log(useGamepad['default'])
    app.use(useGamepad['default'])
  }
})
