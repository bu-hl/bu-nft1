const { ethers } = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log("=== 새 이더리움 지갑 생성 ===");
console.log("주소:", wallet.address);
console.log("개인키:", wallet.privateKey);
console.log("시드 구문:", wallet.mnemonic.phrase);
