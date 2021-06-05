import Web3 from 'web3'
import { toBN, BN, isBN } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
BigNumber.set({ DECIMAL_PLACES: 18 })
import config from  '~/config'
const ABI = require('./abis/router.json');

export class Router {

	constructor(address) {
		this.web3 = new Web3(window.detectProvider);
		this.web3Reader = new Web3(new Web3.providers.HttpProvider(config.web3Provider));
		this.address = address;
		this.contract = new this.web3.eth.Contract(ABI, address);
		this.contractReader = new this.web3Reader.eth.Contract(ABI, address);
		this.defaultGasPrice = 5000000000;
	}

	async gasPrice() {
		return await this.web3.eth.getGasPrice()
	}

	async swapExactTokensForTokens(sender, amountIn, amountOutMin, tokenPath, callback) {
		amountIn = new BigNumber(amountIn).shiftedBy(tokenPath[0].decimals)
		amountOutMin = new BigNumber(amountOutMin).shiftedBy(tokenPath[tokenPath.length - 1].decimals)
		let path = tokenPath.map(t => t.address)
		let deadline = parseInt(new Date().getTime() / 1000 + 10 * 60)
		var gasPrice = await this.gasPrice();
		var tx = this.contract.methods.swapExactTokensForTokens(toBN(amountIn), toBN(amountOutMin), path, sender, deadline);
	  let gasLimit = await tx.estimateGas({ value: 0, from: sender, to: this.address });
	  
	  return tx.send({
	  	value: 0,
	    from: sender,
	    gasPrice: gasPrice,
	    gas: Math.round(gasLimit * 1.1)
	  }, callback);
	}

	async swapTokensForExactTokens(sender, amountOut, amountInMax, path, deadline) {
		var gasPrice = await this.gasPrice();
		var tx = this.contract.methods.swapTokensForExactTokens(toBN(amountOut), toBN(amountInMax), path, sender, deadline);
	  let gasLimit = await tx.estimateGas({ value: 0, from: sender, to: this.address });
	  return tx.send({
	  	value: 0,
	    from: sender,
	    gasPrice: gasPrice,
	    gas: Math.round(gasLimit * 1.1)
	  }, callback);
	}
	async getAmountsOut(amountIn, tokenPath) {
		amountIn = new BigNumber(amountIn).shiftedBy(tokenPath[0].decimals)
		let path = tokenPath.map(t => t.address)
		let amounts = await this.contractReader.methods.getAmountsOut(toBN(amountIn), path).call();
		return amounts.map((a, i) => BigNumber(a).shiftedBy(-tokenPath[i].decimals))
	}
	async getAmountsIn(amountOut, tokenPath) {
		amountOut = new BigNumber(amountOut).shiftedBy(tokenPath[0].decimals)
		let path = tokenPath.map(t => t.address)
		let amounts = await this.contractReader.methods.getAmountsOut(toBN(amountOut), path).call();
		return amounts.map((a, i) => BigNumber(a).shiftedBy(-tokenPath[i].decimals))
	}
}

export default Router;