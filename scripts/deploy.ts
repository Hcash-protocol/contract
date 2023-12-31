import "dotenv/config";
import fs from "fs";
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Contracts: Array<{
    name: string;
    args: any[];
    path: string;
    after?: Array<{
      contract: string;
      name: string;
      args: any[];
    }>;
  }> = [
    {
      name: "Groth16Verifier",
      args: [],
      path: "",
    },
    {
      name: "HcashPool",
      args: ["Groth16Verifier:address"],
      path: "",
    },
  ];
  let contractDeployed: any = {};
  for (const contract of Contracts) {
    const contractFactory = await ethers.getContractFactory(contract.name);

    const inputContract = contract.args.map((arg) => {
      if (arg.includes(":")) {
        const [name, type] = arg.split(":");
        return contractDeployed[name][type];
      } else {
        return arg;
      }
    });
    const deployContract = await contractFactory.deploy(...inputContract);

    await deployContract.deployed();

    const contractCompileFilePath = `../artifacts/contracts/${contract.path}/${contract.name}.sol/${contract.name}.json`;
    contractDeployed[contract.name] = {
      address: deployContract.address,
      abi: require(contractCompileFilePath).abi,
      contractName: require(contractCompileFilePath).contractName,
      input: inputContract,
      path: contract.path,
    };
    console.log(
      `The contract ${
        contractDeployed[contract.name].contractName
      } has been deployed to: ${
        deployContract.address
      } with constructor param ${inputContract}`
    );
    if (contract.after) {
      for (const interact of contract.after) {
        const contractInteract = await ethers.getContractFactory(
          interact.contract
        );
        const contractInteractInstance = contractInteract.attach(
          contractDeployed[interact.contract].address
        );

        const inputInteract = interact.args.map((arg) => {
          if (arg.includes(":")) {
            const [name, type] = arg.split(":");
            return contractDeployed[name][type];
          } else {
            return arg;
          }
        });
        await contractInteractInstance[interact.name](...inputInteract);
        console.log(
          `Interact ${interact.name} with ${interact.contract}, args: ${inputInteract}`
        );
      }
    }
  }
  fs.writeFileSync("./abi.json", JSON.stringify(contractDeployed));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
