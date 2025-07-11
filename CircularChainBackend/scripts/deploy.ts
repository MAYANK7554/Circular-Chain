import { ethers } from "hardhat";

async function main() {
  const passport = await ethers.deployContract("ProductPassport");

  await passport.waitForDeployment();

  console.log(
    `ProductPassport contract deployed to: ${passport.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});