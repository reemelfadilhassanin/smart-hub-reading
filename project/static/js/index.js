$(document).ready(function() {
  $('#preselect-button').on('click', preselectShelf);

  // Toggle night mode based on slider
  $("#night-mode-toggle").change(function() {
      $("body").toggleClass("night-mode");
      var isNightMode = $("body").hasClass("night-mode");
      localStorage.setItem('night-mode', isNightMode);
  });

  // Apply saved night mode setting
  if (localStorage.getItem('night-mode') === 'true') {
      $("body").addClass("night-mode");
      $("#night-mode-toggle").prop('checked', true);
  }

  var outputList = document.getElementById("list-output");
  var bookUrl = "https://www.googleapis.com/books/v1/volumes";
  var apiKey = "AIzaSyC3iukQcbOeSrsZhwp-nymR9CEk45PULeU"; // Ensure this key is valid
  var noImageIcon = 'img/not available.jpg'; // Path to your local icon image

  var searchData;
  var startIndex = 0;  // Start index for pagination
  var maxResults = 12; // Number of books per page
  var books = [];      // Array to hold fetched books
  var filterType = ""; // Filter type initialized as empty
  var selectedBooks = []; // Array to store selected books

  // Listener for search button
  $("#search").click(function() {
      outputList.innerHTML = "";
      searchData = $("#search-box").val().trim(); // Trim whitespace from the search term
      filterType = $("#filter-select").val(); // Get selected filter value
    
      if (!searchData) {
          displayError(); // Show error if search term is empty
      } else {
          startIndex = 0; // Reset start index for a new search
          fetchBooks(searchData, startIndex, maxResults, filterType); // Fetch books with search term and filter
      }
      $("#search-box").val(""); // Clear the search box
  });

  // Listener for sort buttons
  $("#sort-newest").click(function() {
      sortBooks('newest');
  });

  $("#sort-oldest").click(function() {
      sortBooks('oldest');
  });

  // Function to fetch books from the API
  function fetchBooks(query, startIndex, maxResults, filter) {
      var filterQuery = filter ? `&filter=${filter}` : ''; // Add filter if it's not empty
    
      $.ajax({
          url: `${bookUrl}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}${filterQuery}&key=${apiKey}`,
          dataType: "json",
          success: function(response) {
              if (response.totalItems === 0) {
                  alert("No results found! Try again.");
              } else {
                  $(".book-list").css("visibility", "visible");
                  if (startIndex === 0) {
                      books = response.items; // Store fetched books
                      displayResults(books);
                  } else {
                      books = books.concat(response.items); // Append new books to existing list
                      displayResults(books);
                  }

                  // Determine if more books are available
                  if (response.totalItems > startIndex + maxResults) {
                      $("#load-more").show();
                  } else {
                      $("#load-more").hide();
                  }
              }
          },
          error: function() {
              alert("Something went wrong. Try again!");
          }
      });
  }

  // Function to display results on the page
  function displayResults(books) {
      outputList.innerHTML = ""; // Clear existing results
      books.forEach(item => {
          var title = item.volumeInfo.title;
          var author = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : "Unknown Author";
          var publisher = item.volumeInfo.publisher || "Unknown Publisher";
          var bookLink = item.volumeInfo.previewLink;
          var bookImg = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : noImageIcon;
          
          var shelfStatus = getShelfStatus(title, author); // Get shelf status for the book
          outputList.innerHTML += formatOutput(bookImg, title, author, publisher, bookLink, shelfStatus);
      });
  }

  // Function to get shelf status for a book
  function getShelfStatus(title, author) {
      var booksInLocalStorage = JSON.parse(localStorage.getItem('books')) || { "currently-reading": [], "want-to-read": [], "read": [] };

      // Ensure the shelf is initialized as an array
      for (var shelf in booksInLocalStorage) {
          if (Array.isArray(booksInLocalStorage[shelf]) &&
              booksInLocalStorage[shelf].some(book => book.title === title && book.author === author)) {
              return shelf; // Return the shelf where the book is located
          }
      }
      return ''; // No shelf status found
  }

  // Function to sort books
  function sortBooks(order) {
      var sortedBooks = books.slice(); // Clone the books array
      sortedBooks.sort((a, b) => {
          var dateA = new Date(a.volumeInfo.publishedDate);
          var dateB = new Date(b.volumeInfo.publishedDate);
          return order === 'newest' ? dateB - dateA : dateA - dateB;
      });
      displayResults(sortedBooks); // Display sorted results
  }

  // Function to format the output for each book
  function formatOutput(bookImg, title, author, publisher, bookLink, shelfStatus) {
      var checkedAttr = shelfStatus ? 'checked' : '';
      var shelfMessage = shelfStatus ? `<p class="card-text text-success">This book is on the ${shelfStatus} shelf.</p>` : '';
      var htmlCard = `
          <div class="col-lg-4 col-md-6 col-sm-12">
              <div class="card" data-title="${title}" data-author="${author}">
                  <div class="row no-gutters">
                      <div class="col-md-4">
                          <img src="${bookImg}" class="card-img" alt="Book cover">
                      </div>
                      <div class="col-md-8">
                          <div class="card-body">
                              <h5 class="card-title">${title}</h5>
                              <p class="card-text">Author: ${author}</p>
                              <p class="card-text">Publisher: ${publisher}</p>
                              <a target="_blank" href="${bookLink}" class="btn btn-secondary">Read Book</a>
                              ${shelfMessage}
                              <div class="form-check mt-2">
                                  <input class="form-check-input select-book" type="checkbox" value="" id="check-${title.replace(/\s+/g, '')}" ${checkedAttr}>
                                  <label class="form-check-label" for="check-${title.replace(/\s+/g, '')}">
                                      Select
                                  </label>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>`;
      return htmlCard;
  }

  // Function to display error message
  function displayError() {
      $("#list-output").html('<div class="alert alert-danger">Search term cannot be empty!</div>');
  }

  // Listener for "Load More" button
  $("#load-more").click(function() {
      startIndex += maxResults; // Increment start index
      fetchBooks(searchData, startIndex, maxResults, filterType); // Fetch the next batch of books
  });

  // Initially hide the "Load More" button
  $("#load-more").hide();

  // Click event for book card checkbox
  $(document).on('change', '.select-book', function() {
      var card = $(this).closest('.card');
      var title = card.find('.card-title').text();
      var author = card.find('.card-text').eq(0).text().replace('Author: ', '');
      var book = { title: title, author: author };

      if ($(this).is(':checked')) {
          if (!selectedBooks.some(b => b.title === title && b.author === author)) {
              selectedBooks.push(book); // Add book to selectedBooks
          }
      } else {
          selectedBooks = selectedBooks.filter(b => !(b.title === title && b.author === author)); // Remove book from selectedBooks
      }
  });

  // Click event for the "Add to Shelf" button
  $("#add-to-shelf").click(function() {
      if (selectedBooks.length > 0) {
          $('#shelfModal').modal('show'); // Show the shelf modal
          preselectShelf(); // Call function to preselect shelf
      } else {
          alert("Select books first!");
      }
  });

  // Click event for "Add to Shelf" in the modal
  $('#confirm-add-to-shelf').click(function() {
    var shelf = $('#shelf-select').val();
    if (selectedBooks.length > 0 && shelf) {
        var existingBooks = JSON.parse(localStorage.getItem('books')) || { "currently-reading": [], "want-to-read": [], "read": [] };
        if (!Array.isArray(existingBooks[shelf])) {
            existingBooks[shelf] = []; // Initialize shelf if not present
        }
        existingBooks[shelf] = existingBooks[shelf].concat(selectedBooks);
        localStorage.setItem('books', JSON.stringify(existingBooks));
        console.log("Books added to shelf:", selectedBooks);
        selectedBooks = []; // Clear selectedBooks
        $('#shelfModal').modal('hide'); // Hide modal
        alert("Books added to shelf successfully!");
        updateShelvesPage();
    } else {
        alert("Select a shelf to add books!");
    }
});


  
  // Function to preselect shelf options in the modal
  function preselectShelf() {
      console.log("Preselect Shelf function called");
      var shelfSelect = $('#shelf-select');
      var shelves = ["currently-reading", "want-to-read", "read"]; // Replace with actual shelf names if different

      shelfSelect.empty(); // Clear existing options

      shelves.forEach(function(shelf) {
          shelfSelect.append(new Option(shelf, shelf));
      });

      // Optionally, set a default selection if needed
      shelfSelect.val(shelves[0]);
  }

  // Function to update or refresh shelves page (if applicable)
  function updateShelvesPage() {
      // Implementation to update the shelves page with the newly added books
      console.log("Shelves page update function called.");
      // Load the updated shelves page or content here
  }
});
//books for you 
