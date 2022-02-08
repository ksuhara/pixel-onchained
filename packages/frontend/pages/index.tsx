import { Box, Button, Container, Image, Input, Text } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import React from "react";
import contract from "../constants/contract.json";
import { ethers } from "ethers";

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

  const generateSeed = (event: any) => {
    event.preventDefault();
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
        console.log(err);
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
        await nftTxn.wait();

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

  return (
    <>
      <Container maxW="container.xl" textAlign="center">
        <Box mt="24">
          <form onSubmit={generateSeed}>
            <input
              type="file"
              name="image"
              onChange={(e) => {
                uploadPicture(e);
              }}
            />
            {image ? <Image src={image} w="32" alt=""></Image> : <></>}
            <br />
            <Button
              my="4"
              w="full"
              colorScheme="blue"
              type="submit"
              name="upload"
            >
              Generate Seed
            </Button>
          </form>
        </Box>
        <Text>seed</Text>
        <Input my="1" variant="filled" value={rle} readOnly></Input>
        <Text>Colors</Text>
        <Input my="1" variant="filled" value={colors} readOnly></Input>
        <Text>Token Name</Text>
        <Input
          placeholder="type your token name"
          my="1"
          variant="filled"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></Input>

        {svgString ? (
          <Box mb="8">
            <img src={`data:image/svg+xml;base64, ${svgString}`} alt=""></img>
          </Box>
        ) : (
          <></>
        )}
        {currentAccount ? (
          <Button my="4" w="full" colorScheme="blue" onClick={mintNftHandler}>
            Mint Pixel
          </Button>
        ) : (
          <Button
            my="4"
            w="full"
            colorScheme="blue"
            onClick={connectWalletHandler}
          >
            ConnectWallet
          </Button>
        )}
      </Container>
    </>
  );
};

export default Home;
