// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookChain_Contract {
    address public owner;
    
    struct Book {
        string title;
        string author;
        string isbn;
        string description;
        string imageUrl;
    }

    Book[] public books;

    mapping(address => bool) public admins;

    modifier onlyAdmin() {
        require(admins[msg.sender], "Solo los administradores pueden ejecutar esta funcion");
        _;
    }

    function addAdmin(address _admin) public {
        require(msg.sender == owner, "Solo el owner puede agregar administradores");
        admins[_admin] = true;
    }

    function removeAdmin(address _admin) public {
        require(msg.sender == owner, "Solo el owner puede eliminar administradores");
        admins[_admin] = false;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    function addBook(string memory _title, string memory _author, string memory _isbn, string memory _description, string memory _imageUrl) public onlyAdmin {
        books.push(Book({
            title: _title,
            author: _author,
            isbn: _isbn,
            description: _description,
            imageUrl: _imageUrl
        }));
    }

    function getBooks() public view returns (Book[] memory) {
        return books;
    }

    function modifyBook(uint _index, string memory _title, string memory _author, string memory _isbn, string memory _description, string memory _imageUrl) public onlyAdmin {
        require(_index < books.length, "Indice fuera de rango");
        
        Book storage book = books[_index];
        book.title = _title;
        book.author = _author;
        book.isbn = _isbn;
        book.description = _description;
        book.imageUrl = _imageUrl;
    }

    function removeBook(uint _index) public onlyAdmin {
        require(_index < books.length, "Indice fuera de rango");
        
        books[_index] = books[books.length - 1];
        books.pop();
    }
}
