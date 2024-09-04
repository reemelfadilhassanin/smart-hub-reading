$(document).ready(function() {
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

  // Listener for search button
  $("#search").click(function() {
    outputList.innerHTML = "";
    searchData = $("#search-box").val();
    filterType = $("#filter-select").val(); // Get selected filter value

    if (searchData === "" || searchData === null) {
      displayError();
    } else {
      startIndex = 0;  // Reset start index for a new search
      fetchBooks(searchData, startIndex, maxResults, filterType);
    }
    $("#search-box").val("");
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
    $.ajax({
      url: `${bookUrl}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&filter=${filter}&key=${apiKey}`,
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

      outputList.innerHTML += formatOutput(bookImg, title, author, publisher, bookLink);
    });
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
  function formatOutput(bookImg, title, author, publisher, bookLink) {
    var htmlCard = `<div class="col-lg-4 col-md-6 col-sm-12">
      <div class="card">
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
            </div>
          </div>
        </div>
      </div>
    </div>`;
    return htmlCard;
  } 

  // Function to display error message
  function displayError() {
    alert("Search term cannot be empty!");
  }

  // Listener for "Load More" button
  $("#load-more").click(function() {
    startIndex += maxResults; // Increment start index
    fetchBooks(searchData, startIndex, maxResults, filterType); // Fetch the next batch of books
  });

  // Initially hide the "Load More" button
  $("#load-more").hide();
});
