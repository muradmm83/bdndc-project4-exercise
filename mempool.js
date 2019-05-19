const bitcoinMessage = require('bitcoinjs-message');

const TimeoutRequestsWindowTime = 5 * 60 * 1000;
const ValidTimeoutRequestsWindowTime = 30 * 60 * 1000;

class Mempool {
    constructor() {
        this.mempool = [];
        this.timeoutRequests = [];
        this.mempoolValid = [];
        this.validTimeoutRequests = [];
    }

    addRequestValidation(address) {
        let self = this;

        if (this.mempool[address]) {

            this.mempool[address] = {
                ...this.mempool[address]
            };

            this.mempool[address].validationWindow = this.verifyTimeLeft(this.mempool[address].requestTimeStamp);

            return this.mempool[address];
        }

        let now = Date.now();

        this.mempool[address] = {
            walletAddress: address,
            requestTimeStamp: now,
            message: `${address}:${now}:starRegistry`,
            validationWindow: this.verifyTimeLeft(now)
        }

        this.timeoutRequests[address] = setTimeout(() => {
            delete self.mempool[address];
        }, TimeoutRequestsWindowTime);

        return this.mempool[address];
    }

    verifyTimeLeft(requestTimeStamp) {

        let timeElapse = (new Date().getTime().toString().slice(0, -3)) - requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime / 1000) - timeElapse;
        return timeLeft;
    }

    validateRequestByWallet(address, signature) {
        if (this.mempoolValid[address]) {
            return this.mempoolValid[address];
        }

        if (this.mempool[address]) {
            let self = this;
            let requestTime = this.mempool[address].requestTimeStamp;

            if (bitcoinMessage.verify(`${address}:${requestTime}:starRegistry`, address, signature)) {
                clearTimeout(this.timeoutRequests[address]);
                delete this.mempool[address];

                this.mempoolValid[address] = {
                    registerStar: true,
                    status: {
                        address: "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
                        requestTimeStamp: "1541605128",
                        message: "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
                        validationWindow: 200,
                        messageSignature: true
                    }
                }

                this.validTimeoutRequests[address] = setTimeout(() => {
                    delete self.mempoolValid[address];
                }, ValidTimeoutRequestsWindowTime);

                return this.mempoolValid[address];
            }
        }

        return false;
    }

    verifyAddressRequest(address) {
        return this.mempoolValid[address];
    }
}

module.exports = Mempool;