"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlayCircle, StopCircle } from "lucide-react";
import Web3 from "web3";
import type { Contract } from "web3-eth-contract";
import { useToast } from "@/hooks/use-toast";
import type { ContractAbi } from "web3";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ThemeSwitcher } from "./ThemeSwitcher";

const PRESET_RPC_NODES = [
  { label: "Pub1", url: "https://pub1.aplocoin.com" },
  { label: "Pub2", url: "https://pub2.aplocoin.com" },
  { label: "Custom", url: "" },
];

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000001234";
const APLO_STAKING_ADDRESS = "0x0000000000000000000000000000000000001235";
const MIN_STAKE_APLO = "1000";
const MIN_STAKE_WEI = BigInt("1000000000000000000000");

const APLO_STAKING_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "getStake",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "getMultiplier",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const CONTRACT_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "miner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "nonce",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "prev_hash",
        type: "uint256",
      },
    ],
    name: "Mined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "BLOCK_REWARD",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_DIFFICULTY",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINE_SELECTOR",
    outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "nonce", type: "bytes32" }],
    name: "mine",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "miner_params",
    outputs: [
      { internalType: "uint256", name: "last_block", type: "uint256" },
      { internalType: "uint256", name: "current_difficulty", type: "uint256" },
      { internalType: "uint256", name: "total_mined", type: "uint256" },
      { internalType: "uint256", name: "prev_hash", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "refund",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
    name: "takeFee",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
]; // Add your contract ABI here

const DEFAULT_DIFFICULTY = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

interface MinerParams {
  lastBlock: number;
  currentDifficulty: bigint;
  totalMined: number;
  prevHash: bigint;
}

interface MinedShare {
  blockNumber: number;
  txHash: string;
  timestamp: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const validateRpcUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const validatePrivateKey = (key: string): boolean => {
  // Проверяем ключ с префиксом 0x (66 символов) или без него (64 символа)
  return /^(0x)?[0-9a-fA-F]{64}$/.test(key);
};

const getAddressFromPrivateKey = (privateKey: string): string => {
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

const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0 GAPLO';
  
  const absNum = Math.abs(num);
  if (absNum < 1000) return `${num.toFixed(2)} GAPLO`;
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(absNum) / 3);
  const shortValue = (num / Math.pow(1000, suffixNum));
  
  return `${shortValue.toFixed(2)}${suffixes[suffixNum]} GAPLO`;
};

const formatAplo = (balance: string): string => {
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

const formatPrivateKey = (key: string): string =>
  key.startsWith("0x") ? key : `0x${key}`;

const isValidStakeAmount = (amount: string): boolean =>
  /^(?:\d+|\d*\.\d+)$/.test(amount.trim()) && Number(amount) > 0;

const WebMiner: React.FC = () => {
  const { toast } = useToast();

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [isMining, setIsMining] = useState<boolean>(false);
  const [minedShares, setMinedShares] = useState<MinedShare[]>([]);
  const [minerStats, setMinerStats] = useState<{
    difficulty: string;
    totalMined: number;
    balance: string;
  }>({
    difficulty: DEFAULT_DIFFICULTY.toString(),
    totalMined: 0,
    balance: "0",
  });

  const [stakeStats, setStakeStats] = useState<{
    staked: string;
    multiplier: number;
    canMine: boolean;
  }>({
    staked: "0",
    multiplier: 0,
    canMine: false,
  });
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [stakeAmount, setStakeAmount] = useState<string>(MIN_STAKE_APLO);

  // RPC Node selection state
  const [selectedNodeType, setSelectedNodeType] = useState<string>("pub1");
  const [customRpcUrl, setCustomRpcUrl] = useState<string>("");
  const [currentRpcUrl, setCurrentRpcUrl] = useState<string>(PRESET_RPC_NODES[0].url);

  // Refs
  const miningRef = useRef<boolean>(false);
  const miningProcessRef = useRef<boolean>(false);
  const web3Ref = useRef<Web3 | null>(null);
  const contractRef = useRef<Contract<ContractAbi> | null>(null);
  const stakingContractRef = useRef<Contract<ContractAbi> | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved RPC settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNodeType = localStorage.getItem("rpcNodeType");
      const savedCustomUrl = localStorage.getItem("customRpcUrl");

      if (savedNodeType) {
        setSelectedNodeType(savedNodeType);
      }
      if (savedCustomUrl) {
        setCustomRpcUrl(savedCustomUrl);
      }

      // Set initial RPC URL based on saved settings
      if (savedNodeType === "custom" && savedCustomUrl) {
        setCurrentRpcUrl(savedCustomUrl);
      } else if (savedNodeType === "pub2") {
        setCurrentRpcUrl(PRESET_RPC_NODES[1].url);
      } else {
        setCurrentRpcUrl(PRESET_RPC_NODES[0].url);
      }
    }
  }, []);

  // Initialize Web3 with current RPC URL
  const initializeWeb3 = (rpcUrl: string) => {
    const web3Instance = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    web3Ref.current = web3Instance;
    contractRef.current = new web3Instance.eth.Contract(
      CONTRACT_ABI as any,
      CONTRACT_ADDRESS
    );
    stakingContractRef.current = new web3Instance.eth.Contract(
      APLO_STAKING_ABI as any,
      APLO_STAKING_ADDRESS
    );
  };

  useEffect(() => {
    if (currentRpcUrl) {
      initializeWeb3(currentRpcUrl);
    }
  }, [currentRpcUrl]);

  const getMinerParams = async (address: string): Promise<MinerParams> => {
    if (!contractRef.current) throw new Error("Contract not initialized");
    const params = (await contractRef.current.methods
      .miner_params(address)
      .call()) as any[];
    return {
      lastBlock: parseInt(params[0]),
      currentDifficulty:
        params[1] === "0" ? DEFAULT_DIFFICULTY : BigInt(params[1]),
      totalMined: parseInt(params[2]),
      prevHash: BigInt(params[3]),
    };
  };

  const generateNonce = (): bigint => {
    return BigInt(
      "0x" +
        [...Array(64)]
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")
    );
  };

  const hashNonce = (
    nonce: bigint,
    sender: string,
    difficulty: bigint,
    prevHash: bigint,
    totalMined: number
  ): bigint => {
    if (!web3Ref.current) throw new Error("web3 not initialized");
    const web3 = web3Ref.current;
    const packedData = web3.utils.encodePacked(
      { value: sender, type: "address" },
      {
        value: web3.utils.padLeft(web3.utils.toHex(nonce), 64),
        type: "bytes32",
      },
      { value: difficulty.toString(), type: "uint256" },
      { value: prevHash.toString(), type: "uint256" },
      { value: totalMined.toString(), type: "uint256" }
    );
    const hash = web3.utils.sha3(packedData);
    if (!hash) throw new Error("Failed to compute hash");
    return BigInt("0x" + hash.slice(2));
  };

  const mineBlock = async (
    minerParams: MinerParams
  ): Promise<bigint | undefined> => {
    while (miningRef.current) {
      const nonce = generateNonce();
      const hashResult = hashNonce(
        nonce,
        walletAddress,
        minerParams.currentDifficulty,
        minerParams.prevHash,
        minerParams.totalMined
      );

      if (hashResult < minerParams.currentDifficulty) {
        if (!web3Ref.current) break;
        minerParams.totalMined++;
        minerParams.lastBlock = Number(
          await web3Ref.current.eth.getBlockNumber()
        );
        minerParams.prevHash = hashResult;
        return nonce;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return undefined;
  };

  // Отправка транзакции
  const sendMineTransaction = async (nonce: bigint) => {
    if (!web3Ref.current || !contractRef.current)
      throw new Error("Not initialized");
    const web3 = web3Ref.current;
    const nonceHex = web3.utils.padLeft(web3.utils.toHex(nonce), 64);
    const transaction = contractRef.current.methods.mine(nonceHex);

    const gasEstimate = await transaction.estimateGas({ from: walletAddress });
    const gasPrice = await web3.eth.getGasPrice();
    const latestNonce = await web3.eth.getTransactionCount(
      walletAddress,
      "pending"
    );

    const txData = {
      from: walletAddress,
      to: CONTRACT_ADDRESS,
      data: transaction.encodeABI(),
      gas: Number(gasEstimate) + 1000,
      gasPrice: gasPrice,
      nonce: latestNonce,
    };

    // Добавляем 0x к приватному ключу, если его нет
    const formattedPrivateKey = formatPrivateKey(privateKey);
    const signedTx = await web3.eth.accounts.signTransaction(
      txData,
      formattedPrivateKey
    );
    if (!signedTx.rawTransaction)
      throw new Error("Failed to sign transaction");
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  };

  const getStakeStatus = async () => {
    if (!web3Ref.current || !stakingContractRef.current || !walletAddress) {
      return { stakedWei: BigInt(0), staked: "0", multiplier: 0, canMine: false };
    }

    const web3 = web3Ref.current;
    const [stakedRaw, multiplierRaw] = await Promise.all([
      stakingContractRef.current.methods.getStake(walletAddress).call(),
      stakingContractRef.current.methods.getMultiplier(walletAddress).call(),
    ]);

    const stakedWei = BigInt(stakedRaw?.toString() ?? "0");
    const multiplierScaled = Number(multiplierRaw?.toString() ?? "0");
    const status = {
      stakedWei,
      staked: web3.utils.fromWei(stakedWei.toString(), "ether"),
      multiplier: multiplierScaled / 10,
      canMine: stakedWei >= MIN_STAKE_WEI,
    };

    setStakeStats({
      staked: status.staked,
      multiplier: status.multiplier,
      canMine: status.canMine,
    });

    return status;
  };

  const sendStakeTransaction = async (amountWei: bigint) => {
    if (!web3Ref.current || !stakingContractRef.current)
      throw new Error("Staking contract not initialized");

    const web3 = web3Ref.current;
    const transaction = stakingContractRef.current.methods.stake(amountWei.toString());
    const gasEstimate = await transaction.estimateGas({ from: walletAddress });
    const gasPrice = await web3.eth.getGasPrice();
    const latestNonce = await web3.eth.getTransactionCount(
      walletAddress,
      "pending"
    );

    const txData = {
      from: walletAddress,
      to: APLO_STAKING_ADDRESS,
      data: transaction.encodeABI(),
      gas: Number(gasEstimate) + 10000,
      gasPrice,
      nonce: latestNonce,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      txData,
      formatPrivateKey(privateKey)
    );
    if (!signedTx.rawTransaction)
      throw new Error("Failed to sign staking transaction");

    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  };

  const ensureMinimumStake = async () => {
    const status = await getStakeStatus();
    if (status.canMine) return status;

    const missingStakeWei = MIN_STAKE_WEI - status.stakedWei;
    const missingStakeAplo = web3Ref.current!.utils.fromWei(
      missingStakeWei.toString(),
      "ether"
    );

    setIsStaking(true);
    try {
      toast({
        title: "Starting staking",
        description: `Staking ${missingStakeAplo} APLO before mining`,
      });
      await sendStakeTransaction(missingStakeWei);
      const updatedStatus = await getStakeStatus();
      if (!updatedStatus.canMine) {
        throw new Error(
          `Stake is still below ${MIN_STAKE_APLO} APLO. Current stake: ${updatedStatus.staked} APLO`
        );
      }

      toast({
        title: "Stake confirmed",
        description: `Current multiplier: ${updatedStatus.multiplier.toFixed(1)}x`,
      });
      await updateMinerStats();
      return updatedStatus;
    } finally {
      setIsStaking(false);
    }
  };

  const handleStake = async () => {
    if (!walletAddress) {
      toast({
        variant: "destructive",
        title: "No Wallet Address",
        description: "Please enter a valid private key first",
      });
      return;
    }

    if (!privateKey || !validatePrivateKey(privateKey)) {
      toast({
        variant: "destructive",
        title: "Invalid Private Key",
        description: "Private key must contain 64 hex characters with or without 0x prefix",
      });
      return;
    }

    if (!currentRpcUrl || !validateRpcUrl(currentRpcUrl)) {
      toast({
        variant: "destructive",
        title: "Invalid RPC URL",
        description: "Please select a valid RPC node before staking",
      });
      return;
    }

    if (!web3Ref.current) {
      toast({
        variant: "destructive",
        title: "Web3 Error",
        description: "Web3 is not initialized yet",
      });
      return;
    }

    const normalizedAmount = stakeAmount.trim().replace(",", ".");
    if (!isValidStakeAmount(normalizedAmount)) {
      toast({
        variant: "destructive",
        title: "Invalid Stake Amount",
        description: "Enter a positive APLO amount to stake",
      });
      return;
    }

    setIsStaking(true);
    try {
      const amountWei = BigInt(web3Ref.current.utils.toWei(normalizedAmount, "ether"));

      toast({
        title: "Starting staking",
        description: `Staking ${normalizedAmount} APLO`,
      });

      await sendStakeTransaction(amountWei);
      const updatedStatus = await getStakeStatus();
      await updateMinerStats();

      toast({
        title: "Stake confirmed",
        description: `Current stake: ${formatAplo(updatedStatus.staked)} · Multiplier: ${updatedStatus.multiplier.toFixed(1)}x`,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during staking.";
      toast({
        variant: "destructive",
        title: "Staking Error",
        description: message,
      });
    } finally {
      setIsStaking(false);
    }
  };

  const updateMinerStats = async () => {
    if (!walletAddress || !web3Ref.current) return;

    const balance = await web3Ref.current.eth.getBalance(walletAddress);
    setMinerStats((prev) => ({
      ...prev,
      balance: web3Ref.current!.utils.fromWei(balance, "ether"),
    }));

    await getStakeStatus();
  };

  const mine = async () => {
    // Проверяем, не запущен ли уже процесс майнинга
    if (miningProcessRef.current) {
      return;
    }
    
    miningProcessRef.current = true;
    
    try {
      while (miningRef.current) {
        try {
          const minerParams = await getMinerParams(walletAddress);
          // Обновить статистику
          setMinerStats((prev) => ({
            difficulty: minerParams.currentDifficulty.toString(),
            totalMined: minerParams.totalMined,
            balance: prev.balance,
          }));

          if (!web3Ref.current) {
            break;
          }
          
          // Проверяем задержку по блокам
          const currentBlock = await web3Ref.current.eth.getBlockNumber();
          if (BigInt(currentBlock) - BigInt(minerParams.lastBlock) < BigInt(20)) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
            continue;
          }

          // Майн и отправляем транзакцию
          const nonce = await mineBlock(minerParams);
          if (!nonce || !miningRef.current) break;

          const receipt = await sendMineTransaction(nonce);

          setMinedShares((prev) => [
            {
              blockNumber: Number(receipt.blockNumber),
              txHash: receipt.transactionHash.toString(),
              timestamp: new Date().toLocaleString(),
            },
            ...prev,
          ]);

          // Обновляем статистику после успешного майнинга
          await updateMinerStats();
          const updatedParams = await getMinerParams(walletAddress);
          setMinerStats((prev) => ({
            ...prev,
            difficulty: updatedParams.currentDifficulty.toString(),
            totalMined: updatedParams.totalMined,
          }));

        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "An unknown error occurred during mining.";
          console.error("Mining error:", message);
          toast({
            variant: "destructive",
            title: "Mining Error",
            description: message,
          });
          if (miningRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }
    } finally {
      miningProcessRef.current = false;
    }
  };

  const toggleMining = async () => {
    if (!isMining) {
      if (!walletAddress) {
        toast({
          variant: "destructive",
          title: "No Wallet Address",
          description: "Please enter a wallet address",
        });
        return;
      }
      if (!privateKey) {
        toast({
          variant: "destructive",
          title: "No Private Key",
          description: "Please enter a private key",
        });
        return;
      }
      if (!validatePrivateKey(privateKey)) {
        toast({
          variant: "destructive",
          title: "Invalid Private Key",
          description: "Private key must contain 64 hex characters with or without 0x prefix",
        });
        return;
      }

      // Validate RPC URL before mining
      if (!currentRpcUrl || !validateRpcUrl(currentRpcUrl)) {
        toast({
          variant: "destructive",
          title: "Invalid RPC URL",
          description: "Please select a valid RPC node",
        });
        return;
      }

      try {
        await ensureMinimumStake();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "An unknown error occurred during staking.";
        toast({
          variant: "destructive",
          title: "Staking Error",
          description: message,
        });
        return;
      }

      setIsMining(true);
      miningRef.current = true;
      // Запускаем обновление статистики
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      statsIntervalRef.current = setInterval(updateMinerStats, 30000);
      mine();
    } else {
      setIsMining(false);
      miningRef.current = false;
      // Останавливаем обновление статистики
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
    }
  };

  // Handle RPC node change
  const handleNodeChange = (nodeType: string) => {
    // Stop mining if active
    if (isMining) {
      setIsMining(false);
      miningRef.current = false;
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
      toast({
        title: "Mining Stopped",
        description: "Mining stopped due to RPC node change",
      });
    }

    setSelectedNodeType(nodeType);
    localStorage.setItem("rpcNodeType", nodeType);

    let newRpcUrl = "";
    if (nodeType === "pub1") {
      newRpcUrl = PRESET_RPC_NODES[0].url;
    } else if (nodeType === "pub2") {
      newRpcUrl = PRESET_RPC_NODES[1].url;
    } else if (nodeType === "custom") {
      newRpcUrl = customRpcUrl;
      if (!newRpcUrl || !validateRpcUrl(newRpcUrl)) {
        toast({
          variant: "destructive",
          title: "Invalid Custom RPC URL",
          description: "Please enter a valid HTTP/HTTPS URL",
        });
        return;
      }
    }

    setCurrentRpcUrl(newRpcUrl);
  };

  const handleCustomRpcChange = (url: string) => {
    setCustomRpcUrl(url);
    localStorage.setItem("customRpcUrl", url);

    if (selectedNodeType === "custom") {
      if (validateRpcUrl(url)) {
        setCurrentRpcUrl(url);
      }
    }
  };

  useEffect(() => {
    if (!walletAddress) {
      setStakeStats({ staked: "0", multiplier: 0, canMine: false });
      setMinerStats((prev) => ({ ...prev, balance: "0" }));
      return;
    }

    updateMinerStats().catch((error) => {
      console.error("Failed to update miner stats:", error);
    });
  }, [walletAddress]);

  // Очистка интервала при размонтировании компонента
  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, []);

  // Определим столбцы для minedShares
  const columns: ColumnDef<MinedShare>[] = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
    },
    {
      accessorKey: "blockNumber",
      header: "Block Number",
      cell: ({ row }) => {
        const val = row.getValue<number>("blockNumber");
        return <div>{val}</div>;
      },
    },
    {
      accessorKey: "txHash",
      header: "Transaction Hash",
      cell: ({ row }) => {
        const value = row.getValue<string>("txHash");
        return <div className="break-all">{value}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: minedShares,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isRpcReady = Boolean(currentRpcUrl && validateRpcUrl(currentRpcUrl));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex flex-row justify-between"><span>GAplo Web Miner</span> <ThemeSwitcher/></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* RPC Node Selection */}
          <div className="space-y-3 rounded-md border p-4 bg-muted/50">
            <Label className="text-sm font-medium">RPC Node</Label>
            <RadioGroup value={selectedNodeType} onValueChange={handleNodeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pub1" id="pub1" disabled={isMining} />
                <Label htmlFor="pub1" className="font-normal cursor-pointer">
                  Pub1 (https://pub1.aplocoin.com)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pub2" id="pub2" disabled={isMining} />
                <Label htmlFor="pub2" className="font-normal cursor-pointer">
                  Pub2 (https://pub2.aplocoin.com)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" disabled={isMining} />
                <Label htmlFor="custom" className="font-normal cursor-pointer">
                  Custom RPC URL
                </Label>
              </div>
            </RadioGroup>
            {selectedNodeType === "custom" && (
              <Input
                type="text"
                placeholder="https://your-rpc-node.com"
                value={customRpcUrl}
                onChange={(e) => handleCustomRpcChange(e.target.value)}
                disabled={isMining}
                className="mt-2"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Current RPC: <span className="font-mono">{currentRpcUrl || "Not set"}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Private Key</label>
            <Input
              type="password"
              placeholder="Enter your private key"
              value={privateKey}
              onChange={(e) => {
                const newKey = e.target.value;
                setPrivateKey(newKey);
                if (validatePrivateKey(newKey)) {
                  const address = getAddressFromPrivateKey(newKey);
                  setWalletAddress(address);
                }
              }}
              disabled={isMining}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet Address</label>
            <Input
              placeholder="Address will be generated automatically"
              value={walletAddress}
              disabled={true}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="font-medium">Current Difficulty</p>
              <p className="text-gray-600 truncate">{minerStats.difficulty}</p>
            </div>
            <div>
              <p className="font-medium">Total Mined</p>
              <p className="text-gray-600">{minerStats.totalMined}</p>
            </div>
            <div>
              <p className="font-medium">Balance</p>
              <p className="text-gray-600">{formatBalance(minerStats.balance)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 text-sm rounded-md border p-3">
            <div>
              <p className="font-medium">Stake</p>
              <p className="text-gray-600">{formatAplo(stakeStats.staked)}</p>
            </div>
            <div>
              <p className="font-medium">Reward Multiplier</p>
              <p className="text-gray-600">
                {stakeStats.multiplier > 0
                  ? `${stakeStats.multiplier.toFixed(1)}x`
                  : "Not staked"}
              </p>
            </div>
            <div>
              <p className="font-medium">Mining Status</p>
              <p className={stakeStats.canMine ? "text-green-600" : "text-yellow-600"}>
                {stakeStats.canMine ? "Stake OK" : `Needs ${MIN_STAKE_APLO} APLO stake`}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <label className="text-sm font-medium">Stake APLO Amount</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="number"
                min="0"
                step="0.000000000000000001"
                placeholder={`Minimum ${MIN_STAKE_APLO} APLO to mine`}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={isMining || isStaking}
              />
              <Button
                type="button"
                onClick={handleStake}
                disabled={!walletAddress || !privateKey || isMining || isStaking || !stakeAmount || !isRpcReady}
              >
                {isStaking ? (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4 animate-spin" /> Staking...
                  </>
                ) : (
                  "Stake APLO"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Mining starts only after at least {MIN_STAKE_APLO} APLO is staked.
            </p>
          </div>

          <Button
            className="w-full mt-4"
            onClick={toggleMining}
            variant={isMining ? "destructive" : "default"}
            disabled={!walletAddress || !privateKey || isStaking || !isRpcReady}
          >
            {isStaking ? (
              <>
                <PlayCircle className="mr-2 h-4 w-4 animate-spin" /> Staking...
              </>
            ) : isMining ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> Stop Mining
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" /> Start Mining
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Mined Shares (Logs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {minedShares.length === 0 ? (
            <p className="text-center text-gray-500">No shares mined yet</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebMiner;
