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
