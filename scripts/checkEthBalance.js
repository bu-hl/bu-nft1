require("dotenv").config();
const { ethers } = require("ethers");

function resolveRpcUrl(network) {
    if (network === "hoodi") {
        return process.env.HOODI_RPC_URL;
    }

    return process.env.SEPOLIA_RPC_URL;
}

function resolveAddress(privkey) {
    if (!privkey) {
        throw new Error("주소 또는 프라이빗키를 입력하세요.");
    }

    if (ethers.isAddress(privkey)) {
        return privkey;
    }

    return new ethers.Wallet(privkey).address;
}

async function main() {
    const privkey = process.env.PRIVATE_KEY;
    const network = process.argv[2] || "sepolia";

    if (!["sepolia", "hoodi"].includes(network)) {
        console.error("지원하지 않는 네트워크입니다. sepolia 또는 hoodi를 사용하세요.");
        process.exit(1);
    }

    const rpcUrl = resolveRpcUrl(network);

    if (!rpcUrl) {
        console.error(`${network.toUpperCase()} RPC URL이 설정되지 않았습니다.`);
        process.exit(1);
    }

    try {
        const address = resolveAddress(privkey);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const balance = await provider.getBalance(address);

        console.log("네트워크:", network);
        console.log("주소:", address);
        console.log("잔액:", ethers.formatEther(balance), "ETH");
    } catch (error) {
        console.error("잔액 조회에 실패했습니다.");
        console.error(error.message);
        process.exit(1);
    }
}

main();
