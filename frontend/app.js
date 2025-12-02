// ===============================
// ChronaX Timestamp Registry DApp
// app.js
// ===============================

// === CONFIG ===
// Ganti dengan address kontrakmu sendiri!
const CONTRACT_ADDRESS = "PASTE_ADDRESS_KONTRAK_KAMU";

// ABI minimal
const ABI = [
    "function register(bytes32 dataHash) external",
    "function getRecord(bytes32 dataHash) external view returns (address owner, uint256 timestamp, string memory description)",
    "function isRegistered(bytes32 dataHash) external view returns (bool)"
];

let provider, signer, contract;

// Connect MetaMask otomatis
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask tidak ditemukan! Install MetaMask dulu.");
        return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    console.log("Wallet connected:", await signer.getAddress());
}

connectWallet();

// ===============================
// Register Hash
// ===============================
async function registerHash() {
    const input = document.getElementById("inputHash").value;

    if (!input.startsWith("0x") || input.length !== 66) {
        alert("Format hash harus bytes32 (0x + 64 hex)");
        return;
    }

    try {
        const tx = await contract.register(input);
        alert("Mengirim transaksi... tunggu konfirmasi.");
        await tx.wait();

        alert("Hash berhasil diregister!");
    } catch (err) {
        alert("Gagal: " + err.message);
    }
}

// ===============================
// Check Hash
// ===============================
async function checkHash() {
    const hash = document.getElementById("checkHash").value;

    if (!hash.startsWith("0x") || hash.length !== 66) {
        alert("Format hash harus bytes32 (0x + 64 hex)");
        return;
    }

    try {
        const record = await contract.getRecord(hash);

        const owner = record.owner;
        const ts = Number(record.timestamp);
        const desc = record.description;

        if (owner === "0x0000000000000000000000000000000000000000") {
            document.getElementById("result").innerHTML = "Hash belum terdaftar.";
            return;
        }

        document.getElementById("result").innerHTML = `
            <b>Owner:</b> ${owner}<br>
            <b>Timestamp:</b> ${new Date(ts * 1000).toLocaleString()}<br>
            <b>Description:</b> ${desc}
        `;
    } catch (err) {
        document.getElementById("result").innerHTML = "Error: hash tidak ditemukan.";
        console.log(err);
    }
}
