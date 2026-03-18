require("dotenv").config();
const { ethers } = require("ethers");

function main() {
    const inputKey = process.argv[2] || process.env.PRIVATE_KEY;

    if (!inputKey) {
        console.error("사용법: node scripts/privateKeyToAddress.js <PRIVATE_KEY>");
        console.error("또는 .env의 PRIVATE_KEY를 설정하세요.");
        process.exit(1);
    }

    try {
        const wallet = new ethers.Wallet(inputKey);
        console.log("주소:", wallet.address);
    } catch (error) {
        console.error("유효한 프라이빗키가 아닙니다.");
        console.error(error.message);
        process.exit(1);
    }
}

main();
