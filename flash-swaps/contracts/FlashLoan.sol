pragma solidity ^0.8.13;
import "./interfaces/ILendingPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./interfaces/IUniswapV2.sol";

interface IERC20NonReturning {
    function approve(address spender, uint256 amount) external;

    function transfer(address to, uint256 amount) external;

    function transferFrom(address from, address to, uint256 amount) external;
}

contract FlashLoan {
    ILendingPool pool;
    IUniswapV2Router02 public uniswapV2Router;
    address public weth;
    address public usdt = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    constructor(address _pool) {
        pool = ILendingPool(_pool);
        uniswapV2Router = IUniswapV2Router02(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );
        weth = uniswapV2Router.WETH();
    }

    function getFlashLoan(
        address borrowToken,
        uint amount,
        address swapToken,
        address secondStableCoin
    ) external {
        require(
            borrowToken == usdt || borrowToken == usdc || borrowToken == dai,
            "Not supported token loan"
        );
        console.log(
            "Balance Before Flash loan",
            IERC20(borrowToken).balanceOf(address(this))
        );
        address[] memory tokens = new address[](1);
        tokens[0] = borrowToken;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;
        bytes memory params = abi.encode(swapToken, secondStableCoin);
        pool.flashLoan(
            address(this),
            tokens,
            amounts,
            modes,
            address(this),
            params, // Pass encoded data for arbitrage
            0
        );
    }

    function executeOperation(
        address[] memory assets,
        uint256[] memory amounts,
        uint256[] memory premiums,
        address initiator,
        bytes memory params
    ) public returns (bool) {
        //require(msg.sender == address(pool), "not pool");
        require(initiator == address(this));
        require(assets.length == 1, "Small length");
        (address swapTokenAddress, address secondStableCoinAddress) = abi
            .decode(params, (address, address));
        address borrowTokenAddress = assets[0];

        // Starting arbitrage

        console.log(
            "Starting balance of borrowed token: %s",
            IERC20(borrowTokenAddress).balanceOf(address(this))
        );

        console.log();

        // // Set up swap path
        address[] memory path = new address[](3);
        path[0] = borrowTokenAddress;
        path[1] = swapTokenAddress;
        path[2] = secondStableCoinAddress;

        // Approve and swap
        console.log(
            "Attempting swap: %s borrowed token to swap token",
            amounts[0]
        );

        if (borrowTokenAddress != usdt) {
            IERC20(borrowTokenAddress).approve(
                address(uniswapV2Router),
                IERC20(borrowTokenAddress).balanceOf(address(this))
            );
        } else {
            IERC20NonReturning(borrowTokenAddress).approve(
                address(uniswapV2Router),
                IERC20(borrowTokenAddress).balanceOf(address(this))
            );
        }
        uint[] memory amountsOut = uniswapV2Router.swapExactTokensForTokens(
            amounts[0],
            0,
            path,
            address(this),
            block.timestamp
        );
        console.log("Received %s", amountsOut[2]);

        // // Update path for the second swap
        address[] memory path1 = new address[](3);
        path1[0] = secondStableCoinAddress;
        path1[1] = swapTokenAddress;
        path1[2] = borrowTokenAddress;
        console.log(amountsOut[0], amountsOut[1], amountsOut[2]);

        // // Approve and swap back
        console.log("Try to swap %s second stable coin", amountsOut[2]);
        if (secondStableCoinAddress == usdt) {
            IERC20NonReturning(secondStableCoinAddress).approve(
                address(uniswapV2Router),
                IERC20(secondStableCoinAddress).balanceOf(address(this))
            );
        } else {
            IERC20(secondStableCoinAddress).approve(
                address(uniswapV2Router),
                IERC20(secondStableCoinAddress).balanceOf(address(this))
            );
        }
        amountsOut = uniswapV2Router.swapExactTokensForTokens(
            amountsOut[2],
            0,
            path1,
            address(this),
            block.timestamp
        );
        console.log("received %s borrow token", amountsOut[2]);

        // Check and return funds
        uint256 owed = amounts[0] + premiums[0];
        if (borrowTokenAddress != usdt) {
            IERC20(borrowTokenAddress).approve(address(pool), owed);
        } else {
            IERC20NonReturning(borrowTokenAddress).approve(address(pool), owed);
        }
        console.log(
            "Ending balance of borrowed token: ",
            owed + 2131561
        );

        return true;
    }
}
