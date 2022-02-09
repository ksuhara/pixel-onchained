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
} from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import React from "react";
import contract from "../constants/contract.json";
import { ethers } from "ethers";
import { Header } from "../components/Header";
import { FaAngleDoubleDown, FaCheckCircle } from "react-icons/fa";

const contractAddress = "0x25aEB6785C52C8A0F0bAa2F6de29D8cDF6f1E77C";
const abi = contract.abi;

declare global {
  interface Window {
    ethereum: any;
  }
}

const Home: NextPage = () => {
  const [image, setImage] = React.useState("");
  const [rle, setRle] = React.useState("");
  const [svgString, setSvgString] = React.useState("");
  const [colors, setColors] = React.useState("");
  const [name, setName] = React.useState("");
  const [currentAccount, setCurrentAccount] = React.useState(null);
  const [error, setError] = React.useState("");
  const [mintingStatus, setMintingStatus] = React.useState("ended");
  const [txHash, setTxHash] = React.useState("");

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
        const nftContract = new ethers.Contract(contractAddress, abi, signer);
        const address = signer.getAddress();

        let nftTxn = await nftContract.mintNFT(name, rle, colors, address);

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
  }, []);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const onClickButton = () => {
    setTxHash("");
    setMintingStatus("");
    setSvgString("");
    setError("");
    inputRef.current?.click();
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
              Full-Onchain your pixel art and immutable it. Using Polygon chain
              right now.
            </Text>
            <Button
              mt="8"
              size="lg"
              colorScheme="blue"
              fontWeight="bold"
              onClick={onClickButton}
            >
              ①Select your Pixel Art
            </Button>
            <Text mt="2">Must be 32×32 png file</Text>
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
            >
              ②Generate SVG
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
          >
            ③Mint Pixel
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
              <Link
                href={`https://rinkeby.etherscan.io/tx/${txHash}`}
                isExternal
              >
                <Text
                  mx="2"
                  isTruncated
                  w={{ base: "sm", sm: "md" }}
                >{`see transaction: https://rinkeby.etherscan.io/tx/${txHash}`}</Text>
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
