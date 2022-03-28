import { useEffect, useRef, useState } from 'react';
import  { providers, Contract, utils } from 'ethers';
import Web3Modal from 'web3modal';
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '../constants'


export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numTokensMinted, setNumTokensMinted] = useState('');
  const web3ModalRef = useRef();

  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )
      const numTokenIds = await nftContract.tokenIds();
      setNumTokensMinted(numTokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  }

  const presaleMint = async () => {
      
      try {
      setLoading(true);

      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      })
      await txn.wait();
      setLoading(false);

      window.alert("You sucessfullt minted a CryptoDev !!!")
    } catch (error) {
      console.error(error);
    }
  };

  const publicMint = async () => {
    try {
    setLoading(true);

      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.mint({
        value: utils.parseEther("0.01"),
      })

    await txn.wait();

    setLoading(false);
    window.alert("You sucessfullt minted a CryptoDev !!!")
    } catch (error) {
      console.error(error);
    }
  };

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      //get an instance of our NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      
      //get owner address of contract
      // get address of user whose wallet is connected
      //compare the addresses to check if user is the owner or not
      const owner = await nftContract.owner();
      const userAddress = await signer.getAddress();

      if(owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
      
    } catch (error) {
      console.error(error);
    }
  };

  const startPresale = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.startPresale();

      // wait for transaction to finish
      await txn.wait();

      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      //get an instance of our NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      
      // This will return us a big num as it returns us a uint256
      // it will return a timestamp in seconds
      // but JS doesn't accept such big numbers, thus use bigNum func instead of operations
      const presaleEndTime = await nftContract.presaleEnded();

      // this returns time in milli seconds
      // divide it by 1000 to get seconds
      const currentTimeInSeconds = Date.now() / 1000;
      const hasPresaleEnded = presaleEndTime.lt(Math.floor(currentTimeInSeconds));
      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      //get an instance of our NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
      return isPresaleStarted;
    } catch (error) {
      console.error(error);
      return false;
    }
  };


  const connectWallet = async () => {
    //update 'walltetconnected' to true.
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    //access to the provider and signer from metmask
    const provider = await web3ModalRef.current.connect();
    //wrap provider with the ethers provider
    const web3Provider = new providers.Web3Provider(provider);

    //if the user is not connected to rinkeby, tell them to switch to rinkeby
    const{chainId} = await web3Provider.getNetwork();

    if(chainId !== 4){
      window.alert('Change network to rinkeby');
      //throw error so the code does not progress
      throw new Error("Incorrect Network");
    }

    if(needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;

  };

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();
    if(presaleStarted) {
      await checkIfPresaleEnded();
    };
    await getNumMintedTokens();

    //tract in real time the number of minted nfts
    // check it every 5 seconds
    setInterval(async () => {
      await getNumMintedTokens();
    }, 5000)

    //track in real time the status of presale.
    setInterval(async () => {
      const presaleStarted = await checkIfPresaleStarted();
      if(presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5000)
  }


  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        diasbleInjectionProvider: false,
      });

      onPageLoad();
    }
  }, [walletConnected])

  const renderBody = () => {
    if(!walletConnected) {
      <button onClick={connectWallet} className={styles.button} >Connect Wallet</button>
    }

    if(loading) {
      return(
        <button className={styles.button} >Loading...</button>
      )
    }

    if(isOwner && !presaleStarted) {
      //render a button to start presale
      return <button onClick={startPresale} className={styles.button} >Start Presale</button>
    }

    if(!presaleStarted) {
      //just say presale hasn't started
      return (
        <div>
          <div className={styles.description}>Presale hasnt started! Come back Later.</div>
        </div>
      );
    }

    if(presaleStarted && !presaleEnded) {
      //allow users to mint in presale
      //they need to be whitelist for this to work
      return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span className={styles.description}>If your address is whitelisted you can mint a CryptoDev!</span>
          <button onClick={presaleMint} className={styles.button} >Presale Mint 🚀</button>
        </div>
      )
    }

    if(presaleEnded) {
      // allow users to take part in public sale
      return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span className={styles.description}>Presale has ended. You can mint a CryptoDev in public sale, if any remains.</span>
          <button onClick={publicMint} className={styles.button} > Mint 🚀</button>
        </div>
      )
    }
  }
  console.log(loading);
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numTokensMinted}/20 have been minted
          </div>
          {renderBody()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
