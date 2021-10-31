import { defineClientAppEnhance,  } from '@vuepress/client'
import useGamepad from '../../src/main'

export default defineClientAppEnhance(({ app }) => {
  app.use(useGamepad)
})
