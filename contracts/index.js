import Erc20 from './erc20';
import Erc20Reader from './erc20_reader';
import Dex from './dex';
import Router from './router';

import config from  '~/config'
import Web3 from 'web3'
const web3Reader = new Web3(new Web3.providers.HttpProvider(config.web3Provider));
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

export {
	Erc20,
	ZERO_ADDR,
	web3Reader,
	Erc20Reader,
	Dex,
	Router,
}