const func = async (hre: any) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const nftDescripter = await deploy("NFTDescriptor", {
    from: deployer,
  });
  await deploy("PixelOnchained", {
    from: deployer,
    args: ["Pixel Onchained", "PXL"],
    libraries: {
      NFTDescriptor: nftDescripter.address,
    },
    log: true,
  });
};

export default func;
module.exports.tags = ["PixelOnchained"];
