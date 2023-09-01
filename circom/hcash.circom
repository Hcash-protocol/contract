pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";

template Hcash() {
    signal input from;
    signal input nonce;
    signal input txHash;
    signal input amount;
    signal output commitment;
    signal output amountOut;

    component poseidon = Poseidon(4);
    poseidon.inputs[0] <== txHash;
    poseidon.inputs[1] <== nonce;
    poseidon.inputs[2] <== from;
    poseidon.inputs[3] <== amount;
    commitment <== poseidon.out;
    amountOut <== amount;
}
component main = Hcash();