# Functions and Errors

This Solidity program demonstrates the implementation of a smart contract on a frontend with Next.js.

## Description

The program features adding and purchasing of books from an online store through ETH. The `getBalance()` function returns the current Ethereum balance of the account. The `getBooks()` functions retuns an array of the books existing in the storage. The `deposit()` function allows the user to deposit Ethereum on the account. The `addBook()` function allows the user to regsiter or add a new book to the storage. The `purchaseBook()` function lets the user to purchase a book.

## Getting Started

### Executing program

To run this program, you can use Remix, an online Solidity IDE. To get started, go to the Remix website at https://remix.ethereum.org/.

Once you are on the Remix website, create a new file by clicking on the "+" icon in the left-hand sidebar. Save the file with a .sol extension (e.g., CreateToken.sol). Copy and paste the following code into the file:

```javascript
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
  address payable public owner;
  uint256 public balance;

  struct Book {
    string title;
    uint256 price;
  }

  mapping(uint256 => Book) public books;
  uint256 public bookCount;

  event Deposit(uint256 amount);
  event BookAdded(uint256 indexed id, string title, uint256 price);
  event BookPurchased(uint256 indexed id, string title);

  constructor(uint initBalance) payable {
    owner = payable(msg.sender);
    balance = initBalance;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "You are not the owner of this account");
    _;
  }

  function getBalance() public view returns(uint256) {
    return balance;
  }

  function getBooks() public view returns(Book[] memory) {
    Book[] memory allBooks = new Book[](bookCount);
    for (uint256 i = 0; i < bookCount; i++) {
      Book storage book = books[i];
      allBooks[i] = Book({title: book.title, price: book.price});
    }
    return allBooks;
  }

  // deposit Ethereum to the account balance
  function deposit(uint256 _eth) public payable onlyOwner {
    uint _previousBalance = balance;
    balance += _eth;
    assert(balance == _previousBalance + _eth);
    emit Deposit(_eth);
  }

  // add new book to the store
  function addBook(string memory _title, uint256 _price) public onlyOwner {
    require(_price > 0, "Price must be a positive number");
    books[bookCount] = Book({title: _title, price: _price});
    emit BookAdded(bookCount, _title, _price);
    bookCount++;
  }

  // purchase a book from the store
  function purchaseBook(uint256 _id) public payable {
    require(_id < bookCount, "Book ID does not exist");
    Book storage book = books[_id];
    balance -= book.price;
    emit BookPurchased(_id, book.title);
  }
}
```

To compile the code, click on the "Solidity Compiler" tab in the left-hand sidebar. Make sure the "Compiler" option is set to "0.8.7" or newer, and then click on the "Compile CreateToken.sol" button.

Once the code is compiled, you can deploy the contract by clicking on the "Deploy & Run Transactions" tab in the left-hand sidebar. Select the "MyToken" contract from the dropdown menu, and then click on the "Deploy" button.

Once the contract is deployed, you can interact with it by calling the mint or burn function. You can also check the values of the public state variables by clicking on them.

## Authors

Adriane Gil Roa  


## License

This project is licensed under the MIT License - see the LICENSE file for details