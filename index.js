import * as fs from 'fs';
import * as path from 'path';
import { createDB } from "./database.js";
import { runEth } from './autoEth.js';
import { indexAddress } from './config.js';
import { ethers } from 'ethers';
import { runBase } from './autoBase.js';
import { runOpt } from './autoOptimism.js';
import { runArb } from './autoArbitrum.js';
import { runAvax } from './autoAvax.js';
import { runFtm } from './autoFtm.js';
import { runMatic } from './autoMatic.js';
import { runBnb } from './autoBnb.js';

function run() {
    createDB();
    parseSeeds();
    // runEth();
    runBase();
    // runArb();
    // runAvax();
    // runFtm();
    // runOpt();
    // runMatic();
    // runBnb();
}

function parseSeeds() {
    const allFiles = fs.readdirSync('./wallets');
    const txtFiles = allFiles.filter(file => path.extname(file) === '.txt');
    const countSeeds = {
        addedSeeds: 0,
        compareSeeds: 0,
    }
    console.log(`Total found: ${txtFiles.length} .txt files`);

    txtFiles.map(file => {
        const content = fs.readFileSync(path.join('./wallets', file), 'utf-8').split('\r\n');
        const data = JSON.parse(fs.readFileSync(path.join('./DB', 'database.json')));

        for (let line of content) {
            let isMnemonic = true;
            if (!([12, 15, 18, 21, 24].includes(line.split(' ').length)) || !(line.split(' ').some(word => isNaN(word)))) {
                isMnemonic = false;
            }
            if (line.slice(0,2) !== '0x' && !isMnemonic) {
                line = '0x' + line;
            }
            if (line.length !== 66 && !isMnemonic) {
                continue;
            }

            if (isMnemonic) {
                for (let i = 0; i < indexAddress + 1; i++) {
                    const info = seedConvert(line, i);
                    writeData(info, countSeeds, data);
                }   
            } else {
                const info = keyConvert(line);
                writeData(info, countSeeds, data);
            }
        }
        fs.writeFileSync(path.join('./DB', 'database.json'), JSON.stringify(data));
    });


}

function seedConvert(line, index) {
    const mnemonicInstance = ethers.Mnemonic.fromPhrase(line);
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonicInstance, `m/44'/60'/0'/0/${index}`);
    return [wallet.address.toLowerCase(), wallet.privateKey];
}

function keyConvert(line) {
    const wallet = new ethers.Wallet(line);
    return [wallet.address.toLowerCase(), line];
}

function writeData(info, countSeeds, data) {
    if (!info) {
        return;
    }
    if (data[info[0]]) {
        countSeeds.compareSeeds += 1;
        console.log(`Total compare: ${countSeeds.compareSeeds}`)
        return;
    }
    data[info[0]] = info[1];
    countSeeds.addedSeeds += 1;
    console.log(`Total added: ${countSeeds.addedSeeds}`)
}

run();