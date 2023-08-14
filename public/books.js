import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import app from "./F7App.js";

const $$ = Dom7;

let sUser;


$$(document).on('click', '#show-my-books', fetchAndDisplayBooks);
$$(document).on('click', '#button-operation', boughtBook);

document.body.addEventListener('click', function (e) {
    if (e.target.classList.contains('button-operation')) {
        boughtBook(e.target.getAttribute('data-key'));
    } else if (e.target.classList.contains('button-operation-red')) {
        deleteBook(e.target.getAttribute('data-key'));
    }
});





// 1. Fetch and display books
function fetchAndDisplayBooks() {
    console.log('fetchAndDisplayBooks')
    const sUser = firebase.auth().currentUser.uid || "";
    firebase.database().ref("books/" + sUser).on("value", (snapshot) => {
        let bookHTML = "";
        const oBooks = snapshot.val();//book-item
        if (!oBooks) {
            bookHTML += `<h1 class='books-heading'>You don't have any books in your account. Please add new books or search for books online.</h1>`;
        } else {
            $$("#book-list").html('');
            const aKeys = Object.keys(oBooks);

            for (let key of aKeys) {
                const book = oBooks[key];
                const purchasedClass = book.datePurchased ? 'purchased' : '';
                bookHTML += `
             <div class="book-item ${purchasedClass}">
          <p><strong>Title: ${book.title}</strong></p>
          <img src="${book.cover}" alt="${book.title}">
          <p>Author: ${book.author}</p>
          <p>Genre: ${book.genre}</p>
          <p>Published Date: ${book.date}</p>
          <button class="button-operation" data-key="${key}">I bought this</button>
          <button class="button-operation-red" data-key="${key}">I don't need this</button>
          </div>
            `;
            }
        }
        $$("#bookList").html(bookHTML);
    });
}

// 2. Open the add/edit book modal
function openAddBookModal() {
    app.sheet.open('.my-sheet');
}

// 3. Add a new book to Firebase
function addBookToFirebase() {
    const oData = {
        title: $$('#bookTitle').val(),
        author: $$('#bookAuthor').val(),
        genre: $$('#bookGenre').val(),
        publishedDate: $$('#publishedDate').val(),
        coverUrl: $$('#coverUrl').val()
    };
    firebase.database().ref("books/" + sUser).push(oData);
    app.sheet.close('.my-sheet', true);
}

// 4. "I bought this" and "I don't need this" functionalities
function boughtBook(key) {
    const sUser = firebase.auth().currentUser.uid || "";
    console.log(sUser)
    console.log(firebase.database().ref("books/" + sUser + "/" + key));
    const datePurchased = new Date().toISOString();
    firebase.database().ref("books/" + sUser + "/" + key).update({ datePurchased });
}

function deleteBook(key) {
    const sUser = firebase.auth().currentUser.uid || "";
    console.log("delete book ")
    firebase.database().ref("books/" + sUser + "/" + key).remove();
}

// Initial fetch and display of books
$$("#tab2").on("tab:show", () => {
    const user = firebase.auth().currentUser.uid || "";
    console.log(user);
    firebase.database().ref('books/' + user).on('value', (snapshot) => {
        const books = snapshot.val();
        console.log(books);
        // Use this data to populate your app UI
    });

    console.log("tab:show");
    fetchAndDisplayBooks();

});


