<template>
  <div>
    <div class="columns">
      <div class="column is-2"></div>
      <div class="column is-8 content">

        <div class="center">
          <img src="~/static/cowbaby.png" width="150" height="150">
        </div>

        <div>
          <quote>
            <h4>BSC tesnet network parameters</h4>
            <div>RPC URL: <b>https://data-seed-prebsc-1-s1.binance.org:8545</b></div>
            <div>Chain Id: <b>97</b></div>
            <div>Symbol: <b>BNB</b></div>
          </quote>
        </div>
        <br>
        <div class="distribution">
          <h3>Test tutorial </h3>
          <ol>
            <li>Claim testnet BNB at <a href="https://testnet.binance.org/faucet-smart" target="_blank">https://testnet.binance.org/faucet-smart</a> </li>
            <li>
              <div>
                Claim test tokens: 
                <b-button type="is-ghost" class="is-small" v-for="(token, i) in tokens" :key="i" @click="claim(token)">
                  Claim {{ token.symbol }}
                </b-button>
              </div>
            </li>
            <li>Place/Remove/Settle orders at <router-link to="/liquidity"><b>Liquidity</b></router-link> page</li>
            <li>Do some trades at <router-link to="/trade"><b>Trade</b></router-link> page</li>

            <li>You must complete all operations (Place/Remove/Settle orders and Trade) to get airdrop condition </li>

            <li>We will distribute <b>30 billion (30000000000) </b>$COWB to all testers who meet the conditions  </li>

            <li>Duration: <b>2021-06-04 8:00:00 UTC</b> ~  <b>2021-06-11 7:59:59 UTC</b></li>
            <!-- <li>Anyone who reports contract bugs will receive additional rewards. Please review code at <a href="">Github</a> </li> -->

          </ol>
        </div>

        
        <div class="center">
          <a href="https://t.me/stakecow_en" target="_blank">Telegram</a>
          <a href="https://twitter.com/StakeCow" target="_blank">Twitter</a>
        </div>
      </div>
      <div class="column is-2"></div>
    </div>
  </div>
</template>

<script>
  import utils from '~/mixins/utils'
  import { Mock } from '~/contracts'
  import { toBN, BN, isBN } from 'web3-utils'
  import { BigNumber } from 'bignumber.js'
  import config from '~/config'

  export default {
    data() {
      return {
        tokens: require('~/config/tokens.json')
      }
    },
    methods: {
      claim(token) {
        let tokenContract = new Mock(token.address, token.symbol, token.decimals)
        let account = this.$store.state.connectedAccount;
        tokenContract.mint(account, account, 10000, () => {

        }).then(receipt => {
          alert("Successfully claimed")
        }).catch(err => {

          alert("claim failed: " + err.message)
        })
      }
    },
    created() {
    },
    async mounted() {
      try{
        await this.$onConnect();
      } catch(err) {
      }
    }
  }
</script>

<style scoped>
  .center{
    text-align: center;
    margin-top: 1rem;
  }
  .distribution {
    text-align: left;
    margin-bottom: 1rem;
  }
  .distribution ul {
    font-size: 1.1rem;
  }
  .contracts {
    margin-top: 1rem;
    text-align: center;
  }

</style>
