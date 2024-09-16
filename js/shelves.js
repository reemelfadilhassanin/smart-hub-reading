$(document).ready(function() {
    // Add icons to tab headers
    $('#currently-reading-tab').html('<i class="fas fa-book-open"></i> Currently Reading');
    $('#want-to-read-tab').html('<i class="fas fa-bookmark"></i> Want To Read');
    $('#read-tab').html('<i class="fas fa-book"></i> Read');
    $('#favorites-tab').html('<i class="fas fa-star"></i> Favorites');

    // Load books and favorites from localStorage
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

            if (!Array.isArray(books[shelf])) {
                console.error(`Expected an array for shelf: ${shelf}. Initializing as empty array.`);
                books[shelf] = [];
            }

            $(shelfId).empty();
            var seenBooks = new Set();

            books[shelf].forEach(function(book) {
                var bookKey = `${book.title} by ${book.author}`;
                if (!seenBooks.has(bookKey)) {
                    var moveButton = shelf !== "read" ? 
                        `<button class="btn btn-sm btn-info move-book" data-shelf="${shelf}" data-title="${book.title}" data-author="${book.author}" title="Move to next shelf"><i class="fas fa-arrow-right"></i></button>` : '';
                    var isFavorite = favorites.some(fav => fav.title === book.title && fav.author === book.author);
                    var heartButtonText = isFavorite ? '❤︎' : '♡';
                    var heartButtonTitle = isFavorite ? 'Remove from favorites' : 'Add to favorites';

                    var tooltipContent = `
                        <strong>Comment:</strong> ${book.comment || 'No comment'}<br>
                        <strong>Start Date:</strong> ${book.startDate || 'Not specified'}<br>
                        <strong>End Date:</strong> ${book.endDate || 'Not specified'}<br>
                        <strong>Pages:</strong> ${book.pages || 'Not specified'}
                    `;

                    $(shelfId).append(
                        `<li class="shelf-list-item">
                            <img src="${book.coverImage || 'path/to/default-cover.jpg'}" alt="${book.title}" class="book-cover-img">
                            <div class="book-title-container">
                                <span class="book-title">${book.title} by ${book.author}</span>
                                ${moveButton}
                                <button class="btn btn-sm btn-primary comment-button" data-title="${book.title}" data-author="${book.author}" data-toggle="tooltip" data-html="true" title="${tooltipContent}">
                                    <i class="fas fa-comment-dots"></i>
                                </button>
                            </div>
                            <button class="btn-heart ${isFavorite ? 'liked' : ''}" data-title="${book.title}" data-author="${book.author}" title="${heartButtonTitle}">
                                ${heartButtonText}
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

        // Re-initialize tooltips after dynamic content is added
        $('[data-toggle="tooltip"]').tooltip();
    }

    function renderFavorites() {
        var favoritesList = $("#favorites-list");
        favoritesList.empty();

        favorites.forEach(function(favorite) {
            var book = books['currently-reading'].concat(books['want-to-read'], books['read'])
                .find(b => b.title === favorite.title && b.author === favorite.author);

            if (book) {
                var tooltipContent = `
                    <strong>Comment:</strong> ${book.comment || 'No comment'}<br>
                    <strong>Start Date:</strong> ${book.startDate || 'Not specified'}<br>
                    <strong>End Date:</strong> ${book.endDate || 'Not specified'}<br>
                    <strong>Pages:</strong> ${book.pages || 'Not specified'}
                `;

                favoritesList.append(
                    `<li class="shelf-list-item">
                        <img src="${book.coverImage || 'path/to/default-cover.jpg'}" alt="${book.title}" class="book-cover-img">
                        <div class="book-title-container">
                            <span class="book-title">${book.title} by ${book.author}</span>
                            <button class="btn btn-sm btn-primary comment-button" data-title="${book.title}" data-author="${book.author}" data-toggle="tooltip" data-html="true" title="${tooltipContent}">
                                <i class="fas fa-comment-dots"></i>
                            </button>
                        </div>
                        <button class="btn-heart liked" data-title="${book.title}" data-author="${book.author}" title="Remove from favorites">
                            ❤︎
                        </button>
                    </li>`
                );
            }
        });

        // Re-initialize tooltips after dynamic content is added
        $('[data-toggle="tooltip"]').tooltip();
    }

    function removeBookFromAllShelves(bookTitle, bookAuthor) {
        for (var shelf in books) {
            books[shelf] = books[shelf].filter(function(book) {
                return !(book.title === bookTitle && book.author === bookAuthor);
            });
        }
        favorites = favorites.filter(fav => !(fav.title === bookTitle && fav.author === bookAuthor));
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('books', JSON.stringify(books));
    }

    function moveToNextShelf(bookTitle, bookAuthor, currentShelf) {
        var nextShelf = {
            "currently-reading": "want-to-read",
            "want-to-read": "read",
            "read": null
        }[currentShelf];

        if (nextShelf) {
            var bookToMove = books[currentShelf].find(book => book.title === bookTitle && book.author === bookAuthor);
            removeBookFromAllShelves(bookTitle, bookAuthor);
            if (bookToMove) {
                books[nextShelf].push(bookToMove);
            }
            localStorage.setItem('books', JSON.stringify(books));
            renderShelves();
            renderFavorites();
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
            renderFavorites();
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
        renderFavorites();
    });

    $(document).on('click', '.comment-button', function() {
        var title = $(this).data('title');
        var author = $(this).data('author');
        var book = books['currently-reading'].concat(books['want-to-read'], books['read'])
            .find(b => b.title === title && b.author === author);

        $('#comment').val(book ? book.comment || '' : '');
        $('#start-date').val(book ? book.startDate || '' : '');
        $('#end-date').val(book ? book.endDate || '' : '');
        $('#pages').val(book ? book.pages || '0' : '');
        $('#save-comment').data('title', title).data('author', author);
    });

    $('#save-comment').click(function() {
        var title = $(this).data('title');
        var author = $(this).data('author');
        var book = books['currently-reading'].concat(books['want-to-read'], books['read'])
            .find(b => b.title === title && b.author === author);

        if (book) {
            book.comment = $('#comment').val();
            book.startDate = $('#start-date').val();
            book.endDate = $('#end-date').val();
            book.pages = $('#pages').val();
            localStorage.setItem('books', JSON.stringify(books));
            renderShelves();
            renderFavorites();
        }
    });

    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    renderShelves();
    renderFavorites();
});
