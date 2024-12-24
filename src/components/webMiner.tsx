"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const RPC_URL = "https://pub1.aplocoin.com";
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000001234";
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

const validatePrivateKey = (key: string): boolean => {
  // Проверяем ключ с префиксом 0x (66 символов) или без него (64 символа)
  return /^(0x)?[0-9a-fA-F]{64}$/.test(key);
};

const getAddressFromPrivateKey = (privateKey: string): string => {
  try {
    // Добавляем префикс 0x если его нет
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
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

  // Refs
  const miningRef = useRef<boolean>(false);
  const web3Ref = useRef<Web3 | null>(null);
  const contractRef = useRef<Contract<ContractAbi> | null>(null);

  useEffect(() => {
    const web3Instance = new Web3(new Web3.providers.HttpProvider(RPC_URL));
    web3Ref.current = web3Instance;
    contractRef.current = new web3Instance.eth.Contract(
      CONTRACT_ABI as any,
      CONTRACT_ADDRESS
    );
  }, []);

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
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const signedTx = await web3.eth.accounts.signTransaction(
      txData,
      formattedPrivateKey
    );
    if (!signedTx.rawTransaction)
      throw new Error("Failed to sign transaction");
    return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  };

  const updateMinerStats = async () => {
    if (!walletAddress || !web3Ref.current) return;

    const balance = await web3Ref.current.eth.getBalance(walletAddress);
    setMinerStats((prev) => ({
      ...prev,
      balance: web3Ref.current!.utils.fromWei(balance, "ether"),
    }));
  };

  const mine = async () => {
    while (miningRef.current) {
      try {
        const minerParams = await getMinerParams(walletAddress);
        // Обновить статистику
        setMinerStats((prev) => ({
          difficulty: minerParams.currentDifficulty.toString(),
          totalMined: minerParams.totalMined,
          balance: prev.balance,
        }));

        if (!web3Ref.current) return;
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

        // Обновляем статистику
        const updatedParams = await getMinerParams(walletAddress);
        await updateMinerStats();
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
  };

  const toggleMining = async () => {
    if (!isMining) {
      if (!walletAddress) {
        toast({
          variant: "destructive",
          title: "Нет адреса кошелька",
          description: "Пожалуйста, введите адрес кошелька",
        });
        return;
      }
      if (!privateKey) {
        toast({
          variant: "destructive",
          title: "Нет приватного ключа",
          description: "Пожалуйста, введите приватный ключ",
        });
        return;
      }
      // Валидируем приватный ключ
      if (!validatePrivateKey(privateKey)) {
        toast({
          variant: "destructive",
          title: "Неверный приватный ключ",
          description: "Приватный ключ должен содержать 64 hex символа с или без префикса 0x",
        });
        return;
      }

      setIsMining(true);
      miningRef.current = true;
      mine();
    } else {
      setIsMining(false);
      miningRef.current = false;
    }
  };

  // Периодическое обновление статистики
  useEffect(() => {
    if (isMining) {
      const interval = setInterval(updateMinerStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isMining, walletAddress]);

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
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex flex-row justify-between"><span>GAplo Web Miner</span> <ThemeSwitcher/></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Приватный ключ</label>
            <Input
              type="password"
              placeholder="Введите ваш приватный ключ"
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
            <label className="text-sm font-medium">Адрес кошелька</label>
            <Input
              placeholder="Адрес сгенерируется автоматически"
              value={walletAddress}
              disabled={true}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="font-medium">Текущая сложность</p>
              <p className="text-gray-600 truncate">{minerStats.difficulty}</p>
            </div>
            <div>
              <p className="font-medium">Всего намайнено</p>
              <p className="text-gray-600">{minerStats.totalMined}</p>
            </div>
            <div>
              <p className="font-medium">Баланс</p>
              <p className="text-gray-600">{formatBalance(minerStats.balance)}</p>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            onClick={toggleMining}
            variant={isMining ? "destructive" : "default"}
            disabled={!walletAddress || !privateKey}
          >
            {isMining ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> Остановить майнинг
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" /> Начать майнинг
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
