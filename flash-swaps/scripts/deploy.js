const hre = require("hardhat");

async function main() {
    const AAVE_LENDING_POOL_ADDRESS = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";

    const flashLoan = await hre.ethers.deployContract("FlashLoan", [AAVE_LENDING_POOL_ADDRESS], {
      value: ethers.parseEther("9000"),
    });
    await flashLoan.waitForDeployment();
    console.log("FlashLoan deployed to:", flashLoan.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
