const hre = require("hardhat");

async function main() {
  // 컨트랙트 주소 설정 (환경변수)
  const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

  if (!CONTRACT_ADDRESS) {
    console.error("Error: .env에 NFT_CONTRACT_ADDRESS를 설정해주세요");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("민팅 계정:", signer.address);

  // 컨트랙트 연결
  const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");
  const nft = SimpleNFT.attach(CONTRACT_ADDRESS);

  // 민팅 대상 주소 (환경변수로 지정 가능, 기본값은 서명자)
  const mintTo = process.env.MINT_TO || signer.address;

  console.log("컨트랙트 주소:", CONTRACT_ADDRESS);
  console.log("민팅 대상:", mintTo);

  // 민팅 전 총 발행량
  const supplyBefore = await nft.totalSupply();
  console.log("현재 총 발행량:", supplyBefore.toString());

  // 민팅 실행
  console.log("\n민팅 중...");
  const tx = await nft.mint(mintTo);
  const receipt = await tx.wait();

  console.log("트랜잭션 해시:", receipt.hash);

  // 민팅 후 총 발행량
  const supplyAfter = await nft.totalSupply();
  console.log("민팅 완료! 새 토큰 ID:", supplyAfter.toString());
  console.log("총 발행량:", supplyAfter.toString());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
