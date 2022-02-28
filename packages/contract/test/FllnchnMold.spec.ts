import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import hre, { ethers } from "hardhat";

chai.use(solidity);
const { expect } = chai;
const MOLD_NAME = "FllnchnModal";
const MOLD_SYMBOL = "FM";

const chocofactoryABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "version",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "deployedContract",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "Deployed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "deploy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "deployWithSig",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "deployWithTypedSig",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "predictDeployResult",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "verifySig",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "verifyTypedSig",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

describe.only("NFT", function () {
  let signer: SignerWithAddress;
  let factoryContract: any;
  let deployedMoldContract: any;
  this.beforeEach(async function () {
    [signer] = await ethers.getSigners();
    factoryContract = new ethers.Contract("0x53B688a8Fb9e6a0bC8ca49bF0bBfddac4696ec72", chocofactoryABI, signer);
    const NFTDescriptorContract = await ethers.getContractFactory("NFTDescriptor");
    const descriptorContract = await NFTDescriptorContract.deploy();
    const FllnchnMoldContract = await ethers.getContractFactory("FllnchnMold", {
      libraries: {
        NFTDescriptor: descriptorContract.address,
      },
    });
    const moldContract = await FllnchnMoldContract.deploy();
    const deployedMold = await factoryContract.predictDeployResult(
      moldContract.address,
      signer.address,
      MOLD_NAME,
      MOLD_SYMBOL
    );
    await factoryContract.deploy(moldContract.address, MOLD_NAME, MOLD_SYMBOL);
    deployedMoldContract = moldContract.attach(deployedMold);
  });
  it("Mint", async function () {
    const name = "Name";
    const seed =
      "0x00061b1b06050002010e0004000101020203010b0004000101050202010100020106000500010106020101020201010500040001010a02010105000400010101020101070201010600030001010a02010106000200010107020101030201010600020001010a02010101020101050002000101020201010702010101020101050002000101040201010402010102020101050003000101080201010302010104000400030104020101040201010300010103000101030202010203050201010100020101000300010106020103060201010300030001010602010306020101030003000101020201010a0201010300010002010302010103020101020201010202010104000101020201010202040102020101010201010102010104000100010102020201030001010102010103020101050002000201060002010202010106000c0002010700";
    const colors = ["000000", "889FB8", "00E6FF"];

    await deployedMoldContract.mintNFT(name, seed, colors, signer.address);
    const uri = await deployedMoldContract.tokenURI(1);
    console.log(uri);
  });
});
