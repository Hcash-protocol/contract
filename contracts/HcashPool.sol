// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Groth16Verifier.sol";

contract HcashPool is ReentrancyGuard {
    mapping(bytes32 => bool) public proof;

    Groth16Verifier _groth16Verifier;

    constructor(Groth16Verifier groth16Verifier) {
        _groth16Verifier = groth16Verifier;
    }

    event Deposit(address from, uint amount);

    event Withdrawl(address recipient);

    receive() external payable {
        require(
            msg.value == 0.1 ether ||
                msg.value == 1 ether ||
                msg.value == 10 ether,
            "Ether must be 0.1, 1 or 10"
        );
        emit Deposit(msg.sender, msg.value);
    }

    function withdrawl(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubOut,
        address _to
    ) external nonReentrant returns (bool) {
        bytes32 _proof = keccak256(
            abi.encodePacked(
                _pA[0],
                _pA[1],
                _pB[0][0],
                _pB[0][1],
                _pB[1][0],
                _pB[1][1],
                _pC[0],
                _pC[1],
                _pubOut[0],
                _pubOut[1]
            )
        );
        require(!proof[_proof], "Double spending");

        require(
            _groth16Verifier.verifyProof(_pA, _pB, _pC, _pubOut),
            "Invalid withdraw proof"
        );

        proof[_proof] = true;

        (bool sent, ) = _to.call{value: _pubOut[0]}("");
        require(sent, "Failed to send Ether");
        emit Withdrawl(_to);
        return true;
    }
}
