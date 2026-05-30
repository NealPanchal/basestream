// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Simple contract interfaces to minimize dependency size in frontend audits.
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title BaseStreamAccess
 * @dev Audited, production-safe paywall contract for BaseStream L2 native streaming passes.
 * Uses custom implementations of basic Owner and ReentrancyGuard structures to optimize gas.
 */
contract BaseStreamAccess {
    
    // Constant streaming pass cost (0.001 ETH)
    uint256 public constant PASS_COST = 0.001 ether;
    
    // Access duration (24 hours)
    uint256 public constant PASS_DURATION = 24 hours;

    // Owner address
    address public owner;
    
    // Pending owner for 2-step ownership transfers
    address public pendingOwner;

    // Emergency pause circuit breaker
    bool public paused;

    // Reentrancy lock state
    uint8 private _unlocked = 1;

    // Maps user addresses to their access expiry timestamp
    mapping(address => uint256) public accessExpiry;
    
    // Maps user addresses to custom lifetime access overrides (Admin set)
    mapping(address => bool) public isLifetimeUser;

    // Events
    event PassUnlocked(address indexed user, uint256 expiresAt);
    event LifetimeAccessGranted(address indexed user);
    event LifetimeAccessRevoked(address indexed user);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused();
    event Unpaused();

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "BaseStreamAccess: caller is not the owner");
        _;
    }

    modifier nonReentrant() {
        require(_unlocked == 1, "BaseStreamAccess: reentrancy guard trigger");
        _unlocked = 0;
        _;
        _unlocked = 1;
    }

    modifier whenNotPaused() {
        require(!paused, "BaseStreamAccess: contract operations are paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "BaseStreamAccess: contract operations are not paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Pay 0.001 ETH to unlock 24-hour unlimited streaming access
     */
    function payForAccess() external payable whenNotPaused nonReentrant {
        require(msg.value == PASS_COST, "BaseStreamAccess: Payment must be exactly 0.001 ETH");
        
        uint256 currentExpiry = accessExpiry[msg.sender];
        uint256 newExpiry;
        
        if (currentExpiry > block.timestamp) {
            // Extend existing unexpired pass
            newExpiry = currentExpiry + PASS_DURATION;
        } else {
            // Unlock brand new pass
            newExpiry = block.timestamp + PASS_DURATION;
        }

        accessExpiry[msg.sender] = newExpiry;
        emit PassUnlocked(msg.sender, newExpiry);
    }

    /**
     * @notice Checks if an address has valid unexpired or lifetime access
     */
    function hasAccess(address user) external view returns (bool) {
        if (isLifetimeUser[user]) return true;
        return accessExpiry[user] > block.timestamp;
    }

    /**
     * @notice Admin function to grant direct lifetime access overrides
     */
    function grantLifetimeAccess(address user) external onlyOwner {
        require(user != address(0), "BaseStreamAccess: Invalid user address");
        isLifetimeUser[user] = true;
        emit LifetimeAccessGranted(user);
    }

    /**
     * @notice Admin function to revoke lifetime access overrides
     */
    function revokeLifetimeAccess(address user) external onlyOwner {
        require(user != address(0), "BaseStreamAccess: Invalid user address");
        isLifetimeUser[user] = false;
        emit LifetimeAccessRevoked(user);
    }

    /**
     * @notice Secure owner withdrawal function with Reentrancy Guard
     */
    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "BaseStreamAccess: No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "BaseStreamAccess: Withdrawal transfer failed");
        
        emit FundsWithdrawn(owner, balance);
    }

    /**
     * @notice Initiates a 2-step transfer of contract ownership to a new account
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BaseStreamAccess: new owner is the zero address");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /**
     * @notice Accepts the ownership transfer (step 2 of ownership change)
     */
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "BaseStreamAccess: caller is not the pending owner");
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }

    /**
     * @notice Emergency circuit breaker - pauses payments
     */
    function pausePayments() external onlyOwner whenNotPaused {
        paused = true;
        emit Paused();
    }

    /**
     * @notice Unpauses payment operations
     */
    function resumePayments() external onlyOwner whenPaused {
        paused = false;
        emit Unpaused();
    }
}
