const chocofactoryAddresses = {
  "4": "0x354D33a61F2085E7b6B41F1edb7c2742c3e9c78a",
  "137": "0x53B688a8Fb9e6a0bC8ca49bF0bBfddac4696ec72",
  "592": "0x72cc6e601975C3357C749e5e4e97E893F4DEEbcA",
};

const fllnchnMoldAddresses = {
  "4": "0x6C70BAcb256560502a9e35506535c9dEDdb9Be45",
  "137": "0x262c4075Bc8dae427b74Db99286ac2811ad995a9",
  "592": "0xEc9255C57A60335dD838C06846fE6bEF7CAC5BA5",
};

export const explorers = {
  "4": "https://rinkeby.etherscan.io/tx/",
  "137": "https://polygonscan.com/tx/",
  "592": "https://astar.subscan.io/extrinsic/",
};

export type ChainId = "4" | "137" | "592";

export const getContractsForChainId = (chainId: ChainId) => {
  const chocofactoryAddress = chocofactoryAddresses[chainId];
  const fllnchnMoldAddress = fllnchnMoldAddresses[chainId];
  return { chocofactoryAddress, fllnchnMoldAddress };
};
