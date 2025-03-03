export const mainAddress = "0x655950EE5B08086EE838d865FCc140aa2F1D102C";

export const indexAddress = 0; // Индексы получаемых адресов с фразы (например: если указан 0, тогда 1 адрес, если указано 1, тогда 2 адреса 0-1 индексы

// RPC nodes
export const rpc = {
  ETH: "wss://rpc.pulsechain.com", //wss протокол
  BASE: "wss://base-rpc.publicnode.com", //wss протокол
  FTM: "wss://fantom-rpc.publicnode.com", //wss протокол
  AVAX: "wss://avalanche-c-chain-rpc.publicnode.com", //wss протокол
  ARB: "wss://arbitrum-one.publicnode.com", //wss протокол
  OPT: "wss://optimism.drpc.org", //wss протокол
  MATIC: "https://polygon-pokt.nodies.app", //HTTP протокол
  BNB: "https://bsc-pokt.nodies.app", //HTTP протокол
};

export const grab = {
  ETH: "0.0001",
  BASE: "0.000001",
  FTM: "0.0001",
  AVAX: "0.0001",
  ARB: "0.0001",
  OPT: "0.0001",
  MATIC: "0.0001",
  BNB: "0.0001",
};

// Mode of working:
// 0 (default) - Это автоматические настройки gas_limit, gas_price для транзакции, низкая вероятность обхода других авто-выводов / it`s auto settings gas_limit, gas_price for TX, low chance for bypass other auto-withdrawals
// 1 - Это использование процентных настроек gas с вычитанием заданного процента из баланса, хороший шанс обхода других авто-выводов / it`s use of percentage settings gas with a deduction from balance, good chance for bypass other auto-withdrawals
export const mode = 0;

// Процент использования газа от баланса
export const gasPercentEth = 1;
export const gasPercentFtm = 1;
export const gasPercentAvax = 1;
export const gasPercentMatic = 1;
export const gasPercentBnb = 1;
