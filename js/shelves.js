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

            if (!Array.isArray(books[shelf])) {
                console.error(`Expected an array for shelf: ${shelf}. Initializing as empty array.`);
                books[shelf] = [];
            }

            $(shelfId).empty();
            var seenBooks = new Set();

            books[shelf].forEach(function(book) {
                var bookKey = `${book.title} by ${book.author}`;
                if (!seenBooks.has(bookKey)) {
                    var moveButton = shelf !== "read" ? `<button class="btn btn-sm btn-info move-book" data-shelf="${shelf}" data-title="${book.title}" data-author="${book.author}"><i class="fas fa-arrow-right"></i> Move</button>` : '';
                    var heartClass = favorites.includes(bookKey) ? 'btn-heart liked' : 'btn-heart';
                    var listItem = `
                        <li data-title="${book.title}" data-author="${book.author}">
                            <img src="${book.image}" alt="${book.title}" class="img-thumbnail" style="max-width: 60px; margin-right: 15px;">
                            <strong>${book.title}</strong> by ${book.author}
                            ${moveButton}
                            <button class="${heartClass}" data-toggle="tooltip" title="Add to Favorites"><i class="fas fa-heart"></i></button>
                            <button class="btn btn-sm btn-secondary comment-button" data-toggle="modal" data-target="#commentModal" data-title="${book.title}" data-author="${book.author}"><i class="fas fa-comment"></i> Comment</button>
                        </li>`;
                    $(shelfId).append(listItem);
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

    renderShelves();

    // Handle heart button click for favorites
    $(document).on('click', '.btn-heart', function() {
        var bookTitle = $(this).closest('li').data('title');
        var bookAuthor = $(this).closest('li').data('author');
        var bookKey = `${bookTitle} by ${bookAuthor}`;
        var index = favorites.indexOf(bookKey);

        if (index === -1) {
            favorites.push(bookKey);
            $(this).addClass('liked bouncing');
        } else {
            favorites.splice(index, 1);
            $(this).removeClass('liked bouncing');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
    });

    // Handle comment modal save button click
    $('#save-comment').on('click', function() {
        var bookTitle = $('#commentModal').find('[data-title]').data('title');
        var bookAuthor = $('#commentModal').find('[data-title]').data('author');
        var comment = $('#comment').val();
        var startDate = $('#start-date').val();
        var endDate = $('#end-date').val();

        if (bookTitle && bookAuthor) {
            var bookKey = `${bookTitle} by ${bookAuthor}`;
            // Store or update comment with start and end dates
            // For simplicity, we'll just log it here
            console.log(`Comment for "${bookKey}": ${comment}, Start Date: ${startDate}, End Date: ${endDate}`);
        }

        $('#commentModal').modal('hide');
    });

    // Handle move button click
    $(document).on('click', '.move-book', function() {
        var bookTitle = $(this).data('title');
        var bookAuthor = $(this).data('author');
        var fromShelf = $(this).data('shelf');
        var toShelf = fromShelf === 'currently-reading' ? 'want-to-read' : fromShelf === 'want-to-read' ? 'read' : 'currently-reading';

        var bookIndex = books[fromShelf].findIndex(b => b.title === bookTitle && b.author === bookAuthor);
        if (bookIndex !== -1) {
            var book = books[fromShelf].splice(bookIndex, 1)[0];
            books[toShelf].push(book);
            localStorage.setItem('books', JSON.stringify(books));
            renderShelves();
        }
    });

    // Handle remove button click
    $('#remove-from-shelf').on('click', function() {
        var selectedItems = $("input:checked").closest('li');
        selectedItems.each(function() {
            var title = $(this).data('title');
            var author = $(this).data('author');
            for (var shelf in books) {
                var bookIndex = books[shelf].findIndex(b => b.title === title && b.author === author);
                if (bookIndex !== -1) {
                    books[shelf].splice(bookIndex, 1);
                    localStorage.setItem('books', JSON.stringify(books));
                }
            }
        });
        renderShelves();
    });
});
