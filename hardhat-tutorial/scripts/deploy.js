const { ethers } = require("hardhat");
const { WHITLIST_CONTRACT_ADDRESS, METADATA_URL } = require('../constants');
async function main(){
    const whitelistContract = WHITLIST_CONTRACT_ADDRESS;
    const metadataUrl = METADATA_URL;

    // get contract from folder with the help of ethers
    const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

    const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
        metadataUrl,
        whitelistContract,
    )

    await deployedCryptoDevsContract.deployed();
    //Crypto Devs Contract Address: 0x2B3cd9E2182F12D58b07df19e0Ba173612dA6109

    console.log(
        "Crypto Devs Contract Address:",
        deployedCryptoDevsContract.address
    );
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.log(error);
    process.exit(1);
})