const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
  const BASE_URI = process.env.NFT_BASE_URI;

  if (!CONTRACT_ADDRESS) {
    console.error("Error: .env에 NFT_CONTRACT_ADDRESS를 설정해주세요");
    process.exit(1);
  }

  if (!BASE_URI) {
    console.error("Error: .env에 NFT_BASE_URI를 설정해주세요");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("실행 계정:", signer.address);

  const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");
  const nft = SimpleNFT.attach(CONTRACT_ADDRESS);

  console.log("컨트랙트:", CONTRACT_ADDRESS);
  console.log("설정할 Base URI:", BASE_URI);

  console.log("\nBase URI 설정 중...");
  const tx = await nft.setBaseURI(BASE_URI);
  await tx.wait();

  console.log("완료! 트랜잭션 해시:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
