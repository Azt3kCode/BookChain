let web3;
let contract;
const contractAddress = '0x1bb1b80e0c0538a91230912a1C003a0a2803400C'; // Dirección de tu contrato desplegado
const abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "getBooks",
        "outputs": [
            {
                "components": [
                    { "name": "title", "type": "string" },
                    { "name": "author", "type": "string" },
                    { "name": "isbn", "type": "string" },
                    { "name": "description", "type": "string" },
                    { "name": "imageUrl", "type": "string" }
                ],
                "name": "",
                "type": "tuple[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "name": "_title", "type": "string" },
            { "name": "_author", "type": "string" },
            { "name": "_isbn", "type": "string" },
            { "name": "_description", "type": "string" },
            { "name": "_imageUrl", "type": "string" }
        ],
        "name": "addBook",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "name": "_index", "type": "uint256" },
            { "name": "_title", "type": "string" },
            { "name": "_author", "type": "string" },
            { "name": "_isbn", "type": "string" },
            { "name": "_description", "type": "string" },
            { "name": "_imageUrl", "type": "string" }
        ],
        "name": "modifyBook",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "name": "_index", "type": "uint256" }
        ],
        "name": "removeBook",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "_address", "type": "address" }],
        "name": "admins",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

async function init() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);  // Asegúrate de que Web3 esté cargado
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            contract = new web3.eth.Contract(abi, contractAddress);
            document.getElementById('connectButton').innerText = 'Conectado a MetaMask';
            loadBooks();
            checkAdmin();
        } catch (error) {
            console.error("Error al conectar con MetaMask", error);
        }
    } else {
        alert("MetaMask no está instalado. Por favor, instálalo.");
    }
}

async function loadBooks() {
    try {
        const books = await contract.methods.getBooks().call();
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = ''; // Limpiar lista antes de cargar
        books.forEach((book, index) => {
            const listItem = document.createElement('article');
            listItem.classList.add('booksList__book');
            listItem.innerHTML = `
                <div class="book__container">
                    <img class="book__img" src="${book.imageUrl}" alt="${book.title}">
                    <div class="book__info">
                        <span class="book__title">${book.title}</span>
                        <p class="book__author">${book.author}</p>
                        <p class="book__description">${book.description}</p>
                        <button class="modifyButton" onclick="modifyBook(${index})">Modificar</button>
                        <button class="removeButton" onclick="removeBook(${index})">Eliminar</button>
                    </div>
                </div>
            `;
            bookList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error al cargar los libros", error);
    }
}

async function checkAdmin() {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    
    if (account) {
        try {
            const isAdmin = await contract.methods.admins(account).call();
            if (!isAdmin) {
                document.getElementById('addBookButton').disabled = true;
                alert('No tienes permisos de administrador para agregar libros.');
            } else {
                document.getElementById('addBookButton').disabled = false;
            }
        } catch (error) {
            console.error("Error al verificar el administrador", error);
        }
    } else {
        alert('Por favor, conéctate a MetaMask.');
    }
}

async function addBook() {
    const title = prompt('Ingrese el título del libro:');
    const author = prompt('Ingrese el autor del libro:');
    const isbn = prompt('Ingrese el ISBN del libro:');
    const description = prompt('Ingrese una descripción del libro:');
    const imageUrl = prompt('Ingrese la URL de la imagen del libro:');

    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    try {
        await contract.methods.addBook(title, author, isbn, description, imageUrl)
            .send({ from: account });
        alert("Libro agregado con éxito.");
        loadBooks(); // Recargar la lista de libros
    } catch (error) {
        console.error("Error al agregar el libro", error);
        alert("Hubo un error al agregar el libro.");
    }
}

async function modifyBook(index) {
    const title = prompt('Ingrese el nuevo título del libro:');
    const author = prompt('Ingrese el nuevo autor del libro:');
    const isbn = prompt('Ingrese el nuevo ISBN del libro:');
    const description = prompt('Ingrese una nueva descripción del libro:');
    const imageUrl = prompt('Ingrese la nueva URL de la imagen del libro:');

    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    try {
        await contract.methods.modifyBook(index, title, author, isbn, description, imageUrl)
            .send({ from: account });
        alert("Libro modificado con éxito.");
        loadBooks(); // Recargar la lista de libros
    } catch (error) {
        console.error("Error al modificar el libro", error);
        alert("Hubo un error al modificar el libro.");
    }
}

async function removeBook(index) {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    try {
        await contract.methods.removeBook(index).send({ from: account });
        alert("Libro eliminado con éxito.");
        loadBooks(); // Recargar la lista de libros
    } catch (error) {
        console.error("Error al eliminar el libro", error);
        alert("Hubo un error al eliminar el libro.");
    }
}

// Conectar MetaMask cuando el usuario haga clic
document.getElementById('connectButton').addEventListener('click', init);

// Agregar libro
document.getElementById('addBookButton').addEventListener('click', addBook);
