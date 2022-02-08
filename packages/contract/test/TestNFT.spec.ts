import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import hre, { ethers } from "hardhat";

chai.use(solidity);
const { expect } = chai;

describe("NFT", function () {
  let signer: SignerWithAddress;
  let nftContract: any;
  this.beforeEach(async function () {
    [signer] = await ethers.getSigners();
    const NFTDescriptorContract = await ethers.getContractFactory("NFTDescriptor");
    const descriptorContract = await NFTDescriptorContract.deploy();
    const NFTContract = await ethers.getContractFactory("PixelOnchained", {
      libraries: {
        NFTDescriptor: descriptorContract.address,
      },
    });
    nftContract = await NFTContract.deploy("Pixel Onchained", "PXL");
  });
  it("Mint", async function () {
    const name = "Name";
    const seed =
      "0x00061b1b06050002010e0004000101020203010b0004000101050202010100020106000500010106020101020201010500040001010a02010105000400010101020101070201010600030001010a02010106000200010107020101030201010600020001010a02010101020101050002000101020201010702010101020101050002000101040201010402010102020101050003000101080201010302010104000400030104020101040201010300010103000101030202010203050201010100020101000300010106020103060201010300030001010602010306020101030003000101020201010a0201010300010002010302010103020101020201010202010104000101020201010202040102020101010201010102010104000100010102020201030001010102010103020101050002000201060002010202010106000c0002010700";
    const colors = ["000000", "889FB8", "00E6FF"];

    const receipt = await nftContract.mintNFT(name, seed, colors, signer.address);
    console.log(receipt.gasLimit.toNumber());
    const uri = await nftContract.tokenURI(1);
    console.log(uri);
  });
});
