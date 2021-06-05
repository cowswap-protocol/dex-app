
export default {
  mode: 'spa',
  head: {
    title: "Cowswap",
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: "New DEX on BSC" },
      { hid: 'keywords', name: 'keywords', content: 'Dapp, DeFi, Staking' },
      { name: 'twitter:title', content: 'cowswap.org' },
      { name: 'twitter:description', content: "A new DEX on BSC" },
      { name: 'twitter:image', content: '/cowbaby.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:creator', content: '@StakeCow' }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/cowbaby.png' },
      { rel: 'apple-touch-icon', href: '/cowbaby.png' },
      { rel: 'shortcut icon', href: '/cowbaby.png' },
      { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.2.0/css/all.css' },
    ]
  },

  router: {
    routeNameSplitter: '/'
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    // 'bootstrap/dist/css/bootstrap.css',
    // 'bootstrap-vue/dist/bootstrap-vue.css'
    'buefy/dist/buefy.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/buefy',
    '@/plugins/i18n_vue',
    '@/plugins/web3_utils'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/date-fns'
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
