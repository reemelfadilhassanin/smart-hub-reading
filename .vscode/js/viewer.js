$(document).ready(function() {
  var outputList = document.getElementById("list-output");
  var bookUrl = "https://www.googleapis.com/books/v1/volumes";
  var apiKey = "YOUR_API_KEY_HERE"; // Replace with your valid API key
  var noImageIcon = 'img/not available.jpg';
  var searchData;
  var startIndex = 0;
  var maxResults = 12;
  var books = [];
  var filterType = ''; // Variable to store selected filter type

  $("#search").click(function() {
    outputList.innerHTML = "";
    searchData = $("#search-box").val();
    filterType = $("#filter-select").val(); // Get selected filter type from dropdown
    if (searchData === "" || searchData === null) {
      displayError();
    } else {
      startIndex = 0;
      fetchBooks(searchData, startIndex, maxResults, filterType);
    }
    $("#search-box").val("");
  });

  function fetchBooks(query, startIndex, maxResults, filterType) {
    $.ajax({
      url: `${bookUrl}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&filter=${filterType}&key=${apiKey}`,
      dataType: "json",
      success: function(response) {
        if (response.totalItems === 0) {
          alert("No results found! Try again.");
        } else {
          $(".book-list").css("visibility", "visible");
          if (startIndex === 0) {
            books = response.items;
            displayResults(books);
          } else {
            books = books.concat(response.items);
            displayResults(books);
          }
          $("#load-more").toggle(response.totalItems > startIndex + maxResults);
        }
      },
      error: function() {
        alert("Something went wrong. Try again!");
      }
    });
  }

  function displayResults(books) {
    outputList.innerHTML = "";
    books.forEach(item => {
      var title = item.volumeInfo.title;
      var author = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : "Unknown Author";
      var publisher = item.volumeInfo.publisher || "Unknown Publisher";
      var bookLink = item.volumeInfo.previewLink;
      var bookImg = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : noImageIcon;
      var bookIsbn = item.volumeInfo.industryIdentifiers ? item.volumeInfo.industryIdentifiers[0].identifier : "No ISBN";

      outputList.innerHTML += formatOutput(bookImg, title, author, publisher, bookLink, bookIsbn);
    });
  }

  function formatOutput(bookImg, title, author, publisher, bookLink, bookIsbn) {
    return `<div class="col-lg-4 col-md-6 col-sm-12">
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
              <button class="btn btn-success mt-2 save-book" data-isbn="${bookIsbn}">Save to Bookshelf</button>
              <button class="btn btn-primary mt-2 view-book" data-isbn="${bookIsbn}">View Book</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  $(document).on('click', '.view-book', function() {
    var isbn = $(this).data('isbn');
    var viewerHtml = `<iframe src="https://books.google.com/books?id=${isbn}&printsec=frontcover&embed=true" width="600" height="500"></iframe>`;
    $('#viewerCanvas').html(viewerHtml);
  });

  $(document).on('click', '.save-book', function() {
    var isbn = $(this).data('isbn');
    var book = books.find(b => b.volumeInfo.industryIdentifiers && b.volumeInfo.industryIdentifiers[0].identifier === isbn);
    if (book) {
      var savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      if (!savedBooks.some(b => b.volumeInfo.industryIdentifiers[0].identifier === isbn)) {
        savedBooks.push(book);
        localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
        alert('Book saved to bookshelf!');
      } else {
        alert('Book already in bookshelf.');
      }
    }
  });

  $("#load-more").click(function() {
    startIndex += maxResults;
    fetchBooks(searchData, startIndex, maxResults, filterType);
  });

  $("#load-more").hide();

  function displayError() {
    alert("Search term cannot be empty!");
  }
});
