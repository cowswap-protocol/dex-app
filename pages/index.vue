<template>
  <div>
    <div class="columns">
      <div class="column is-2"></div>
      <div class="column is-8 content">

        <div class="center">
          <img src="~/static/cowbaby.png" width="150" height="150">
        </div>

        <h1>This is a test version on BSC testnet. All addresses participating in the test event will receive an airdrop</h1>

        <br>
        <div class="distribution">
          <h3>What is Cowswap?</h3>
          <div>Cowswap is limit orders based and trading driven DEX on Binance Smart Chain. All orders share the traded amount pro-rata.</div>
        </div>

        <div class="distribution">
          <h3>What is the difference from other (Uni/Pancake/**)swaps? </h3>
          <div>Uniswap is an AMM DEX based on math x * y = K. Uniswap is good, but people need limit order DEX too. So we want to create a new limit order DEX. All the orders will be matched according to the price when trading, like traditional exchange. But all the orders share the traded amount pro-rata, not according to the order time. </div>
        </div>

        <div class="distribution">
          <h3>The Roadmap</h3>
          <div>OK so it's not actually a roadmap: it's a to-do list. This is how we work: as fast as we can, on the things we can.</div>
          <ul>
            <li><input type="checkbox" disabled checked> COWB issue</li>
            <li><input type="checkbox" disabled> Cowswap DEX on BSC testnet</li>
            <li><input type="checkbox" disabled> Test airdrop event</li>
            <li><input type="checkbox" disabled> Support reflect tokens(PIG,SAFEMOON..) </li>
            <li><input type="checkbox" disabled> Cowswap DEX on BSC mainnet</li>
            <li><input type="checkbox" disabled> Trading mining & farming</li>
            <li><input type="checkbox" disabled> UX improvements</li>
            <li><input type="checkbox" disabled> IDO platform on Cowswap DEX</li>
          </ul>
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
  import { Erc20, Router, Dex } from '~/contracts'
  import { toBN, BN, isBN } from 'web3-utils'
  import { BigNumber } from 'bignumber.js'
  import config from '~/config'

  export default {
    data() {
      return {
      }
    },
    methods: {
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
