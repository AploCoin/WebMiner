"use client";

import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import type { Contract } from "web3-eth-contract";
import type { ContractAbi } from "web3";
import { useToast } from "@/hooks/use-toast";
import {
  APLO_STAKING_ABI,
  APLO_STAKING_ADDRESS,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  DEFAULT_DIFFICULTY,
  MIN_STAKE_APLO,
  MIN_STAKE_WEI,
  PRESET_RPC_NODES,
} from "../config";
import type { MinedShare, MinerMode, MinerParams, MiningWorkerMessage } from "../types";
import { submitWalletMineTransaction } from "../wallet-mining";
import {
  formatAplo,
  formatMiningDifficulty,
  formatPrivateKey,
  isValidStakeAmount,
  validatePrivateKey,
  validateRpcUrl,
  withTimeout,
} from "../utils";

export const useWebMinerController = (initialMode: MinerMode = "current") => {
  const { toast } = useToast();

  const [activeMode] = useState<MinerMode>(initialMode);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [isWalletConnecting, setIsWalletConnecting] = useState<boolean>(false);

  const [isMining, setIsMining] = useState<boolean>(false);
  const [minedShares, setMinedShares] = useState<MinedShare[]>([]);
  const [minerStats, setMinerStats] = useState<{
    difficulty: string;
    totalMined: number;
    balance: string;
  }>({
    difficulty: formatMiningDifficulty(DEFAULT_DIFFICULTY),
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
  const miningWorkerRef = useRef<Worker | null>(null);
  const miningJobIdRef = useRef<number>(0);

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
    const params = (await withTimeout(
      contractRef.current.methods.miner_params(address).call() as Promise<any>,
      15000,
      "miner_params RPC"
    )) as any[];
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

  const getMiningWorker = () => {
    if (miningWorkerRef.current) return miningWorkerRef.current;
    const worker = new Worker(new URL("../../../workers/miningWorker.ts", import.meta.url));
    miningWorkerRef.current = worker;
    return worker;
  };

  const stopMiningWorker = () => {
    miningJobIdRef.current += 1;
    miningWorkerRef.current?.postMessage({ type: "stop" });
  };

  const mineBlock = async (
    minerParams: MinerParams
  ): Promise<bigint | undefined> => {
    const worker = getMiningWorker();
    const jobId = miningJobIdRef.current + 1;
    miningJobIdRef.current = jobId;

    return await new Promise<bigint | undefined>((resolve, reject) => {
      const cleanup = () => {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
      };

      const onError = (event: ErrorEvent) => {
        cleanup();
        reject(new Error(event.message || "Mining worker crashed"));
      };

      const onMessage = (event: MessageEvent<MiningWorkerMessage>) => {
        const message = event.data;
        if (message.jobId !== jobId) return;

        if (message.type === "found") {
          cleanup();
          minerParams.totalMined += 1;
          minerParams.prevHash = BigInt(message.hash);
          resolve(BigInt(message.nonce));
        }

        if (message.type === "error") {
          cleanup();
          reject(new Error(message.message));
        }
      };

      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
      worker.postMessage({
        type: "start",
        jobId,
        sender: walletAddress,
        difficulty: minerParams.currentDifficulty.toString(),
        prevHash: minerParams.prevHash.toString(),
        totalMined: minerParams.totalMined,
      });

      const checkStopped = () => {
        if (!miningRef.current || miningJobIdRef.current !== jobId) {
          cleanup();
          worker.postMessage({ type: "stop" });
          resolve(undefined);
          return;
        }
        setTimeout(checkStopped, 1000);
      };
      checkStopped();
    });
  };

  const sendLegacyMineTransaction = async (nonce: bigint) => {
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

    const formattedPrivateKey = formatPrivateKey(privateKey);
    const signedTx = await web3.eth.accounts.signTransaction(
      txData,
      formattedPrivateKey
    );
    if (!signedTx.rawTransaction)
      throw new Error("Failed to sign transaction");
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  };

  const sendCurrentMineTransaction = async (nonce: bigint) => {
    if (!web3Ref.current || !contractRef.current)
      throw new Error("Not initialized");
    if (!window.ethereum || !walletAddress)
      throw new Error("Connect an EIP-1193 wallet first");

    const nonceHex = web3Ref.current.utils.padLeft(web3Ref.current.utils.toHex(nonce), 64);
    const callData = contractRef.current.methods.mine(nonceHex).encodeABI();
    return await submitWalletMineTransaction({
      provider: window.ethereum,
      from: walletAddress,
      to: CONTRACT_ADDRESS,
      data: callData,
      waitForReceipt: (transactionHash) =>
        web3Ref.current!.eth.getTransactionReceipt(transactionHash),
    });
  };

  const sendMineTransaction = (nonce: bigint) =>
    activeMode === "legacy"
      ? sendLegacyMineTransaction(nonce)
      : sendCurrentMineTransaction(nonce);

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

  const sendWalletTransaction = async (to: string, data: string, label: string) => {
    if (!window.ethereum) {
      throw new Error("Connect an EIP-1193 wallet such as MetaMask first");
    }
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{ from: walletAddress, to, data }],
    });
    toast({ title: `${label} submitted`, description: txHash });
    return txHash;
  };

  const sendStakeTransaction = async (amountWei: bigint) => {
    if (!web3Ref.current || !stakingContractRef.current)
      throw new Error("Staking contract not initialized");

    const transaction = stakingContractRef.current.methods.stake(amountWei.toString());

    if (activeMode === "current") {
      return await sendWalletTransaction(
        APLO_STAKING_ADDRESS,
        transaction.encodeABI(),
        "Stake transaction"
      );
    }

    const web3 = web3Ref.current;
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

  const sendUnstakeTransaction = async () => {
    if (!web3Ref.current || !stakingContractRef.current)
      throw new Error("Staking contract not initialized");

    const transaction = stakingContractRef.current.methods.unstake();

    if (activeMode === "current") {
      return await sendWalletTransaction(
        APLO_STAKING_ADDRESS,
        transaction.encodeABI(),
        "Unstake transaction"
      );
    }

    const web3 = web3Ref.current;
    const gasEstimate = await transaction.estimateGas({ from: walletAddress });
    const gasPrice = await web3.eth.getGasPrice();
    const latestNonce = await web3.eth.getTransactionCount(walletAddress, "pending");

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        from: walletAddress,
        to: APLO_STAKING_ADDRESS,
        data: transaction.encodeABI(),
        gas: Number(gasEstimate) + 10000,
        gasPrice,
        nonce: latestNonce,
      },
      formatPrivateKey(privateKey)
    );
    if (!signedTx.rawTransaction)
      throw new Error("Failed to sign unstaking transaction");

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
        description: "Mining reward is unlocked. Reward amount is gas-based, not stake-based.",
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
        description: activeMode === "legacy" ? "Please enter a valid private key first" : "Please connect a wallet first",
      });
      return;
    }

    if (activeMode === "legacy" && (!privateKey || !validatePrivateKey(privateKey))) {
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
        description: `Current stake: ${formatAplo(updatedStatus.staked)} · mining reward unlocked`,
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

  const handleUnstake = async () => {
    if (!walletAddress) {
      toast({
        variant: "destructive",
        title: "No Wallet Address",
        description: activeMode === "legacy" ? "Please enter a valid private key first" : "Please connect a wallet first",
      });
      return;
    }

    if (activeMode === "legacy" && (!privateKey || !validatePrivateKey(privateKey))) {
      toast({
        variant: "destructive",
        title: "Invalid Private Key",
        description: "Private key must contain 64 hex characters with or without 0x prefix",
      });
      return;
    }

    setIsStaking(true);
    try {
      await sendUnstakeTransaction();
      const updatedStatus = await getStakeStatus();
      await updateMinerStats();
      toast({
        title: "Unstake submitted",
        description: `Current stake: ${formatAplo(updatedStatus.staked)}`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred during unstaking.";
      toast({ variant: "destructive", title: "Unstaking Error", description: message });
    } finally {
      setIsStaking(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "Wallet not found",
        description: "Install MetaMask or another EIP-1193 wallet to use Current mode",
      });
      return;
    }

    setIsWalletConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts?.[0];
      if (!account) throw new Error("Wallet did not return an account");
      setWalletAddress(account);
      toast({ title: "Wallet connected", description: account });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to connect wallet.";
      toast({ variant: "destructive", title: "Wallet Error", description: message });
    } finally {
      setIsWalletConnecting(false);
    }
  };

  const updateMinerStats = async () => {
    if (!walletAddress || !web3Ref.current) return;

    const balance = await withTimeout(
      web3Ref.current.eth.getBalance(walletAddress),
      15000,
      "getBalance RPC"
    );
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
            difficulty: formatMiningDifficulty(minerParams.currentDifficulty),
            totalMined: minerParams.totalMined,
            balance: prev.balance,
          }));

          if (!web3Ref.current) {
            break;
          }
          
          // Проверяем задержку по блокам
          const currentBlock = await withTimeout(
            web3Ref.current.eth.getBlockNumber(),
            15000,
            "getBlockNumber RPC"
          );
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
            difficulty: formatMiningDifficulty(updatedParams.currentDifficulty),
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
          description: activeMode === "legacy" ? "Please enter a wallet address" : "Please connect a wallet",
        });
        return;
      }
      if (activeMode === "legacy" && !privateKey) {
        toast({
          variant: "destructive",
          title: "No Private Key",
          description: "Please enter a private key",
        });
        return;
      }
      if (activeMode === "legacy" && !validatePrivateKey(privateKey)) {
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
      stopMiningWorker();
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
      stopMiningWorker();
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
      stopMiningWorker();
      miningWorkerRef.current?.terminate();
      miningWorkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (!document.hidden && miningRef.current) {
        initializeWeb3(currentRpcUrl);
        updateMinerStats().catch((error) => {
          console.error("Failed to refresh miner stats after tab restore:", error);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentRpcUrl, walletAddress]);

  const isRpcReady = Boolean(currentRpcUrl && validateRpcUrl(currentRpcUrl));

  return {
    activeMode,
    walletAddress,
    privateKey,
    isWalletConnecting,

    isMining,
    minedShares,
    minerStats,
    stakeStats,
    isStaking,
    stakeAmount,
    selectedNodeType,
    customRpcUrl,
    currentRpcUrl,
    isRpcReady,
    setPrivateKey,
    setWalletAddress,
    setStakeAmount,

    handleNodeChange,
    handleCustomRpcChange,
    connectWallet,

    handleStake,
    handleUnstake,
    toggleMining,
  };
};
