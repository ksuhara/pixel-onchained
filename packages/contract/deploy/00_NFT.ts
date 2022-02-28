const func = async (hre: any) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const nftDescripter = await deploy("NFTDescriptor", {
    from: deployer,
  });
  await deploy("FllnchnMold", {
    from: deployer,
    args: [],
    libraries: {
      NFTDescriptor: nftDescripter.address,
    },
    log: true,
  });
};

export default func;
module.exports.tags = ["FllnchnMold"];
