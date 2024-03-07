const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Flash Loans Exercise 2', function () {
    const IMPERSONATED_ACCOUNT_ADDRESS = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Add DAI address for testing
    const AAVE_LENDING_POOL_ADDRESS = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";

    // $100M USDC for flash loan
    const BORROW_AMOUNT = ethers.parseUnits("100000000", 6);
    // AAVE flash loan fee is 0.09% --> $90K USDC for fees
    const FEE_AMOUNT = ethers.parseUnits("900000", 6); // Adjusted for clarity

    let flashLoanContract;
    let usdc, dai;

    before(async function () {
        // Getting contract objects for relevant on-chain contracts
        usdc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", USDC_ADDRESS);
        dai = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", DAI_ADDRESS);
        const impersonatedSigner = await ethers.getImpersonatedSigner(IMPERSONATED_ACCOUNT_ADDRESS);

        // Deploying FlashLoan contract
        const FlashLoanReceiverFactory = await ethers.getContractFactory('FlashLoan', impersonatedSigner);
        flashLoanContract = await FlashLoanReceiverFactory.deploy(AAVE_LENDING_POOL_ADDRESS);

        // Sending USDC to the contract to cover fees
        await usdc.connect(impersonatedSigner).transfer(flashLoanContract.target, FEE_AMOUNT);
    });

    it('should execute flash loan successfully', async function () {
        // Checking initial balance to ensure funds are available for fees
        const initialContractBalance = await usdc.balanceOf(flashLoanContract.target);
        expect(initialContractBalance).to.equal(FEE_AMOUNT);

        // Performing flash loan and arbitrage operations
        const swapToken = WETH_ADDRESS; // Token to swap to
        const secondToken = DAI_ADDRESS; // Second token for arbitrage
        await expect(
            flashLoanContract.getFlashLoan(USDC_ADDRESS, BORROW_AMOUNT, swapToken, secondToken)
        ).to.not.be.reverted;

        // Checking that the flash loan was repaid with fees
        const finalContractBalance = await usdc.balanceOf(flashLoanContract.target);
        expect(finalContractBalance).to.be.at.least(initialContractBalance); // Ensure that the contract has not lost funds
    });
});

