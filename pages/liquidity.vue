<template>
  <div>
    <div >
      <div class="columns">
        <div class="column is-4 depth">
          <div class="columns is-gapless mb-0 is-mobile">
            <div class="column">Price({{ tokenOut }})</div>
            <div class="column">Size({{ tokenIn }})</div>
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
              <label class="has-text-grey">Price</label>
              <div class="field-body">
                <div class="field has-addons">
                  <b-input type="number" expanded v-model="price" @input="onPriceChanged"></b-input>
                </div>
              </div>
            </div>
          </section>

          <section class="currency-input">
            <div class="field">
              <label class="has-text-grey">Sell</label>
              <span class="balance is-pulled-right">Balance: <span class="bal is-clickable">{{tokenInBalance.toFixed(8, 1) }}</span></span>
              <div class="field-body">
                <div class="field has-addons">
                  <b-input type="number" expanded v-model="amountIn" @input="onInChanged"></b-input>
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

          <section class="currency-input">
            <div class="field">
              <label class="has-text-grey">Get</label>
              <span class="balance is-pulled-right">Balance: <span class="bal is-clickable">{{tokenOutBalance.toFixed(8, 1) }}</span></span>
              <div class="field-body">
                <div class="field has-addons">
                  <b-input type="number" expanded v-model="amountOut" @input="onOutChanged"></b-input>
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
                <b-button v-if="!sellTokenApproved" label="Approve" type="is-danger" expanded @click="onApprove" />
                <b-button v-else label="Place" type="is-info" expanded @click="onPlace" />
              </p>
            </b-field>
          </section>

        </div>
        <div class="column is-4"></div>
      </div>
      <div class="mt-4">
        <div class="table-container">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <td>Price</td>
                <td>Volume</td>
                <td>Pending</td>
                <td>Filled</td>
                <td>Fee Reward</td>
                <td>Remove/Settle</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="liquidity in liquidities">
                <td>{{ liquidity.price }} {{ liquidity.tokenOut.symbol }}/{{ liquidity.tokenIn.symbol }}</td>
                <td>{{ liquidity.pending.div(liquidity.price).toFixed(8, 1) }} {{ liquidity.tokenIn.symbol }}</td>
                <td>{{ liquidity.pending.toFixed(8, 1)  }} {{ liquidity.tokenOut.symbol }} </td>
                <td>{{ liquidity.filled.toFixed(8, 1) }} {{ liquidity.tokenOut.symbol }} </td>
                <td>{{ liquidity.feeRewarded.toFixed(8, 1)  }} {{ liquidity.tokenOut.symbol }} </td>
                <td>
                  <b-button type="is-info" class="is-small" @click="onRemove(liquidity.tokenIn, liquidity.tokenOut, liquidity.rawPrice)">Remove</b-button>
                  <b-button type="is-success" class="is-small" @click="onRedeem(liquidity.tokenIn, liquidity.tokenOut, liquidity.rawPrice)">Settle</b-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import utils from '~/mixins/utils'
  import { Erc20, Dex, Router } from '~/contracts'
  import { toBN, BN, isBN } from 'web3-utils'
  import { BigNumber } from 'bignumber.js'
  import config from '~/config'

  export default {
    data() {
      return {
        tokens: require('~/config/tokens.json'),
        depths: [],
        orders: [],
        liquidities: [],
        sellToken: null,
        sellTokenAllowance: new BigNumber(0),
        sellTokenApproved: true,
        tokenInBalance: new BigNumber(0),
        tokenOutBalance: new BigNumber(0),
        tokenIn: 'USDT',
        tokenOut: 'BUSD',
        amountIn: '',
        price: '',
        amountOut: ''
      }
    },
    computed: {

    },
    watch: {
      tokenIn: function(val, old) {
        let t = this.tokens.find(t => { return t.symbol == this.tokenIn });
        this.sellToken = new Erc20(t.address, t.symbol, t.decimals)
        this.sellToken.balanceOf(this.$store.state.connectedAccount).then(bal => {
          this.tokenInBalance = bal
        })
        this.sellToken.allowance(this.$store.state.connectedAccount, config.dex).then(allowance => {
          this.sellTokenAllowance = allowance;
          this.sellTokenApproved = !allowance.isZero() && allowance.gte(BigNumber(this.amountIn || 0))
        })
        this.update().then(x => console.log)
      },

      tokenOut: function(val, old) {
        this.update().then(x => console.log)
      }
      // amountIn: function(val, old) {
      //   this.setAmountOut()
      //   this.sellTokenApproved = this.sellTokenAllowance.gt(BigNumber(this.amountIn || 0))
      // },
      // amountOut: function(val, old) {
      //   this.setPrice()
      // },
      // price: function(val, old) {
      //   this.setAmountOut()
      // }
    },
    methods: {
      etherscanAddress(addr) {
        return utils.etherscanAddr(addr)
      },
      tokenAddress(addr) {
        return utils.tokenAddress(addr)
      },
      etherscanTx(tx) {
        return utils.etherscanTx(tx)
      },

      findToken(addr) {
        return this.tokens.find(t => { return t.address.toLowerCase() == addr.toLowerCase() });
      },

      setAmountOut() {
        let amountIn = new BigNumber(this.amountIn || 0)
        let price = new BigNumber(this.price || 0)
        this.amountOut = amountIn.times(price).toString()
      },

      setPrice() {
        let amountIn = new BigNumber(this.amountIn || 0)
        let amountOut = new BigNumber(this.amountOut || 0)
        this.price = amountOut.div(amountIn)
      },

      onInChanged() {
        this.setAmountOut()
        this.sellTokenApproved = this.sellTokenAllowance.gt(BigNumber(this.amountIn || 0))
      },
      onPriceChanged(){
        if(this.price == '') return;
        if(this.price.indexOf('.') >= 0 && this.price.split('.')[1].length > 4) {
          this.price = new BigNumber(this.price).toFixed(4, 1)
        }
        this.setAmountOut()
      },

      onOutChanged(){
        this.setPrice()
      },

      onApprove() {
        let t = this.tokens.find((t) => { return t.symbol == this.tokenIn });
        let token = new Erc20(t.address, t.symbol, t.decimals)
        token.approveMax(this.$store.state.connectedAccount, config.dex, (err, txHash) => {
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
      onPlace() {
        let a = this.tokens.find((t) => { return t.symbol == this.tokenIn });
        let b = this.tokens.find((t) => { return t.symbol == this.tokenOut });
        this.Dex.addLiquidity(this.$store.state.connectedAccount, a, b, this.amountIn, this.amountOut, (err, txHash) => {
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
          this.update()
        }).catch(err => {
          this.$store.commit('updateTxStatus', 'failed')
          this.$store.commit('updateTxDuration', 1000)
          this.$store.commit('updateTxMsgType', 'danger')
          setTimeout(() => {
            this.$store.commit('resetTx')
          }, 2000)
        })
      },
      onRemove(tokenIn, tokenOut, price) {
        this.Dex.removeLiquidity(this.$store.state.connectedAccount, tokenIn, tokenOut, price, (err, txHash) => {
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
          this.update()
        }).catch(err => {
          this.$store.commit('updateTxStatus', 'failed')
          this.$store.commit('updateTxDuration', 1000)
          this.$store.commit('updateTxMsgType', 'danger')
          setTimeout(() => {
            this.$store.commit('resetTx')
          }, 2000)
        })
      },
      onRedeem(tokenIn, tokenOut, price) {
        this.Dex.redeem(this.$store.state.connectedAccount, tokenIn, tokenOut, price, (err, txHash) => {
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
          this.update()
        }).catch(err => {
          this.$store.commit('updateTxStatus', 'failed')
          this.$store.commit('updateTxDuration', 1000)
          this.$store.commit('updateTxMsgType', 'danger')
          setTimeout(() => {
            this.$store.commit('resetTx')
          }, 1000)
        })
      },
      async update() {
        let account = this.$store.state.connectedAccount;
        let a = this.tokens.find(t => { return t.symbol == this.tokenIn });
        let b = this.tokens.find(t => { return t.symbol == this.tokenOut });
        this.sellToken = new Erc20(a.address, a.symbol, a.decimals)
        this.getToken = new Erc20(b.address, b.symbol, b.decimals)
        this.sellTokenAllowance = await this.sellToken.allowance(account, config.dex)
        this.sellTokenApproved = !this.sellTokenAllowance.isZero() && this.sellTokenAllowance.gte(new BigNumber(this.amountIn || 0))
        this.tokenInBalance = await this.sellToken.balanceOf(account);
        this.tokenOutBalance = await this.getToken.balanceOf(account);
        this.depths = await this.Dex.getDepth(a, b)
        this.liquidities = await this.Dex.getAllLiquidities(account, this.sellToken, this.getToken)
      }
    },
    created() {
      // this.debouncedCalcAmountOut = _.debounce(this.calcAmountOut, 500)
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
  .depth {
    margin-top: 5rem;
  }
  .price {
    color: red;
    width: 2rem;
  }
  .amount {
    margin-left: 5rem;
    width: 5rem;
  }

</style>
