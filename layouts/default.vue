<template>
  <div id="content">
    <b-navbar>
        <template #brand>
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
                <img src="~/static/cowbaby.png" width="28" height="28">
            </b-navbar-item>
        </template>
        <template #start>
          <div class="navbar-start">
            <router-link to="/" class="navbar-item">
              Home
            </router-link>
            <router-link to="/trade" class="navbar-item">
              Trade
            </router-link>
            <router-link to="/liquidity" class="navbar-item">
              Liquidity
            </router-link>
            <router-link to="/tutorial" class="navbar-item">
              Test Tutorial
            </router-link>
          </div>
        </template>

        <template #end>
          <div class="navbar-item">
            <div class="buttons">
              <a class="button is-light">
                <span v-if="checkChainId">
                  <b-icon
                    pack="fas"
                    icon="wallet"
                    size="is-small">
                  </b-icon><span>{{ shortAddr($store.state.connectedAccount) }}</span>
                </span>
                <span v-else class="wrong-network">
                  Wrong Network. Please connect to BSC testnet
                </span>
              </a>
            </div>
          </div>
        </template>
    </b-navbar>

    <div class="container">
      <nuxt />
    </div>
    
    <b-message title="Transaction" :type="'is-' + tx.msgType " aria-close-label="Close message" class="tx-message" v-model="tx.hash != ''" :auto-close="tx.duration > 0" :duration="tx.duration">
      <b-icon
        v-if="txStatus == 'pending'"
        pack="fas"
        icon="sync-alt"
        custom-class="fa-spin">
      </b-icon>
      <b-icon
        v-if="txStatus == 'success'"
        pack="fas"
        icon="check-circle">
      </b-icon>
      <b-icon
        v-if="txStatus == 'failed'"
        pack="fas"
        icon="times-circle">
      </b-icon>
      {{ txHash }}
    </b-message>
  </div>
</template>

<script>
  import utils from '~/mixins/utils'
  import config from '~/config'
  export default {
    data () {
      return {
        walletInstalled: true,
        walletLocked: false,
        language: {
          en: "English",
          zh_CN: "简体中文"
        }
      }
    },
    computed: {
      currentLang(){
        return  this.$store.state.locale
      },
      checkChainId() {
        if(/MathWallet/i.test(window.navigator.userAgent)){
          return true
        }
        if(window.detectProvider && window.detectProvider.isTrust) return true;
        if(this.$store.state.isMathWallet) return true;
        return config.chainId == this.$store.state.chainId
      },
      txHash() {
        return this.$store.state.tx.hash;
      },
      txStatus() {
        return this.$store.state.tx.status;
      },
      tx() {
        return this.$store.state.tx
      }
    },
    methods: {
      checkLanguage(lang){
        this.$i18n.locale = lang
        this.$store.commit('updateLang', lang)
      },
      shortAddr(addr) {
        return utils.shortAddr(addr)
      },
      async onUnlock() {
        await this.$onConnect()
      }
    },
    async created() {
      try{
        await this.$onConnect();
      } catch(err) {
        if(err.toString() == "Error: User rejected the signature request") {
          this.walletLocked = true
        }
      }
    }
  }
</script>


<style>
  body {
    font-family: Montserrat-Thin,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif !important;
  }
  .header {
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 1rem;
  }
  .tx-message{
    position: absolute;
    right: 0;
    bottom: 1rem;
  }
  .wrong-network {
    color: #f14668;
  }
</style>
