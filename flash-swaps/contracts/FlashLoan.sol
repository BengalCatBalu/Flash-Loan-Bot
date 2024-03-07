// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./interfaces/ILendingPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IUniswapV2.sol";

interface IERC20NonReturning {
    function approve(address spender, uint256 amount) external;
    function transfer(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external;
}

contract FlashLoan is ReentrancyGuard {
    using SafeERC20 for IERC20;

    ILendingPool public pool;
    IUniswapV2Router02 public uniswapV2Router;
    address public immutable weth;

    event FlashLoanInitiated(address borrower, address borrowToken, uint amount, address swapToken, address secondToken);
    event SwapExecuted(address fromToken, address toToken, uint amountOut);
    event FundsReturned(address token, uint256 amount);

    constructor(address _pool) payable {
        require(_pool != address(0), "Pool address cannot be zero");
        pool = ILendingPool(_pool);
        uniswapV2Router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        weth = uniswapV2Router.WETH();
    }

    function getFlashLoan(
        address borrowToken,
        uint amount,
        address swapToken,
        address secondToken
    ) external nonReentrant {
        
        address[] memory tokens = new address[](1);
        tokens[0] = borrowToken;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;
        bytes memory params = abi.encode(swapToken, secondToken);

        emit FlashLoanInitiated(msg.sender, borrowToken, amount, swapToken, secondToken);
        pool.flashLoan(
            address(this),
            tokens,
            amounts,
            modes,
            address(this),
            params,
            0
        );
    }

    function executeOperation(
        address[] memory assets,
        uint256[] memory amounts,
        uint256[] memory premiums,
        address initiator,
        bytes memory params
    ) external nonReentrant returns (bool) {
        require(msg.sender == address(pool), "Caller is not the pool");
        require(initiator == address(this), "Initiator is not this contract");
        require(assets.length == 1 && amounts.length == 1, "Invalid asset or amount length");
        
        (address swapTokenAddress, address secondStableCoinAddress) = abi.decode(params, (address, address));
        address borrowTokenAddress = assets[0];

        // Approve and swap
        IERC20(borrowTokenAddress).approve(address(uniswapV2Router), amounts[0]);
        address[] memory path = new address[](3);
        path[0] = borrowTokenAddress;
        path[1] = swapTokenAddress;
        path[2] = secondStableCoinAddress;
        uint[] memory amountsOut = uniswapV2Router.swapExactTokensForTokens(
            amounts[0],
            0, // Consider setting a minimum amount out to mitigate slippage
            path,
            address(this),
            block.timestamp
        );
        emit SwapExecuted(borrowTokenAddress, secondStableCoinAddress, amountsOut[2]);

        // Approve and swap back
        IERC20(secondStableCoinAddress).approve(address(uniswapV2Router), amountsOut[2]);
        address[] memory path1 = new address[](3);
        path1[0] = secondStableCoinAddress;
        path1[1] = swapTokenAddress;
        path1[2] = borrowTokenAddress;
        amountsOut = uniswapV2Router.swapExactTokensForTokens(
            amountsOut[2],
            0, // Again, consider a minimum amount out
            path1,
            address(this),
            block.timestamp
        );
        emit SwapExecuted(secondStableCoinAddress, borrowTokenAddress, amountsOut[2]);

        // Check and return funds
        uint256 owed = amounts[0] + premiums[0];
        IERC20(borrowTokenAddress).approve(address(pool), owed);
        emit FundsReturned(borrowTokenAddress, owed);

        return true;
    }

    function simpleFlashLoan(uint256 amount) public {
        require(amount < 10 ether);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
    }
}
