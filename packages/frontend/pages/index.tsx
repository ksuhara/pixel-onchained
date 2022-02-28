import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Image,
  Input,
  Text,
  VisuallyHidden,
  Icon,
  Spinner,
  Flex,
  Link,
  HStack,
  VStack,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import React from "react";
import contract from "../constants/contract.json";
import { ethers } from "ethers";
import { Header } from "../components/Header";
import { FaAngleDoubleDown, FaCheckCircle } from "react-icons/fa";
import { getContractsForChainId, ChainId, explorers } from "../lib/web3";

const { fllnchnAbi, chocofactoryAbi } = contract;

declare global {
  interface Window {
    ethereum: any;
  }
}

const Home: NextPage = () => {
  const [chainId, setChainId] = React.useState<ChainId>("4");
  const [contractName, setContractName] = React.useState("");
  const [symbol, setSymbol] = React.useState("");
  const [moldAddress, setMoldAddress] = React.useState("");
  const [image, setImage] = React.useState("");
  const [rle, setRle] = React.useState("");
  const [svgString, setSvgString] = React.useState("");
  const [colors, setColors] = React.useState("");
  const [name, setName] = React.useState("");
  const [currentAccount, setCurrentAccount] = React.useState(null);
  const [error, setError] = React.useState("");
  const [mintingStatus, setMintingStatus] = React.useState("ended");
  const [txHash, setTxHash] = React.useState("");
  const [deployStatus, setDeployStatus] = React.useState("ended");
  const [deployTxHash, setDeployTxHash] = React.useState("");

  const generateSeed = (event: any) => {
    event.preventDefault();
    setTxHash("");
    setMintingStatus("");
    setError("");
    axios
      .post("/api/generate-seed", {
        file: image,
      })
      .then(function (response: any) {
        setRle(response.data.rle);
        const buff = new Buffer(response.data.svg);
        const base64data = buff.toString("base64");
        setSvgString(base64data);
        setColors(response.data.hexColors);
      })
      .catch(function (err: any) {
        console.error(err);
        setError("png file invalid");
      });
  };

  const uploadPicture = (e: any) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImage("");
    }
  };

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
      window.open(
        "https://metamask.app.link/dapp/https://pixel-onchained.vercel.app/"
      );
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const { fllnchnMoldAddress } = getContractsForChainId(chainId);
        const moldContract = new ethers.Contract(
          fllnchnMoldAddress,
          fllnchnAbi,
          provider
        );

        const address = signer.getAddress();

        let nftTxn = await moldContract
          .attach(moldAddress)
          .connect(signer)
          .mintNFT(name, rle, colors, address);

        console.log("Mining... please wait");
        setMintingStatus("started");
        setTxHash(nftTxn.hash);
        await nftTxn.wait();
        setMintingStatus("ended");

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    checkWalletIsConnected();
    // const data = [
    //   {
    //     chainId: "0x89",
    //     chainName: "Matic Network",
    //     nativeCurrency: {
    //       name: "Matic",
    //       symbol: "Matic",
    //       decimals: 18,
    //     },
    //     rpcUrls: ["https://rpc-mainnet.matic.network/"],
    //     blockExplorerUrls: ["https://polygonscan.com/"],
    //   },
    // ];
    // if (window.ethereum) {
    //   window.ethereum.request({
    //     method: "wallet_addEthereumChain",
    //     params: data,
    //   });
    // }
  }, []);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const onClickButton = () => {
    setTxHash("");
    setMintingStatus("");
    setSvgString("");
    setError("");
    inputRef.current?.click();
  };

  const deployNewContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    console.log(chainId);
    const { chocofactoryAddress, fllnchnMoldAddress } =
      getContractsForChainId(chainId);
    const chocofactoryContract = new ethers.Contract(
      chocofactoryAddress,
      chocofactoryAbi,
      provider
    );

    const signerAddress = await signer.getAddress();
    const deployedMold = await chocofactoryContract.predictDeployResult(
      fllnchnMoldAddress,
      signerAddress,
      contractName,
      symbol
    );
    let deployTxn = await chocofactoryContract
      .connect(signer)
      .deploy(fllnchnMoldAddress, contractName, symbol);

    setDeployStatus("started");
    setDeployTxHash(deployTxn.hash);
    await deployTxn.wait();
    setDeployStatus("ended");
    setMoldAddress(deployedMold);
    console.log(deployedMold, "deployedMold");
  };

  return (
    <>
      <Container maxW="container.xl" textAlign="center" pb="10">
        <Header />
        <Box as="section">
          <Box
            maxW="2xl"
            mx="auto"
            px={{ base: "6", lg: "8" }}
            py={{ base: "4", sm: "4" }}
            textAlign="center"
          >
            <Heading size="3xl" fontWeight="extrabold" letterSpacing="tight">
              Ready to Onchain?
            </Heading>
            <Text mt="4" fontSize="lg">
              Mint your Full-Onchain pixel art NFT and immutable it.
            </Text>
          </Box>
          <Box my="8">
            <Heading mt="2" fontSize="xl">
              ① Select Chain
            </Heading>
            <Select
              w={{ base: "xs", sm: "md" }}
              mx="auto"
              onChange={(e) => setChainId(e.target.value as ChainId)}
              value={chainId}
            >
              <option value="4">Rinkeby</option>
              <option value="137">Polygon mainnet</option>
            </Select>
          </Box>
          <VStack my="8">
            <Heading mt="2" fontSize="xl">
              ②Deploy new contract ※First timers only.
            </Heading>
            <Text mt="2">
              If you already have a contract, please skip this and proceed to ②
              Input your contract address.
            </Text>
            <Input
              placeholder="contract name(=collection name)"
              my="1"
              w={{ base: "xs", sm: "md" }}
              variant="filled"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
            ></Input>
            <Input
              placeholder="symbol"
              my="1"
              w={{ base: "xs", sm: "md" }}
              variant="filled"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            ></Input>
            <Button
              mt="8"
              size="lg"
              colorScheme="blue"
              fontWeight="bold"
              onClick={deployNewContract}
            >
              Deploy
            </Button>
            {deployTxHash && (
              <Center>
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  alignItems={"center"}
                >
                  <Link
                    href={`${explorers[chainId]}tx/${deployTxHash}`}
                    isExternal
                  >
                    <Text
                      mx="2"
                      isTruncated
                      w={{ base: "sm", sm: "md" }}
                    >{`see transaction: ${explorers[chainId]}tx/${deployTxHash}`}</Text>
                  </Link>
                  {deployStatus == "started" && <Spinner />}
                  {deployStatus == "ended" && (
                    <Icon as={FaCheckCircle} w={8} h={8} color="green"></Icon>
                  )}
                </Flex>
              </Center>
            )}
            <Text mt="2">
              Write this contract address down and keep it for yourself. This
              service will not save it.
            </Text>
            <Heading mt="2" fontSize="xl">
              ② Input your contract address
            </Heading>
            <Input
              placeholder="0x..."
              my="1"
              w={{ base: "xs", sm: "md" }}
              variant="filled"
              value={moldAddress}
              onChange={(e) => setMoldAddress(e.target.value)}
            ></Input>
          </VStack>
          <Box>
            <Button
              mt="8"
              size="lg"
              colorScheme="blue"
              fontWeight="bold"
              onClick={onClickButton}
              disabled={!moldAddress}
            >
              ③Select your Pixel Art
            </Button>
            <Text mt="2">
              Must be 32×32 png file. Colors should be less than 256
            </Text>
          </Box>
          <Icon as={FaAngleDoubleDown} w={8} h={8}></Icon>

          <form onSubmit={generateSeed}>
            <VisuallyHidden>
              <input
                type="file"
                ref={inputRef}
                hidden
                onChange={(e) => {
                  uploadPicture(e);
                }}
              />
            </VisuallyHidden>
            {image ? (
              <Center>
                <Image src={image} w="32" alt=""></Image>{" "}
              </Center>
            ) : (
              <Center>
                <Image src={"back.png"} w="32" alt=""></Image>{" "}
              </Center>
            )}
            <br />
            <Button
              my="4"
              size="lg"
              colorScheme="blue"
              fontWeight="bold"
              type="submit"
              name="upload"
              disabled={!image}
            >
              ④Generate SVG
            </Button>
          </form>
        </Box>

        <Box as="section">
          <Icon as={FaAngleDoubleDown} w={8} h={8}></Icon>
          {error ? (
            <Text color={"red"} my="4">
              .png format invalid. Please try again!
            </Text>
          ) : (
            <></>
          )}
          {svgString ? (
            <Center mb="8">
              <img src={`data:image/svg+xml;base64, ${svgString}`} alt=""></img>
            </Center>
          ) : (
            <></>
          )}
          <Text>Token Name</Text>
          <Input
            placeholder="type your token name"
            my="1"
            w={{ base: "xs", sm: "md" }}
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Input>
        </Box>
        {currentAccount ? (
          <Button
            my="4"
            size="lg"
            colorScheme="blue"
            fontWeight="bold"
            onClick={mintNftHandler}
            disabled={!svgString}
          >
            ⑤Mint Pixel
          </Button>
        ) : (
          <Button
            my="4"
            size="lg"
            colorScheme="blue"
            fontWeight="bold"
            onClick={connectWalletHandler}
          >
            ConnectWallet
          </Button>
        )}
        {txHash && (
          <Center>
            <Flex
              direction={{ base: "column", sm: "row" }}
              alignItems={"center"}
            >
              <Link href={`${explorers[chainId]}tx/${txHash}`} isExternal>
                <Text
                  mx="2"
                  isTruncated
                  w={{ base: "sm", sm: "md" }}
                >{`see transaction: ${explorers[chainId]}tx/${txHash}`}</Text>
              </Link>
              {mintingStatus == "started" && <Spinner />}
              {mintingStatus == "ended" && (
                <Icon as={FaCheckCircle} w={8} h={8} color="green"></Icon>
              )}
            </Flex>
          </Center>
        )}
      </Container>
    </>
  );
};

export default Home;
