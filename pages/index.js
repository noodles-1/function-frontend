import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const [usd, setUsd] = useState(0);
  const [eth, setEth] = useState(0);
  const [feedback, setFeedback] = useState(null)
  
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const handleUsd = async () => {
    if (usd <= 0)
      setFeedback('USD should be a positive number.')
    else {
      await deposit()
      setFeedback(`$${usd} USD successfully exchanged to ${Math.ceil(usd * 0.00029)} ETH.`)
    }
  }

  const handleEth = async () => {
    if (eth <= 0)
      setFeedback('ETH should be a positive number.')
    else if (balance < eth)
      setFeedback('Current ETH balance is not sufficient for this transaction.')
    else {
      await withdraw()
      setFeedback(`You withdrew $${eth * 3487.63} USD worth of ETH.`)
    }
  }
  
  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async () => {
    if (atm) {
      let tx = await atm.depositFromUsd(Math.ceil(usd * 0.00029));
      await tx.wait()
      getBalance();
    }
  }

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdrawToUsd(eth);
      await tx.wait()
      getBalance();
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your account: {account}</p>
        <p>Your ETH balance: <strong> {balance} ETH </strong></p>
        <div>
          <h3> Exchange USD to Ethereum ($1 USD = 0.00029 ETH) </h3>
          <input type="number" value={usd} onChange={n => setUsd(n.target.value)} placeholder="USD" />
          <button onClick={handleUsd}>Deposit to ETH</button>
        </div>
        <br />
        <div>
          <h3> Exchange Ethereum to USD (1 ETH = $3487.63 USD) </h3>
          <input type="number" value={eth} onChange={n => setEth(n.target.value)} placeholder="ETH" />
          <button onClick={handleEth}>Withdraw to USD</button>
        </div>
        {feedback && <h4> {feedback} </h4>}
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>USD to Ethereum Exchange</h1></header>
      <h3> Exchange your USD to Ethereum, and vice versa! </h3>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}
      </style>
    </main>
  )
}
