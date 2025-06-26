// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev Mock USDC token for testing purposes
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Faucet function - anyone can get 1000 tokens for testing
     */
    function faucet() public {
        uint256 faucetAmount = 1000 * 10**_decimals; // 1000 tokens
        require(balanceOf(address(this)) >= faucetAmount || owner() == msg.sender, "Faucet empty");
        
        if (balanceOf(address(this)) >= faucetAmount) {
            _transfer(address(this), msg.sender, faucetAmount);
        } else {
            _mint(msg.sender, faucetAmount);
        }
    }

    /**
     * @dev Fund the faucet
     */
    function fundFaucet(uint256 amount) public onlyOwner {
        _mint(address(this), amount);
    }

    /**
     * @dev Emergency drain function
     */
    function emergencyDrain() public onlyOwner {
        uint256 balance = balanceOf(address(this));
        if (balance > 0) {
            _transfer(address(this), owner(), balance);
        }
    }
} 