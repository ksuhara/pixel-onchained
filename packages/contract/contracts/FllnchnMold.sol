//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import {NFTDescriptor} from "./NFTDescriptor.sol";

contract FllnchnMold is Initializable, ERC721Upgradeable, OwnableUpgradeable {
  using StringsUpgradeable for uint256;
  using SafeMathUpgradeable for uint256;

  mapping(uint256 => string[]) public palettes;
  mapping(uint256 => bytes) public seeds;
  mapping(uint256 => string) public names;
  uint256 private _totalSupply;
  string public contractName;

  function initialize(
    address _owner,
    string memory _name,
    string memory _symbol
  ) public initializer {
    __Ownable_init_unchained();
    transferOwnership(_owner);
    __ERC721_init_unchained(_name, _symbol);
    contractName = _name;
  }

  function supportsInterface(bytes4 _interfaceId) public view override(ERC721Upgradeable) returns (bool) {
    return super.supportsInterface(_interfaceId);
  }

  function _addColorToPalette(uint256 _paletteIndex, string calldata _color) internal {
    palettes[_paletteIndex].push(_color);
  }

  function mintNFT(
    string calldata name,
    bytes memory seed,
    string[] calldata colors,
    address toAddress
  ) public onlyOwner {
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

  function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable) returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");
    return dataURI(tokenId);
  }

  /**
   * @notice Given a token ID and seed, construct a base64 encoded data URI for an official Nouns DAO noun.
   */
  function dataURI(uint256 tokenId) public view returns (string memory) {
    string memory name = names[tokenId];
    string memory description = string(abi.encodePacked(contractName, " #", tokenId.toString()));
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
