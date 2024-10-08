$(document).ready(function() {
    // Add icons to tab headers
    $('#currently-reading-tab').html('<i class="fas fa-book-open"></i> Currently Reading');
    $('#want-to-read-tab').html('<i class="fas fa-bookmark"></i> Want To Read');
    $('#read-tab').html('<i class="fas fa-book"></i> Read');
    $('#favorites-tab').html('<i class="fas fa-star"></i> Favorites');

    // Load books and favorites from localStorage
    var books = JSON.parse(localStorage.getItem('books')) || {
        "currently-reading": [],
        "want-to-read": [],
        "read": []
    };

    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    function fetchBookCover(title, author, callback) {
        var apiKey = 'AIzaSyC3iukQcbOeSrsZhwp-nymR9CEk45PULeU'; // Your API key
        var query = encodeURIComponent(`${title} ${author}`);
        var url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`;

        $.getJSON(url, function(data) {
            if (data.items && data.items.length > 0) {
                var book = data.items[0].volumeInfo;
                var coverImage = book.imageLinks ? book.imageLinks.thumbnail : 'path/to/default-cover.jpg';
                callback(coverImage);
            } else {
                callback('path/to/default-cover.jpg');
            }
        });
    }

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
                    // Fetch cover image if not available
                    if (!book.coverImage) {
                        fetchBookCover(book.title, book.author, function(coverImage) {
                            book.coverImage = coverImage;
                            localStorage.setItem('books', JSON.stringify(books));
                            $(shelfId).find(`li[data-title="${book.title}"][data-author="${book.author}"] img`).attr('src', coverImage);
                        });
                    }

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
                        `<li class="shelf-list-item" data-title="${book.title}" data-author="${book.author}">
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
                            <button class="btn btn-sm btn-info share-button" data-title="${book.title}" data-author="${book.author}">
                                <i class="fas fa-share-alt"></i> Share
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
        }
    });

    $(document).on('click', '.btn-heart', function() {
        var bookTitle = $(this).data('title');
        var bookAuthor = $(this).data('author');
        var isFavorite = $(this).hasClass('liked');

        if (isFavorite) {
            favorites = favorites.filter(fav => !(fav.title === bookTitle && fav.author === bookAuthor));
            $(this).removeClass('liked').text('♡');
            localStorage.setItem('favorites', JSON.stringify(favorites));
        } else {
            var book = books['currently-reading'].concat(books['want-to-read'], books['read'])
                .find(b => b.title === bookTitle && b.author === bookAuthor);
            if (book) {
                favorites.push(book);
                $(this).addClass('liked').text('❤︎');
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }
        }
        renderFavorites();
    });

    $(document).on('click', '.share-button', function() {
        var bookTitle = $(this).data('title');
        var bookAuthor = $(this).data('author');
        var shareTitle = `${bookTitle} by ${bookAuthor}`;
        var shareText = `Check out this book: "${bookTitle}" by ${bookAuthor}`;

        if (navigator.share) {
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: window.location.href
            }).then(() => {
                console.log('Share was successful.');
            }).catch((error) => {
                console.log('Share failed:', error);
            });
        } else {
            alert('Web Share API is not supported in this browser.');
        }
    });
    $(document).on('click', '.comment-button', function() {
        var bookTitle = $(this).data('title');
        var bookAuthor = $(this).data('author');
    
        // Open the modal and fill it with the book's data
        $('#comment-title').val(bookTitle);
        $('#comment-author').val(bookAuthor);
    
        // Fetch the book data from the localStorage or books object
        var book = books['currently-reading'].concat(books['want-to-read'], books['read'])
            .find(b => b.title === bookTitle && b.author === bookAuthor);
    
        if (book) {
            $('#comment-text').val(book.comment || '');
            $('#start-date').val(book.startDate || '');
            $('#end-date').val(book.endDate || '');
            $('#pages').val(book.pages || '');
        } else {
            $('#comment-text').val('');
            $('#start-date').val('');
            $('#end-date').val('');
            $('#pages').val('');
        }
    
        // Show the modal
        $('#comment-modal').modal('show');
    });
       // Handler for the Save Comment button in the modal
       $('#save-comment').click(function() {
        // Retrieve values from the form fields
        var title = $('#comment-title').val();
        var author = $('#comment-author').val();
        var comment = $('#comment-text').val();
        var startDate = $('#start-date').val();
        var endDate = $('#end-date').val();
        var pages = $('#pages').val();

        // Find the book from the combined shelves
        var book = books['currently-reading'].concat(books['want-to-read'], books['read'])
            .find(b => b.title === title && b.author === author);

        if (book) {
            // Update the book's information
            book.comment = comment;
            book.startDate = startDate;
            book.endDate = endDate;
            book.pages = pages;

            // Save the updated books data to localStorage
            localStorage.setItem('books', JSON.stringify(books));

            // Hide the modal
            $('#comment-modal').modal('hide');

            // Re-render shelves and favorites
            renderShelves();
            renderFavorites();
        } else {
            console.error('Book not found.');
        }
    });

    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
    
    // Initial rendering
    renderShelves();
    renderFavorites();
});
