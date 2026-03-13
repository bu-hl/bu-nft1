const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleNFT contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("배포자:", deployer.address);

  const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");
  const nft = await SimpleNFT.deploy();
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log("SimpleNFT 컨트랙트 주소:", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
