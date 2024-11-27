import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const [eth, setEth] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [books, setBooks] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [bookId, setBookId] = useState(0);
  
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const handleDeposit = async () => {
    if (eth <= 0)
      setFeedback('ETH should be a positive number.')
    else {
      await deposit()
      setFeedback(`You deposited ${eth} ETH to your account.`)
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
      let tx = await atm.deposit(eth);
      await tx.wait()
      getBalance();
    }
  }

  const loadBooks = async () => {
    if (atm) {
      setBooks((await atm.getBooks()));
    }
  }

  const handleAddBook = async () => {
    await addBook();
    setFeedback('Book has been added.');
    setTitle('');
    setPrice(0);
  }

  const addBook = async () => {
    if (atm) {
      let tx = await atm.addBook(title, price);
      await tx.wait();
      loadBooks();
    }
  }

  const handlePurchase = async () => {
    if (bookId < 0 || bookId >= books.length)
      setFeedback('Book ID is invalid.')
    else if (books[bookId].price.toNumber() > balance)
      setFeedback('Your ETH balance is not enough for this transaction.')
    else {
      if (atm) {
        let tx = await atm.purchaseBook(bookId);
        await tx.wait();
        getBalance();
      }
      setFeedback(`${books[bookId].title} has been purchased for ${books[bookId].price.toNumber()} ETH.`);
      setBookId(0);
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet)
      return <p>Please install Metamask in order to use this ATM.</p>

    // Check to see if user is connected. If not, connect to their account
    if (!account)
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>

    if (balance == undefined)
      getBalance();

    if (books == null)
      loadBooks();

    return (
      <div>
        <p>Your account: {account}</p>
        <p>Your ETH balance: <strong> {balance} ETH </strong></p>
        <div>
          <h3> Deposit ETH to your account </h3>
          <input type="number" value={eth} onChange={n => setEth(n.target.value)} placeholder="ETH" />
          <button onClick={handleDeposit}>Deposit</button>
        </div>
        <div>
          <h3> Current books available </h3>
          {books && books.map((book, ind) => 
            <div id={ind}>
              <span> <strong> #{ind} </strong> </span>
              <span> {book.title} </span>
              <span> - {book.price.toNumber()} ETH </span>
            </div>
          )}
        </div>
        <div>
          <h3> Add a book to the store </h3>
          <p> Title </p>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title of the book" />
          <p> Price </p>
          <input type="number" value={price} onChange={n => setPrice(n.target.value)} />
          <br />
          <button onClick={handleAddBook}> Add book </button>
        </div>
        <div>
          <h3> Purchase a book </h3>
          <p> Book ID </p>
          <input type="number" value={bookId} onChange={n => setBookId(n.target.value)} />
          <button onClick={handlePurchase}> Purchase </button>
        </div>
        <br />
        {feedback && <h4> {feedback} </h4>}
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Online Book Store</h1></header>
      <h3> Purchase books through Ethereum! </h3>
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
