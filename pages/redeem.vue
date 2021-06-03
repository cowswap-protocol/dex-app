<template>
  <div>
    <div >
      <div class="columns">
        <div class="column is-4 depth">
          <div class="columns is-gapless mb-0" v-for="depth in depths">
            <div class="column">
              <b>{{ depth[0].toFixed(4) }}</b>
            </div>
            <div class="column">
              {{ depth[1].div(depth[0]) }}
            </div>
          </div>
        </div>
        <div class="column is-4 swap">
          <section class="currency-input">
            <div class="field">
              <label class="has-text-grey">From</label>
              <span class="balance is-pulled-right">Balance: <span class="bal is-clickable">{{tokenInBalance.toFixed(8, 1) }}</span></span>
              <div class="field-body">
                <div class="field has-addons">
                  <b-input type="number" expanded v-model="amountIn"></b-input>
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
              <label class="has-text-grey">Price</label>
              <div class="field-body">
                <div class="field has-addons">
                  <b-input type="number" expanded v-model="price"></b-input>
                </div>
              </div>
            </div>
          </section>

          <section class="currency-input">
            <div class="field">
              <label class="has-text-grey">To</label>
              <span class="balance is-pulled-right">Balance: <span class="bal is-clickable">{{tokenOutBalance.toFixed(8, 1) }}</span></span>
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
                <b-button v-if="!sellTokenApproved" label="Approve" type="is-danger" expanded @click="onApprove" />
                <b-button v-else label="Place" type="is-info" expanded @click="onPlace" />
              </p>
            </b-field>
          </section>

        </div>
        <div class="column is-4"></div>
      </div>
      <div class="mt-4">
        <div class="columns mb-0" v-for="order in orders">
          <div class="column">{{ order.blockNumber }}</div>
          <div class="column">{{ order.user }}</div>
          <div class="column">{{ order.amountIn }}</div>
          <div class="column">{{ order.amountOut }}</div>
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
        sellToken: null,
        sellTokenAllowance: new BigNumber(0),
        sellTokenApproved: true,
        tokenInBalance: new BigNumber(0),
        tokenOutBalance: new BigNumber(0),
        tokenIn: 'USDT',
        tokenOut: 'BUSD',
        amountIn: '',
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
      },
      amountIn: function(val, old) {
        this.sellTokenApproved = this.sellTokenAllowance.gt(BigNumber(this.amountIn || 0))
      }
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

      onApprove() {
        let t = this.tokens.find((t) => { return t.symbol == this.tokenIn });
        let token = new Erc20(t.address, t.symbol, t.decimals)
        token.approveMax(this.$store.state.connectedAccount, config.dex, (err, txHash) => {
          if(txHash) {
            alert("sent")
          }
        }).then(receipt => {
          alert("confirmed")
        }).catch(err => {
          alert('error')
          console.log(err)
        })
      },
      onPlace() {
        let a = this.tokens.find((t) => { return t.symbol == this.tokenIn });
        let b = this.tokens.find((t) => { return t.symbol == this.tokenOut });
        this.Dex.addLiquidity(this.$store.state.connectedAccount, a, b, this.amountIn, this.amountOut, (err, txHash) => {
          if(txHash) {
            alert("onPlace:sent")
          }
        }).then(receipt => {
          alert("onPlace:confirmed")
        }).catch(err => {
          alert("onPlace:err")
          console.log(err)
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
        this.orders = await this.Dex.fetchOrders(account)
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
