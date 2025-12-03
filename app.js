const CONTRACT_ADDRESS = "0xF147b0A94c05F56942e2da099EeBeEB205376997";   // masukkan address kontrak ChronaXRegistry
const ABI = [
    {
        "inputs": [
            {"internalType": "bytes32","name": "fileHash","type": "bytes32"}
        ],
        "name": "registerFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let provider, signer, contract;

// AUTO CONNECT
async function autoConnect() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    }
}
autoConnect();

// BUTTON CONNECT
document.getElementById("connectBtn").onclick = async () => {
    if (!window.ethereum) return alert("Install Metamask!");

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    alert("Wallet connected!");
};

// HASH FILE
async function hashFile(file) {
    const buffer = await file.arrayBuffer();
    const hash = ethers.keccak256(new Uint8Array(buffer));
    return hash;
}

// UPLOAD BUTTON
document.getElementById("uploadBtn").onclick = async () => {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Select a file first!");

    const hash = await hashFile(file);
    document.getElementById("fileHash").innerText = "Hash: " + hash;

    const tx = await contract.Register(hash);
    await tx.wait();

    alert("File registered on-chain!");
};
