import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlayCircle, StopCircle } from "lucide-react";
import Web3 from 'web3';

const RPC_URL = "https://pub1.aplocoin.com";
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000001234";
const CONTRACT_ABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "miner", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "nonce", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "prev_hash", "type": "uint256" }], "name": "Mined", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "BLOCK_REWARD", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DEFAULT_DIFFICULTY", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MINE_SELECTOR", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "nonce", "type": "bytes32" }], "name": "mine", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "miner_params", "outputs": [{ "internalType": "uint256", "name": "last_block", "type": "uint256" }, { "internalType": "uint256", "name": "current_difficulty", "type": "uint256" }, { "internalType": "uint256", "name": "total_mined", "type": "uint256" }, { "internalType": "uint256", "name": "prev_hash", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "refund", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "takeFee", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }]; // Add your contract ABI here
const DEFAULT_DIFFICULTY = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

const WebMiner = () => {
	const [walletAddress, setWalletAddress] = useState('');
	const [privateKey, setPrivateKey] = useState('');
	const [isMining, setIsMining] = useState(false);
	const [minedShares, setMinedShares] = useState([]);
	const [minerStats, setMinerStats] = useState({
		difficulty: DEFAULT_DIFFICULTY.toString(),
		totalMined: 0,
		balance: '0'
	});

	// Refs for mining loop control
	const miningRef = useRef(false);
	const web3Ref = useRef(null);
	const contractRef = useRef(null);

	// Initialize Web3
	useEffect(() => {
		web3Ref.current = new Web3(new Web3.providers.HttpProvider(RPC_URL));
		contractRef.current = new web3Ref.current.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
	}, []);

	const getMinerParams = async (address) => {
		const params = await contractRef.current.methods.miner_params(address).call();
		return {
			lastBlock: parseInt(params[0]),
			currentDifficulty: params[1] === "0" ? DEFAULT_DIFFICULTY : BigInt(params[1]),
			totalMined: parseInt(params[2]),
			prevHash: BigInt(params[3]),
		};
	};

	const generateNonce = () => {
		return BigInt("0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(""));
	};

	const hashNonce = (nonce, sender, difficulty, prevHash, totalMined) => {
		const web3 = web3Ref.current;
		const packedData = web3.utils.encodePacked(
			{ value: sender, type: 'address' },
			{ value: web3.utils.padLeft(web3.utils.toHex(nonce), 64), type: 'bytes32' },
			{ value: difficulty, type: 'uint256' },
			{ value: prevHash, type: 'uint256' },
			{ value: totalMined, type: 'uint256' },
		);
		return BigInt("0x" + web3.utils.sha3(packedData).slice(2));
	};

	const mineBlock = async (minerParams) => {
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
				minerParams.totalMined++;
				minerParams.lastBlock = await web3Ref.current.eth.getBlockNumber();
				minerParams.prevHash = hashResult;
				return nonce;
			}
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
	};

	const sendMineTransaction = async (nonce) => {
		const web3 = web3Ref.current;
		const nonceHex = web3.utils.padLeft(web3.utils.toHex(nonce), 64);
		const transaction = contractRef.current.methods.mine(nonceHex);

		const gasEstimate = await transaction.estimateGas({ from: walletAddress });
		const gasPrice = await web3.eth.getGasPrice();
		const latestNonce = await web3.eth.getTransactionCount(walletAddress, "pending");

		const txData = {
			from: walletAddress,
			to: CONTRACT_ADDRESS,
			data: transaction.encodeABI(),
			gas: gasEstimate + BigInt(1000),
			gasPrice: gasPrice,
			nonce: latestNonce,
		};

		const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
		return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	};

	const updateMinerStats = async () => {
		if (!walletAddress || !web3Ref.current) return;

		const balance = await web3Ref.current.eth.getBalance(walletAddress);
		setMinerStats(prev => ({
			...prev,
			balance: web3Ref.current.utils.fromWei(balance, "ether")
		}));
	};

	const mine = async () => {

		while (miningRef.current) {
			try {
				let minerParams = await getMinerParams(walletAddress);
				// Update stats
				setMinerStats(prev => ({
					difficulty: minerParams.currentDifficulty.toString(),
					totalMined: minerParams.totalMined,
					balance: prev.balance
				}));

				// Check block delay
				const currentBlock = await web3Ref.current.eth.getBlockNumber();
				if (currentBlock - BigInt(minerParams.lastBlock) < BigInt(20)) {
					await new Promise(resolve => setTimeout(resolve, 10000));
					continue;
				}

				// Mine and submit
				const nonce = await mineBlock(minerParams);
				if (!nonce || !miningRef.current) break;

				const txHash = await sendMineTransaction(nonce);

				// Add to mined shares
				setMinedShares(prev => [{
					blockNumber: txHash.blockNumber,
					txHash: txHash.transactionHash,
					timestamp: new Date().toLocaleString()
				}, ...prev]);

				// Update stats
				minerParams = await getMinerParams(walletAddress);
				await updateMinerStats();

			} catch (error) {
				console.error('Mining error:', error);
				if (miningRef.current) {
					await new Promise(resolve => setTimeout(resolve, 5000));
				}
			}
		}
	};

	const toggleMining = async () => {
		if (!isMining) {
			if (!walletAddress || !privateKey) {
				alert('Please enter wallet address and private key');
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

	// Update stats periodically
	useEffect(() => {
		if (isMining) {
			const interval = setInterval(updateMinerStats, 30000);
			return () => clearInterval(interval);
		}
	}, [isMining, walletAddress]);

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">AploCoin Web Miner</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Wallet Address</label>
						<Input
							placeholder="Enter your wallet address"
							value={walletAddress}
							onChange={(e) => setWalletAddress(e.target.value)}
							disabled={isMining}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Private Key</label>
						<Input
							type="password"
							placeholder="Enter your private key"
							value={privateKey}
							onChange={(e) => setPrivateKey(e.target.value)}
							disabled={isMining}
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
							<p className="text-gray-600">{minerStats.balance} APLO</p>
						</div>
					</div>

					<Button
						className="w-full mt-4"
						onClick={toggleMining}
						variant={isMining ? "destructive" : "default"}
						disabled={!walletAddress || !privateKey}
					>
						{isMining ? (
							<><StopCircle className="mr-2 h-4 w-4" /> Stop Mining</>
						) : (
							<><PlayCircle className="mr-2 h-4 w-4" /> Start Mining</>
						)}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl font-bold">Mined Shares</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{minedShares.length === 0 ? (
							<p className="text-center text-gray-500">No shares mined yet</p>
						) : (
							<div className="space-y-3">
								{minedShares.map((share, index) => (
									<div
										key={index}
										className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
									>
										<div className="flex justify-between items-start">
											<div>
												<p className="font-medium">Block #{share.blockNumber}</p>
												<p className="text-sm text-gray-500 break-all">{share.txHash}</p>
											</div>
											<span className="text-sm text-gray-400">{share.timestamp}</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default WebMiner;
