const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Flash Loans Exercise 2', function () {
    const IMPERSONATED_ACCOUNT_ADDRESS = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const AAVE_LENDING_POOL_ADDRESS = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";

    // $100M USDC
    const BORROW_AMOUNT = ethers.parseUnits("100000000", 6);
    // AAVE flash loan fee is 0.09% --> $90K USDC
    const FEE_AMOUNT = ethers.parseUnits("100000", 6);

    it('AAVE V3 Flash Loan', async function () {

        // Get contract objects for relevant On-Chain contracts
        const usdc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", USDC_ADDRESS);
        const usdt = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", USDT_ADDRESS);
        const impersonatedSigner = await ethers.getImpersonatedSigner(IMPERSONATED_ACCOUNT_ADDRESS);
        console.log(await usdc.balanceOf(IMPERSONATED_ACCOUNT_ADDRESS));
        console.log(await usdt.balanceOf(IMPERSONATED_ACCOUNT_ADDRESS));

        // Deploy Flash Loan contract
        const FlashLoanReceiverFactory = await ethers.getContractFactory(
            'FlashLoan',
            impersonatedSigner
        );
        const flashLoanContract = await FlashLoanReceiverFactory.deploy(AAVE_LENDING_POOL_ADDRESS);

        // Send USDC to contract for fees
        await usdc.connect(impersonatedSigner).transfer(flashLoanContract.target, FEE_AMOUNT);
        await usdt.connect(impersonatedSigner).transfer(flashLoanContract.target, FEE_AMOUNT);

        // Execute successfully a Flash Loan of $100,000,000 (USDC)
        // Передаем адреса токенов для арбитража в getFlashLoan
        const abiCoder = new ethers.AbiCoder();
        await flashLoanContract.executeOperation([USDT_ADDRESS], [FEE_AMOUNT],[0], flashLoanContract.target, abiCoder.encode(["address", "address"], [WETH_ADDRESS, USDC_ADDRESS]));
    });

});