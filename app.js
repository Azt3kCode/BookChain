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

const connectButton = document.getElementById('connectButton');
const statusDiv = document.getElementById('status');
const addBookButton = document.getElementById('addBookButton');
const adminControls = document.getElementById('adminControls');
const editBookForm = document.getElementById('editBookForm');
const submitEditButton = document.getElementById('submitEditButton');
let editingIndex = null;


let currentAccount = null;
let isAdmin = false;

async function init() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            statusDiv.innerText = `${currentAccount}`;

            contract = new web3.eth.Contract(abi, contractAddress);

            // Validar si es admin
            isAdmin = await contract.methods.admins(currentAccount).call();
            if (isAdmin) {
                adminControls.style.display = 'block';
            } else {
                adminControls.style.display = 'none';
            }

            loadBooks();

            connectButton.style.display = 'none';
        } catch (error) {
            console.error("Error al conectar con MetaMask", error);
        }
    } else {
        alert("MetaMask no está instalado.");
    }
}

async function loadBooks() {
    try {
        showLoading();
        const books = await contract.methods.getBooks().call();
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = '';

        books.forEach((book, index) => {
            const article = document.createElement('article');
            article.classList.add('booksList__book');
            article.innerHTML = `
                <div class="book__container">
                    <img class="book__img" src="${book.imageUrl}" alt="${book.title}">
                    <div class="book__info">
                        <span class="book__title">${book.title}</span>
                        <p class="book__author">${book.author} <span class="book__edition">${book.isbn}</span></p>
                        <p class="book__description">${book.description}</p>
                        ${isAdmin ? `
                            <button class="modifyButton" onclick="modifyBook(${index})">Modificar</button>
                            <button class="removeButton" onclick="removeBook(${index})">Eliminar</button>
                        ` : ''}
                    </div>
                </div>
            `;
            bookList.appendChild(article);
        });
    } catch (error) {
        console.error("Error al cargar los libros", error);
    } finally {
        hideLoading();
    }
}

connectButton.addEventListener('click', init);

const bookForm = document.getElementById('bookForm');
const submitBookButton = document.getElementById('submitBookButton');

addBookButton.addEventListener('click', () => {
    if (!isAdmin) return;
    addBookButton.style.display = 'none';
    bookForm.style.display = 'block';
});

submitBookButton.addEventListener('click', async () => {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const isbn = document.getElementById('bookISBN').value;
    const description = document.getElementById('bookDescription').value;
    const imageUrl = document.getElementById('bookImageUrl').value;

    if (!title || !author || !isbn || !description || !imageUrl) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        showLoading();
        await contract.methods.addBook(title, author, isbn, description, imageUrl).send({ from: currentAccount });
        alert("Libro agregado con éxito.");
        loadBooks();

        bookForm.style.display = 'none';
        addBookButton.style.display = 'block';
        document.getElementById('bookTitle').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('bookISBN').value = '';
        document.getElementById('bookDescription').value = '';
        document.getElementById('bookImageUrl').value = '';
    } catch (error) {
        console.error("Error al agregar libro", error);
    } finally {
        hideLoading();
    }
});

submitEditButton.addEventListener('click', async () => {
    const title = document.getElementById('editBookTitle').value;
    const author = document.getElementById('editBookAuthor').value;
    const isbn = document.getElementById('editBookISBN').value;
    const description = document.getElementById('editBookDescription').value;
    const imageUrl = document.getElementById('editBookImageUrl').value;

    if (!title || !author || !isbn || !description || !imageUrl) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        showLoading();
        await contract.methods.modifyBook(editingIndex, title, author, isbn, description, imageUrl).send({ from: currentAccount });
        alert("Libro modificado con éxito.");
        loadBooks();
        editBookForm.style.display = 'none';
        editingIndex = null;
    } catch (error) {
        console.error("Error al modificar libro", error);
    } finally {
        hideLoading();
    }
});



window.modifyBook = async (index) => {
    if (!isAdmin) return;

    editingIndex = index;
    const books = await contract.methods.getBooks().call();
    const book = books[index];

    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookISBN').value = book.isbn;
    document.getElementById('editBookDescription').value = book.description;
    document.getElementById('editBookImageUrl').value = book.imageUrl;

    editBookForm.style.display = 'block';
};


window.removeBook = async (index) => {
    if (!isAdmin) return;

    if (!confirm("¿Estás seguro de eliminar este libro?")) return;

    try {
        showLoading();
        await contract.methods.removeBook(index).send({ from: currentAccount });
        alert("Libro eliminado.");
        loadBooks();
    } catch (error) {
        console.error("Error al eliminar libro", error);
    } finally {
        hideLoading();
    }
};

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}
