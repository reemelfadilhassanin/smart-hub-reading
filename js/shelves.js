$(document).ready(function() {
    // Retrieve books from localStorage
    var books = JSON.parse(localStorage.getItem('books')) || {
      "currently-reading": [],
      "want-to-read": [],
      "read": []
    };
  
    // Function to render books into shelves
    function renderShelves() {
      for (var shelf in books) {
        var shelfId = "#" + shelf;
        $(shelfId).empty(); // Clear existing books
        books[shelf].forEach(function(book) {
          $(shelfId).append(`<li class="list-group-item">${book.title} by ${book.author} <button class="btn btn-sm btn-info float-right move-book" data-shelf="${shelf}" data-title="${book.title}" data-author="${book.author}">Move</button></li>`);
        });
      }
    }
  
    // Initial render
    renderShelves();
  
    // Click event for "Move to Shelf" button
    $("#move-to-shelf").click(function() {
      var shelfFrom = prompt("Enter the shelf to move books from (currently-reading, want-to-read, read):");
      var shelfTo = prompt("Enter the shelf to move books to (currently-reading, want-to-read, read):");
  
      if (books[shelfFrom] && books[shelfTo]) {
        books[shelfTo] = books[shelfTo].concat(books[shelfFrom]);
        books[shelfFrom] = [];
        localStorage.setItem('books', JSON.stringify(books));
        renderShelves();
      } else {
        alert("Invalid shelf names!");
      }
    });
  
    // Click event for "Remove from Shelf" button
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
  
    // Click event for individual move buttons
    $(document).on('click', '.move-book', function() {
      var bookTitle = $(this).data('title');
      var bookAuthor = $(this).data('author');
      var shelfFrom = $(this).data('shelf');
      var shelfTo = prompt("Enter the shelf to move this book to (currently-reading, want-to-read, read):");
  
      if (books[shelfTo]) {
        books[shelfTo].push({ title: bookTitle, author: bookAuthor });
        books[shelfFrom] = books[shelfFrom].filter(function(book) {
          return book.title !== bookTitle || book.author !== bookAuthor;
        });
        localStorage.setItem('books', JSON.stringify(books));
        renderShelves();
      } else {
        alert("Invalid shelf name!");
      }
    });
  });
  