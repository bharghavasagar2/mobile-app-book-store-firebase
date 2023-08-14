import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import config from "./firebase.js";
import app from "./F7App.js";
import "./books.js";

firebase.initializeApp(config);
const $$ = Dom7;

// Firebase Auth Listener
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        app.tab.show("#tab2", true);
        console.log(user);
    } else {
        app.tab.show("#tab1", true);
        console.log("logged out");
    }
});

function addComicBook(bookData) {
    document.getElementById("bookTitle").value = bookData.title || "";
    document.getElementById("bookAuthor").value = bookData.author_name ? bookData.author_name.join(', ') : "";
    document.getElementById("bookGenre").value = bookData.subject ? bookData.subject.join(', ') : "";
    document.getElementById("publishedDate").value = bookData.publish_date ? bookData.publish_date[0] : "";
    document.getElementById("coverUrl").value = bookData.cover_i ? `https://covers.openlibrary.org/b/id/${bookData.cover_i}-M.jpg` : "";
    app.sheet.open('.my-sheet');
}


// Event Listeners

$$(document).on('click', '#googleSignInButton', signInWithGoogle);
$$(document).on('click', '#startSearchButton', startSearch);
$$(document).on('submit', '#loginForm', signInWithEmailAndPassword);
$$(document).on('submit', '#signUpForm', signUpWithEmailAndPassword);
$$(document).on('click', '#logout', logOutUser);
$$(document).on('click', '#addBook', openAddBookModal);
$$(document).on('click', '#button-add-book', addBookToFirebase);

function openAddBookModal() {
    document.getElementById("bookTitle").value = "";
    document.getElementById("bookAuthor").value = "";
    document.getElementById("bookGenre").value = "";
    document.getElementById("publishedDate").value = "";
    document.getElementById("coverUrl").value = "";
    app.sheet.open('.my-sheet');
}


// Functions

function signInWithGoogle() {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
        const user = result.user;
        app.loginScreen.close(".signupYes", true);
        console.log('Logged in as:', user.displayName);
    }).catch((error) => {
        console.error('Error during Google sign-in:', error);
    });
}

function signInWithEmailAndPassword(evt) {
    evt.preventDefault();
    var formData = app.form.convertToData('#loginForm');
    firebase.auth().signInWithEmailAndPassword(formData.username, formData.password).then(
        () => {

            app.loginScreen.close(".loginYes", true);
        }
    ).catch(function (error) {

        var errorCode = error.code;
        var errorMessage = error.message;
        $$("#signInError").html(errorCode + " error " + errorMessage)
        console.log(errorCode + " error " + errorMessage);

    });
}

function signUpWithEmailAndPassword(evt) {
    evt.preventDefault();
    var formData = app.form.convertToData('#signUpForm');
    firebase.auth().createUserWithEmailAndPassword(formData.username, formData.password).then(
        () => {
            // could save extra info in a profile here I think.
            app.loginScreen.close(".signupYes", true);
        }
    ).catch((error) => {

        var errorCode = error.code;
        var errorMessage = error.message;
        $$("#signUpError").html(errorCode + " error " + errorMessage)
        console.log(errorCode + " error " + errorMessage);

    });
}

function logOutUser() {
    firebase.auth().signOut().catch(() => {
        console.log("Error during log out.");
    });
}

//CRUD methods
function addBookToFirebase() {
    const bookTitle = document.getElementById("bookTitle").value;
    const bookAuthor = document.getElementById("bookAuthor").value;
    const bookGenre = document.getElementById("bookGenre").value;
    const publishedDate = document.getElementById("publishedDate").value;
    const coverUrl = document.getElementById("coverUrl").value;

    const user = firebase.auth().currentUser;

    if (user) {
        try {
            const uid = user.uid;
            firebase.database().ref('books/' + uid).push({
                title: bookTitle,
                author: bookAuthor,
                genre: bookGenre,
                date: publishedDate,
                cover: coverUrl
            });
            app.sheet.close('.my-sheet');
            let bookList = $$('#book-list');
            bookList.empty();
        } catch (error) {
            console.log(error);
        }
    }
}


function buyBook(bookId) {
    const sUser = firebase.auth().currentUser.uid;
    firebase.database().ref(`books/${sUser}/${bookId}`).update({ datePurchased: new Date().toISOString() });
}

function removeBook(bookId) {
    const sUser = firebase.auth().currentUser.uid;
    firebase.database().ref(`books/${sUser}/${bookId}`).remove();
}
function markAsPurchased(bookId) {
    firebase.database().ref('books/' + bookId).update({ datePurchased: new Date().toISOString() });
}


function fetchBooks(query) {
    const endpoint = `https://openlibrary.org/search.json?q=${query}`;

    app.request.get(endpoint, function (response) {
        const data = JSON.parse(response);  // Parse the JSON response
        displayBooks(data.docs);  // Displaying the books
    }, function (xhr, status) {
        console.error('Error fetching books:', status);
    });
}

function displayBooks(books) {
    let bookList = $$('#book-list');
    bookList.empty();
    if (books.length > 0) {
        $$("#bookList").html('');
    }

    books.forEach((book, i) => {
        if (book.cover_i) {  // Check if cover_i property exists
            let bkObj = JSON.stringify(book);
            let title = book.title;
            let authors = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
            console.log(book.cover_i)
            let cover = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;





            let bookDiv = document.createElement('div');
            bookDiv.className = "book-item";

            let bookHTML = `
                <img src="${cover}" alt="${title}">
                <h3>${title}</h3>
                <p>${authors}</p>
            `;

            let addButton = document.createElement('button');
            addButton.className = "button-operation-add";
            addButton.onclick = (e) => addComicBook(book);
            addButton.textContent = "Add Book to your Account";

            bookDiv.innerHTML = bookHTML;
            bookDiv.appendChild(addButton);
            bookList.append(bookDiv);


        }
    });

}

function startSearch() {
    let query = $$('#search-query').val();
    fetchBooks(query);
}


