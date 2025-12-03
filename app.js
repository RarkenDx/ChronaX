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

// BUTTON CONNECT
document.getElementById("connectBtn").onclick = async () => {
    if (!window.ethereum) return alert("Install Metamask!");

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    alert("Wallet connected!");
};

// HASH FILE
async function hashFile(file) {
    const buffer = await file.arrayBuffer();
    const hash = ethers.utils.keccak256(new Uint8Array(buffer));
    return hash;
}

// UPLOAD BUTTON
document.getElementById("uploadBtn").onclick = async () => {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Select a file first!");

    const hash = await hashFile(file);
    document.getElementById("fileHash").innerText = "Hash: " + hash;

    const tx = await contract.registerFile(hash); // perbaikan nama fungsi
    await tx.wait();

    alert("File registered on-chain!");
};
