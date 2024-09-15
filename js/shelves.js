$(document).ready(function() {
    // Load books from localStorage or initialize with default values
    var books = JSON.parse(localStorage.getItem('books'));
    if (!books || typeof books !== 'object' || Object.values(books).some(arr => !Array.isArray(arr))) {
        books = {
            "currently-reading": [],
            "want-to-read": [],
            "read": []
        };
        localStorage.setItem('books', JSON.stringify(books));
    }

    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    function renderShelves() {
        for (var shelf in books) {
            var shelfId = "#" + shelf;

            // Ensure shelf exists and is an array
            if (!Array.isArray(books[shelf])) {
                console.error(`Expected an array for shelf: ${shelf}. Initializing as empty array.`);
                books[shelf] = [];
            }

            $(shelfId).empty();
            var seenBooks = new Set();

            books[shelf].forEach(function(book) {
                var bookKey = `${book.title} by ${book.author}`;
                if (!seenBooks.has(bookKey)) {
                    var moveButton = shelf !== "read" ? `<button class="btn btn-sm btn-info move-book" data-shelf="${shelf}" data-title="${book.title}" data-author="${book.author}">Move</button>` : '';
                    var isFavorite = favorites.some(fav => fav.title === book.title && fav.author === book.author);

                    $(shelfId).append(
                        `<li class="shelf-list-item">
                            <div class="book-title-container">
                                <span class="book-title">${book.title} by ${book.author}</span>
                                ${moveButton}
                            </div>
                            <button class="btn-heart ${isFavorite ? 'liked' : ''}" data-title="${book.title}" data-author="${book.author}">
                                ${isFavorite ? '❤︎' : '♡'}
                            </button>
                        </li>`
                    );
                    seenBooks.add(bookKey);
                }
            });

            if (shelf === "read" && books[shelf].length === 0) {
                $("#read-empty-message").show();
            } else {
                $("#read-empty-message").hide();
            }
        }
    }

    function removeBookFromAllShelves(bookTitle, bookAuthor) {
        for (var shelf in books) {
            books[shelf] = books[shelf].filter(function(book) {
                return !(book.title === bookTitle && book.author === bookAuthor);
            });
        }
    }

    function moveToNextShelf(bookTitle, bookAuthor, currentShelf) {
        var nextShelf = {
            "currently-reading": "want-to-read",
            "want-to-read": "read",
            "read": null
        }[currentShelf];

        if (nextShelf) {
            removeBookFromAllShelves(bookTitle, bookAuthor);
            books[nextShelf].push({ title: bookTitle, author: bookAuthor });
            localStorage.setItem('books', JSON.stringify(books));
            renderShelves();
        }
    }

    $(document).on('click', '.move-book', function() {
        var bookTitle = $(this).data('title');
        var bookAuthor = $(this).data('author');
        var shelfFrom = $(this).data('shelf');
        moveToNextShelf(bookTitle, bookAuthor, shelfFrom);
    });

    $("#remove-from-shelf").click(function() {
        var shelf = prompt("Enter the shelf to remove books from (currently-reading, want-to-read, read):");
        if (books[shelf]) {
            books[shelf] = [];
            localStorage.setItem('books', JSON.stringify(books));
            renderShelves();
        } else {
            alert("Invalid shelf name!");
        }
    });

    $(document).on('click', '.btn-heart', function() {
        var title = $(this).data('title');
        var author = $(this).data('author');

        if ($(this).hasClass('liked')) {
            favorites = favorites.filter(fav => !(fav.title === title && fav.author === author));
            $(this).removeClass('liked').html('♡');
        } else {
            favorites.push({ title: title, author: author });
            $(this).addClass('liked').html('❤︎');
        }

        $(this).addClass('bouncing');
        setTimeout(() => $(this).removeClass('bouncing'), 600);

        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderShelves();
        renderRecommendations();
    });

    function renderRecommendations() {
        var recommendedBooks = $('#recommended-books');
        recommendedBooks.empty();

        var recommended = [];

        var readBooks = books['read'] || [];
        readBooks.forEach(function(readBook) {
            var currentlyReading = books['currently-reading'] || [];
            var wantToRead = books['want-to-read'] || [];

            currentlyReading.forEach(function(book) {
                if (book.title !== readBook.title && book.author === readBook.author) {
                    recommended.push(book);
                }
            });
            wantToRead.forEach(function(book) {
                if (book.title !== readBook.title && book.author === readBook.author) {
                    recommended.push(book);
                }
            });
        });

        recommended = Array.from(new Set(recommended.map(book => `${book.title}${book.author}`)))
            .map(key => recommended.find(book => `${book.title}${book.author}` === key))
            .slice(0, 8);

        recommended.forEach(function(book) {
            recommendedBooks.append(
                `<div class="col-md-3 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="card-text">${book.author}</p>
                        </div>
                    </div>
                </div>`
            );
        });
    }

    renderShelves();
    renderRecommendations();
});
