$(document).ready(function() {
    var bookshelf = $('#bookshelf');
  
    function loadBookshelf() {
      var savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      if (savedBooks.length === 0) {
        bookshelf.html('<p class="text-center">Your bookshelf is empty.</p>');
      } else {
        savedBooks.forEach(item => {
          var title = item.volumeInfo.title;
          var author = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : "Unknown Author";
          var publisher = item.volumeInfo.publisher || "Unknown Publisher";
          var bookImg = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'img/not available.jpg';
          var bookLink = item.volumeInfo.previewLink;
          
          bookshelf.append(`<div class="col-lg-4 col-md-6 col-sm-12 mb-4">
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
          </div>`);
        });
      }
    }
  
    loadBookshelf();
  });
  