// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SimpleToken
/// @notice OpenZeppelin ERC-20을 사용하는 표준 토큰 예제입니다.
/// @dev 초기 발행량과 추가 민팅 수량은 "토큰 개수" 기준으로 입력받고,
/// 내부적으로 decimals(기본 18)를 반영해 smallest unit로 변환합니다.
/// 표준 ERC-20 함수는 아래에서 모두 명시적으로 노출하고,
/// 실제 로직은 OpenZeppelin ERC20 구현을 사용합니다.
contract SimpleToken is ERC20, Ownable {
    constructor(
        address initialOwner,
        uint256 initialSupply
    ) ERC20("Simple Token", "STK") Ownable(initialOwner) {
        _mint(initialOwner, initialSupply * 10 ** decimals());
    }

    /// @notice owner가 새 토큰을 발행합니다.
    /// @param to 토큰을 받을 주소
    /// @param amount 발행할 토큰 개수 (18 decimals 적용 전)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 10 ** decimals());
    }

    /// @notice 전체 발행량을 반환합니다.
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    /// @notice 계정의 토큰 잔액을 반환합니다.
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

    /// @notice 자신의 토큰을 다른 주소로 전송합니다.
    function transfer(address to, uint256 value) public override returns (bool) {
        return super.transfer(to, value);
    }

    /// @notice spender가 owner 대신 사용할 수 있는 허용량을 반환합니다.
    function allowance(address owner, address spender) public view override returns (uint256) {
        return super.allowance(owner, spender);
    }

    /// @notice spender가 자신의 토큰을 사용할 수 있도록 허용량을 설정합니다.
    function approve(address spender, uint256 value) public override returns (bool) {
        return super.approve(spender, value);
    }

    /// @notice 허용량 범위 내에서 제3자가 토큰을 전송합니다.
    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        return super.transferFrom(from, to, value);
    }
}
