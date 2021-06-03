
export const state = () => ({
	locale: 'en',
	connectedAccount: '',
	chainId: '',
	isMathWallet: false,
	tx: {
		hash: '',
		status: '',
		duration: 0,
		msgType: 'info'
	}
});

export const mutations = {
	updateLang(state, locale) {
		state.locale = locale
		window.localStorage.language = JSON.stringify(locale);
	},
	updateConnectedAccount(state, account) {
		state.connectedAccount = account
	},
	updateChainId(state, chainId) {
		state.chainId = chainId
	},
	checkWallet(state, b) {
		state.isMathWallet = b
	},
	updateTx(state, tx) {
		state.tx = tx;
	},
	updateTxStatus(state, status) {
		state.tx.status = status
	},
	updateTxDuration(state, duration) {
		state.tx.duration = duration
	},
	updateTxMsgType(state, typ) {
		state.tx.msgType = typ
	},
	resetTx(state) {
		state.tx = {
			hash: '',
			status: '',
			duration: 0,
			msgType: 'info'
		}
	}
};
