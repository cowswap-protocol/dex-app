import Web3 from 'web3'
import { toBN, BN, isBN } from 'web3-utils'
import { MAX_UINT256 } from './constants'
import { BigNumber } from 'bignumber.js'
import config from  '~/config'
const ABI = require('./abis/mock.json');

export class Mock {
	constructor(address, symbol, decimals) {
		this.web3 = new Web3(window.detectProvider);
		this.web3Reader = new Web3(new Web3.providers.HttpProvider(config.web3Provider));
		this.address = address;
		this.contract = new this.web3.eth.Contract(ABI, address)
		this.contractReader = new this.web3Reader.eth.Contract(ABI, address);
		this.defaultGasPrice = 10000000000;
		this.decimals = decimals;
		this.symbol = symbol;
	}

	async gasPrice() {
		return await this.web3.eth.getGasPrice()
	}
	

	async mint(sender, to, amount, callback) {
		let weiAmount = new BigNumber(amount).shiftedBy(this.decimals)
	  var gasPrice = await this.gasPrice();
	  var tx = this.contract.methods.mint(to, toBN(weiAmount));
	  var gasLimit = await tx.estimateGas({ value: 0, from: sender, to: this.address });
	  return tx.send({
	    from: sender,
	    gasPrice: gasPrice,
	    gas: Math.round(gasLimit * 1.1)
	  }, callback);
	}
}

export default Mock;