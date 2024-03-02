// pragma solidity ^0.8.13;
// import "./interfaces/IPair.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "./interfaces/IUniswapV2Router01.sol";
// import "./interfaces/IUniswapV2Router02.sol";
// import "./interfaces/IUniswapV2Pair.sol";
// import "./interfaces/IUniswapV2Factory.sol";
// import "hardhat/console.sol";


// contract FlashSwap {
//     address private constant UNISWAP_FACTORY =
//         0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
//     address private constant UNISWAP_ROUTER =
//         0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
//     address private constant SUSHI_FACTORY =
//         0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
//     address private constant SUSHI_ROUTER =
//         0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;

//     IPair pair;
//     address token;

//     constructor(address _pair) {
//         pair = IPair(_pair);
//     }

//     function placeTrade(
//         address _fromToken,
//         address _toToken,
//         uint256 _amountIn,
//         address factory,
//         address router
//     ) private returns (uint256) {
//         address pair = IUniswapV2Factory(factory).getPair(_fromToken, _toToken);
//         require(pair != address(0), "Pool does not exist");

//         // Calculate Amount Out
//         address[] memory path = new address[](2);
//         path[0] = _fromToken;
//         path[1] = _toToken;

//         uint256 amountRequired = IUniswapV2Router01(router).getAmountsOut(
//             _amountIn,
//             path
//         )[1];

//         // console.log("amountRequired", amountRequired);

//         // Perform Arbitrage - Swap for another token
//         uint256 amountReceived = IUniswapV2Router01(router)
//             .swapExactTokensForTokens(
//                 _amountIn, // amountIn
//                 amountRequired, // amountOutMin
//                 path, // path
//                 address(this), // address to
//                 deadline // deadline
//             )[1];

//         // console.log("amountRecieved", amountReceived);

//         require(amountReceived > 0, "Aborted Tx: Trade returned zero");

//         return amountReceived;
//     }

//     // TODO: Implement this function
//     function executeFlashSwap(address _token, uint256 _amount) external {
//         IERC20(pair.token0()).safeApprove(address(UNISWAP_ROUTER), MAX_INT);
//         IERC20(pair.token1()).safeApprove(address(UNISWAP_ROUTER), MAX_INT);
//         IERC20(pair.token0()).safeApprove(address(SUSHI_ROUTER), MAX_INT);
//         IERC20(pair.token1()).safeApprove(address(SUSHI_ROUTER), MAX_INT);

//         // Passing data as bytes so that the 'swap' function knows it is a flashloan
//         bytes memory data = abi.encode(_token, _amount, msg.sender);
//         console.log(
//             "Contract token balance before flash swap: ",
//             IERC20(_token).balanceOf(address(this))
//         );
//         // console.log("token 1: ", pair.token1());
//         // console.log("token 0: ", pair.token0());
//         token = _token;
//         if (_token == pair.token0()) {
//             pair.swap(_amount, 0, address(this), data);
//         } else if (_token == pair.token1()) {
//             pair.swap(0, _amount, address(this), data);
//         } else {
//             revert("FlashSwap: Token not found in pair");
//         }
//     }

//     function checkProfitability(
//         uint256 _input,
//         uint256 _output
//     ) private returns (bool) {
//         return _output > _input;
//     }

//     // TODO: Implement this function
//     function uniswapV2Call(
//         address sender,
//         uint amount0,
//         uint amount1,
//         bytes calldata data
//     ) external {
//         require(msg.sender == address(pair), "FlashSwap: Unauthorized");
//         require(sender == address(this), "FlashSwap: Unauthorized");
//         (address tokenBorrow, uint256 amount, address myAddress) = abi.decode(
//             _data,
//             (address, uint256, address)
//         );
//         console.log(
//             "Contract token balance after flash swap: ",
//             IERC20(token).balanceOf(address(this))
//         );
//         uint256 fee;
//         uint256 owed;
//         uint256 fee = ((amount * 3) / 997) + 1;
//         uint256 owed = amount + fee;
//         console.log("Fee: ", fee);
//         console.log("Owed: ", owed);
//         IERC20(token).transfer(address(pair), owed);
//     }
// }
