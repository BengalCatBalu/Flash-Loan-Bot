pragma solidity ^0.8.13;
import "./interfaces/ILendingPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract FlashLoan {
    ILendingPool pool;

    constructor(address _pool) {
        pool = ILendingPool(_pool);
    }

    function getFlashLoan(address token, uint amount) external {
        console.log(
            "Balance Before Flash loan",
            IERC20(token).balanceOf(address(pool))
        );
        address[] memory tokens = new address[](1);
        tokens[0] = token;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;
        pool.flashLoan(
            address(this),
            tokens,
            amounts,
            modes,
            address(this),
            "0x",
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
        require(msg.sender == address(pool), "not pool");
        require(initiator == address(this));
        require(assets.length == 1);

        IERC20 token = IERC20(assets[0]);
        console.log(
            "contract's token balance during the flash loan: ",
            token.balanceOf(address(this))
        );
        console.log("Flash loan fee: ", premiums[0]);
        console.log("Flash loan amount: ", amounts[0]);

        uint256 owed = amounts[0] + premiums[0];
        token.approve(address(pool), owed);
        return true;
    }
}
