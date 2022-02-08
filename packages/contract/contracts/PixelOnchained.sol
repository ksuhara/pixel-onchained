//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {NFTDescriptor} from "./NFTDescriptor.sol";

contract PixelOnchained is ERC721, Ownable {
  using Strings for uint256;
  using SafeMath for uint256;

  mapping(uint256 => string[]) public palettes;
  mapping(uint256 => bytes) public seeds;
  mapping(uint256 => string) public names;
  uint256 private _totalSupply;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function _addColorToPalette(uint256 _paletteIndex, string calldata _color) internal {
    palettes[_paletteIndex].push(_color);
  }

  function mintNFT(
    string calldata name,
    bytes memory seed,
    string[] calldata colors,
    address toAddress
  ) public {
    uint256 tokenId = _totalSupply + 1;
    require(palettes[tokenId].length + colors.length <= 256, "Palettes can only hold 256 colors");
    for (uint256 i = 0; i < colors.length; i++) {
      _addColorToPalette(tokenId, colors[i]);
    }
    names[tokenId] = name;
    seeds[tokenId] = seed;
    _totalSupply++;
    _safeMint(toAddress, tokenId);
  }

  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");
    return dataURI(tokenId);
  }

  /**
   * @notice Given a token ID and seed, construct a base64 encoded data URI for an official Nouns DAO noun.
   */
  function dataURI(uint256 tokenId) public view returns (string memory) {
    string memory name = names[tokenId];
    string memory description = string(abi.encodePacked("Pixel Onchained #", tokenId.toString()));
    return genericDataURI(name, description, tokenId);
  }

  /**
   * @notice Given a name, description, and seed, construct a base64 encoded data URI.
   */
  function genericDataURI(
    string memory name,
    string memory description,
    uint256 tokenId
  ) public view returns (string memory) {
    NFTDescriptor.TokenURIParams memory params = NFTDescriptor.TokenURIParams({
      name: name,
      description: description,
      parts: seeds[tokenId]
    });
    return NFTDescriptor.constructTokenURI(params, palettes[tokenId]);
  }
}
