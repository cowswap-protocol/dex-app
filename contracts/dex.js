import Web3 from 'web3'
import { toBN, BN, isBN } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
// import { axios } from "axios"
const axios = require('axios');

BigNumber.set({ DECIMAL_PLACES: 18 })
import config from  '~/config'
const ABI = require('./abis/dex.json');

export class Dex {

	constructor(address) {
		this.web3 = new Web3(window.detectProvider);
		this.batch = new this.web3.BatchRequest();
		this.web3Reader = new Web3(new Web3.providers.HttpProvider(config.web3Provider));
		this.address = address;
		this.contract = new this.web3.eth.Contract(ABI, address);
		this.contractReader = new this.web3Reader.eth.Contract(ABI, address);
		this.defaultGasPrice = 5000000000;
	}

	async gasPrice() {
		return await this.web3.eth.getGasPrice()
	}
	
	async addLiquidity(sender, tokenIn, tokenOut, amountIn, amountOut, callback) {
		amountIn = new BigNumber(amountIn).shiftedBy(tokenIn.decimals)
		amountOut = new BigNumber(amountOut).shiftedBy(tokenOut.decimals)
		var gasPrice = await this.gasPrice();
		var tx = this.contract.methods.addLiquidity(tokenIn.address, tokenOut.address, toBN(amountIn), toBN(amountOut));
	  let gasLimit = await tx.estimateGas({ value: 0, from: sender, to: this.address });
	  return tx.send({
	  	value: 0,
	    from: sender,
	    gasPrice: gasPrice,
	    gas: Math.round(gasLimit * 1.1)
	  }, callback);
	}

	async removeLiquidity(sender, tokenIn, tokenOut, price, callback) {
		var gasPrice = await this.gasPrice();
		var tx = this.contract.methods.removeLiquidity(tokenIn.address, tokenOut.address, toBN(price));
	  let gasLimit = await tx.estimateGas({ value: 0, from: sender, to: this.address });
	  return tx.send({
	  	value: 0,
	    from: sender,
	    gasPrice: gasPrice,
	    gas: Math.round(gasLimit * 1.1)
	  }, callback);
	}

	async redeem(sender, tokenIn, tokenOut, price, callback) {
		var gasPrice = await this.gasPrice();
		var tx = this.contract.methods.redeem(tokenIn.address, tokenOut.address, toBN(price));
	  let gasLimit = await tx.estimateGas({ value: 0, from: sender, to: this.address });
	  return tx.send({
	  	value: 0,
	    from: sender,
	    gasPrice: gasPrice,
	    gas: Math.round(gasLimit * 1.1)
	  }, callback);
	}

	async getDepth(tokenIn, tokenOut) {
		let depths = await this.contractReader.methods.getDepth(tokenIn.address, tokenOut.address).call();
		depths = depths.filter(d => BigNumber(d.amount).gt(0))
		               .map(d => [ BigNumber(d.price).shiftedBy(-8), BigNumber(d.amount).shiftedBy(-tokenOut.decimals) ] )
		return depths.sort((x, y) => -1)
	}

	async getFilled(sender, tokenIn, tokenOut, price) {
		let data = await this.contractReader.methods.getFilled(sender, tokenIn.address, tokenOut.address, price).call();
		return data
	}

	async getAllLiquidities(sender, tokenIn, tokenOut) {
		let liquids = await this.contractReader.methods.getAllLiquidities(sender, tokenIn.address, tokenOut.address).call();

		return liquids.map(l => {
			return {
				"price": new BigNumber(l.price).shiftedBy(-8),
				"rawPrice": l.price,
				"filled": BigNumber(l.filled).shiftedBy(-tokenOut.decimals),
				"feeRewarded": BigNumber(l.feeRewarded).shiftedBy(-tokenOut.decimals),
				"pending": BigNumber(l.pending).shiftedBy(-tokenOut.decimals),
				"tokenOut": tokenOut,
				"tokenIn": tokenIn
			}
		}).filter(l => l.pending.gt(0) || l.filled.gt(0))
	}

	async fetchOrders(sender, tokenIn, tokenOut) {
		let filter = { sender: sender }
		if(tokenIn) {
			filter['tokenIn'] = tokenIn.address
		}
		if(tokenOut) {
			filter['tokenOut'] = tokenOut.address
		}
		let events = await this.contract.getPastEvents('AddLiquidity', { filter: filter, fromBlock: 0 })
		let logs = events.reverse()

		if(logs.length == 0) return [];

		let orders = logs.map(event => {
			let data = event.returnValues
			return {
				"date": data.date,
				"user": data.sender,
				"tokenIn": data.tokenIn,
				"tokenOut": data.tokenOut,
				"price": new BigNumber(data.price).shiftedBy(-8),
				"rawPrice": data.price,
				"amountIn": new BigNumber(data.amountIn).shiftedBy(-tokenIn.decimals)
			}
		});



		let calls = logs.map((event, index) => {
			let data = event.returnValues;
			let call = this.contract.methods.getLiquidity(data.sender, data.tokenIn, data.tokenOut, data.price).encodeABI();
			return { "jsonrpc": "2.0",
				"id": index + 1,
				"method": "eth_call",
				"params":[
					{
						"data": call, 
						"to": this.address
					},
					"latest"
				]
			}
		})

		let res = await axios.post(config.web3Provider, calls)

		
		let results = res.data.map(d => {
			return this.web3.eth.abi.decodeParameters([
				{ type: "uint256", name: "feeReawarded" },
				{ type: "uint256", name: "filled" },
				{ type: "uint256", name: "pending" },
			], d.result)
		})


		for(var i = 0; i < orders.length; i++) {
			orders[i]['filled'] = BigNumber(results[i].filled).shiftedBy(-tokenOut.decimals)
			orders[i]['feeRewarded'] = BigNumber(results[i].feeReawarded).shiftedBy(-tokenOut.decimals)
			orders[i]['pending'] = BigNumber(results[i].pending).shiftedBy(-tokenOut.decimals)
		}

		// orders.map((o, i) => {
		// 	o['filled'] = BigNumber(results[i].filled).shiftedBy(-tokenOut.decimals)
		// 	o['feeRewarded'] = BigNumber(results[i].feeReawarded).shiftedBy(-tokenOut.decimals)
		// 	o['pending'] = BigNumber(results[i].pending).shiftedBy(-tokenOut.decimals)
		// })

		return orders//.filter(o => o.pending.gt(0))
	}

	async logs(user) {
		let events = await this.contract.getPastEvents('Position', { filter: { user: user }, fromBlock: 0 })
		return events.reverse().map(event => {
			let data = event.returnValues
			let r0 = new BigNumber(data.reserve0);
			let r1 = new BigNumber(data.reserve1);
			let info = this.tokenInfo(data.token)
			return {
				"blockNumber": event.blockNumber,
				"user": data.user,
				"token": info.symbol,
				"side": data.side == "0" ? "Open" : "Close",
				"shares": new BigNumber(data.shares).shiftedBy(-info.decimals),
				"amount": new BigNumber(data.amount).shiftedBy(-info.decimals),
				"price01": r0.div(r1),
				"price10": r1.div(r0)
			}
		});
	}
}

export default Dex;