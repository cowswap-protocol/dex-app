<template>
  <div>
    <div >
      <div class="columns">
        <div class="column is-4 depth">
          <div class="columns is-gapless mb-0 is-mobile">
            <div class="column">Price({{ tokenIn }})</div>
            <div class="column">Size({{ tokenOut }})</div>
          </div>
          <div class="columns is-gapless mb-0 is-mobile" v-for="depth in depths">
            <div class="column">
              <b>{{ depth[0].toFixed(4, 1) }}</b>
            </div>
            <div class="column">
              {{ depth[1].div(depth[0]).toFixed(8, 1) }}
            </div>
          </div>
        </div>
        <div class="column is-4 swap">
          <section class="currency-input">
            <div class="field">
              <label class="has-text-grey">From</label>
              <span class="balance is-pulled-right">Balance: <span class="bal is-clickable">{{ tokenInBalance.toFixed(8, 1) }}</span></span>
              <div class="field-body">
                <div class="field has-addons">
                  <b-input type="number" expanded v-model="amountIn" @input="onAmountInChanged"></b-input>
                  <div class="select">
                    <select v-model="tokenIn">
                      <option v-for="(token, i) in tokens" :key="i" :value="token.symbol"> 
                        {{ token.symbol }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="arrow">
            <div class="block">
              <img src="~/static/arrow_down.svg">
            </div>
          </section>

          <section>
            <div class="field">
              <label class="has-text-grey">To</label>
              <span class="balance is-pulled-right">Balance: <span class="bal is-clickable">{{ tokenOutBalance.toFixed(8, 1) }}</span></span>
              <div class="field-body">
                <div class="field has-addons">
                  <b-input type="number" expanded v-model="amountOut"></b-input>
                  <div class="select">
                    <select v-model="tokenOut">
                      <option v-for="(token, i) in tokens" :key="i" :value="token.symbol"> 
                        {{ token.symbol }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="actions">
            <b-field>
              <p class="control is-justify-content-center is-align-content-center ">
                <b-button v-if="!inTokenApproved" label="Approve" type="is-danger" expanded @click="onApprove" />
                <b-button v-else label="Swap" type="is-info" expanded :disabled="swapDisabled" @click="onSwap" />
              </p>
            </b-field>
          </section>

        </div>
        <div class="column is-4"></div>
      </div>
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
        tokens: require('~/config/tokens.json'),
        tokenIn: 'USDT',
        tokenOut: 'BUSD',
        amountIn: '',
        amountOut: '',
        lastInput: 'IN',
        depths: [],
        inTokenApproved: true,
        tokenInBalance: BigNumber(0),
        tokenOutBalance: BigNumber(0),
        swapDisabled: false,
      }
    },
    computed: {
    },
    watch: {
      amountIn: function (newValue, oldValue) {
        // console.log('xxx')
        // this.debouncedCalcAmountOut()
      },
      amountOut: function (newValue, oldValue) {
        // console.log("amountOut", newValue, oldValue)
      },
      tokenIn: function (newValue, oldValue) {
        // console.log("tokenIn", newValue, oldValue)
      },
      tokenOut: function (newValue, oldValue) {
        // console.log("tokenOut", newValue, oldValue)
      },
    },
    methods: {
      calcAmountOut() {
        console.log("calcAmountOut")
      },
      calcAmountIn() {
        console.log("calcAmountIn")
      },
      etherscanAddress(addr) {
        return utils.etherscanAddr(addr)
      },
      tokenAddress(addr) {
        return utils.tokenAddress(addr)
      },
      etherscanTx(tx) {
        return utils.etherscanTx(tx)
      },
      async onAmountInChanged() {
        if(this.amountIn == '') return;
        this.swapDisabled = new BigNumber(this.amountIn).gt(this.tokenInBalance);
        let a = this.tokens.find(t => { return t.symbol == this.tokenIn });
        let b = this.tokens.find(t => { return t.symbol == this.tokenOut });

        let amounts = await this.Router.getAmountsOut(this.amountIn, [a, b])
        this.amountOut = amounts[amounts.length - 1].toString();
      },
      onSwap() {
        let a = this.tokens.find(t => { return t.symbol == this.tokenIn });
        let b = this.tokens.find(t => { return t.symbol == this.tokenOut });
        let account = this.$store.state.connectedAccount
        this.Router.swapExactTokensForTokens(account, this.amountIn, this.amountOut, [a, b], (err, txHash) => {
          if(txHash) {
            this.$store.commit('updateTx', { hash: txHash, status: 'pending', msgType: 'info' })
          }
        }).then(receipt => {
          this.$store.commit('updateTx',  {
              hash: receipt.transactionHash, 
              status: receipt.status ? 'success' : 'failed', 
              duration: 1000,
              msgType: receipt.status ? 'success' : 'danger'
          })
          setTimeout(() => {
            this.$store.commit('resetTx')
          }, 1000)
        }).catch(err => {
          this.$store.commit('updateTxStatus', 'failed')
          this.$store.commit('updateTxDuration', 1000)
          this.$store.commit('updateTxMsgType', 'danger')
          setTimeout(() => {
            this.$store.commit('resetTx')
          }, 1000)
        })
      },
      onApprove() {
        let t = this.tokens.find((t) => { return t.symbol == this.tokenIn });
        let token = new Erc20(t.address, t.symbol, t.decimals)
        token.approveMax(this.$store.state.connectedAccount, config.router, (err, txHash) => {
          if(txHash) {
            this.$store.commit('updateTx', { hash: txHash, status: 'pending', msgType: 'info' })
          }
        }).then(receipt => {
          this.$store.commit('updateTx',  {
              hash: receipt.transactionHash, 
              status: receipt.status ? 'success' : 'failed', 
              duration: 1000,
              msgType: receipt.status ? 'success' : 'danger'
          })
          setTimeout(() => {
            this.$store.commit('resetTx')
          }, 2000)
        }).catch(err => {
          this.$store.commit('updateTxStatus', 'failed')
          this.$store.commit('updateTxDuration', 1000)
          this.$store.commit('updateTxMsgType', 'danger')
          setTimeout(() => {
            this.$store.commit('resetTx')
          }, 2000)
        })
      },
      async update() {
        let account = this.$store.state.connectedAccount;
        let a = this.tokens.find(t => { return t.symbol == this.tokenIn });
        let b = this.tokens.find(t => { return t.symbol == this.tokenOut });

        this.inToken = new Erc20(a.address, a.symbol, a.decimals)
        this.outToken = new Erc20(b.address, b.symbol, b.decimals)

        this.inTokenAllowance = await this.inToken.allowance(account, config.router)
        this.inTokenApproved = !this.inTokenAllowance.isZero() && this.inTokenAllowance.gte(new BigNumber(this.amountIn || 0))
        this.tokenInBalance = await this.inToken.balanceOf(account);
        this.tokenOutBalance = await this.outToken.balanceOf(account);
        this.depths = await this.Dex.getDepth(b, a)
      }
    },
    created() {
      this.debouncedCalcAmountOut = _.debounce(this.calcAmountOut, 500)
    },
    async mounted() {
      try{
        await this.$onConnect();
      } catch(err) {
      }

      let account = this.$store.state.connectedAccount;
      this.Dex = new Dex(config.dex)
      this.Router = new Router(config.router)
      
      await this.update()
      setInterval(this.update, 3 * 1000)
    }
  }
</script>

<style scoped>
  .arrow{
    text-align: center;
    margin-top: 1rem;
  }
  .arrow img {
    padding: 0.1rem;
  }
  .currency-input {
    padding: 0.1rem;
  }
  .actions {
    margin-top: 1rem;
    text-align: center;
  }
  .swap {
    border: solid 1px #ccc;
    padding: 1rem;
    margin-top: 5rem;
    border-radius: 5px;
  }

</style>
