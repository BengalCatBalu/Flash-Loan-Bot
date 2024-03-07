const hre = require("hardhat");

async function main() {
    const ContractAddress = "0x90c84237fDdf091b1E63f369AF122EB46000bc70";
    const UserAddress = "0x495cfa748ebf17A1B612a6fEe78D1c3558e73076";
    const IMPERSONATED_ACCOUNT_ADDRESS = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const impersonatedSigner = await ethers.getImpersonatedSigner(IMPERSONATED_ACCOUNT_ADDRESS);
    usdc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", USDC_ADDRESS);
    const FEE_AMOUNT = ethers.parseUnits("90000", 6); // Adjusted for clarity

    await usdc.connect(impersonatedSigner).transfer(ContractAddress, FEE_AMOUNT);
    await usdc.connect(impersonatedSigner).transfer(UserAddress, FEE_AMOUNT);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});