const { path } = require('@vuepress/utils')

module.exports = {
  lang: 'en-US',
  title: 'Vue use gamepad',
  description: 'Vue use gamepad documentation site',

  themeConfig: {
    logo: 'https://vuejs.org/images/logo.png',
  },
  plugins: [
    '@vuepress/plugin-nprogress',
    '@vuepress/plugin-pwa',
    ['@vuepress/search', {
      searchMaxSuggestions: 10
    }],
    [
      '@vuepress/register-components',
      {
        components: {
          GamepadDiscover: path.resolve(__dirname, '../../src/components/GamepadDiscover.vue'),
          controller: path.resolve(__dirname, './components/GamepadController.vue'),
        },
        // componentsDir: path.resolve(__dirname, './components')
      },
    ],
  ],
}