const CONTRACT_ADDRESS = "0xf147b0a94c05f56942e2da099eebeeb205376997"; // ganti sesuai deploy
const ABI = [
    {
        "inputs": [{"internalType": "bytes32","name":"docHash","type":"bytes32"}],
        "name": "register",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32","name":"docHash","type":"bytes32"}],
        "name": "isRegistered",
        "outputs": [{"internalType":"bool","name":"","type":"bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32","name":"docHash","type":"bytes32"}],
        "name": "getRecord",
        "outputs": [
            {"internalType":"address","name":"","type":"address"},
            {"internalType":"uint256","name":"","type":"uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider, signer, contract;
let currentHash = null;

// AUTO CONNECT
async function autoConnect() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            signer = provider.getSigner();
            contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        }
    }
}
autoConnect();

// CONNECT BUTTON
document.getElementById("connectBtn").onclick = async () => {
    if (!window.ethereum) return alert("Install Metamask!");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    alert("Wallet connected!");
};

// HASH BUTTON
document.getElementById("hashBtn").onclick = async () => {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Select a file first!");
    const buffer = await file.arrayBuffer();
    currentHash = ethers.utils.keccak256(new Uint8Array(buffer));
    document.getElementById("generatedHash").innerText = currentHash;
};

// REGISTER BUTTON
document.getElementById("registerBtn").onclick = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!currentHash) return alert("Generate hash first!");
    try {
        const tx = await contract.register(currentHash);
        await tx.wait();
        alert("File registered on-chain!");
    } catch(e) {
        alert("Error: " + e.message);
    }
};

// VERIFY BUTTON
document.getElementById("verifyBtn").onclick = async () => {
    if (!contract) return alert("Connect wallet first!");
    const hash = document.getElementById("verifyInput").value;
    if (!hash) return alert("Enter hash first!");
    try {
        const exists = await contract.isRegistered(hash);
        document.getElementById("verifyResult").innerText = exists ? "✅ Hash exists on-chain" : "❌ Hash not found";
    } catch(e) {
        alert("Error: " + e.message);
    }
};
