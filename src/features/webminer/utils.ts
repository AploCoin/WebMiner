import Web3 from "web3";
import { MAX_UINT256 } from "./config";

export const validateRpcUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const validatePrivateKey = (key: string): boolean => {
  // Проверяем ключ с префиксом 0x (66 символов) или без него (64 символа)
  return /^(0x)?[0-9a-fA-F]{64}$/.test(key);
};

export const getAddressFromPrivateKey = (privateKey: string): string => {
  try {
    // Добавляем префикс 0x если его нет
    const formattedKey = formatPrivateKey(privateKey);
    // Создаем аккаунт из приватного ключа
    const account = new Web3().eth.accounts.privateKeyToAccount(formattedKey);
    return account.address;
  } catch (error) {
    return '';
  }
};

export const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0 GAPLO';
  
  const absNum = Math.abs(num);
  if (absNum < 1000) return `${num.toFixed(2)} GAPLO`;
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(absNum) / 3);
  const shortValue = (num / Math.pow(1000, suffixNum));
  
  return `${shortValue.toFixed(2)}${suffixes[suffixNum]} GAPLO`;
};

export const formatAplo = (balance: string): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return "0 APLO";

  const absNum = Math.abs(num);
  if (absNum < 1000) return `${num.toFixed(2)} APLO`;

  const suffixes = ["", "K", "M", "B", "T"];
  const suffixNum = Math.min(
    Math.floor(Math.log10(absNum) / 3),
    suffixes.length - 1
  );
  const shortValue = num / Math.pow(1000, suffixNum);

  return `${shortValue.toFixed(2)}${suffixes[suffixNum]} APLO`;
};

export const formatPrivateKey = (key: string): string =>
  key.startsWith("0x") ? key : `0x${key}`;

export const isValidStakeAmount = (amount: string): boolean =>
  /^(?:\d+|\d*\.\d+)$/.test(amount.trim()) && Number(amount) > 0;

export const formatMiningDifficulty = (difficulty: bigint): string => {
  const normalized = difficulty <= MAX_UINT256 ? MAX_UINT256 - difficulty : BigInt(0);
  return normalized.toString();
};


export const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};
