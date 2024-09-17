document.addEventListener('DOMContentLoaded', function() {
    var swiper = new Swiper(".swiper-container", {
      loop: true,
      centeredSlides: true,
      slidesPerView: 3, // Show 3 slides at a time
      spaceBetween: 30, // Space between slides
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      speed: 500,
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 40,
        },
      },
    });
  
    // Initialize the blogs section
    populateBlogSection();
  });
  
  // Function to populate the blog posts section
  function populateBlogSection() {
    var blogPosts = [
      {
        title: "The Ultimate Guide to Reading",
        excerpt: "Discover tips and tricks to make the most out of your reading experience.",
        link: "blog/the-ultimate-guide-to-reading.html",
        image: "img/blog1.jpg"
      },
      {
        title: "Top 10 Books of 2024",
        excerpt: "Find out which books are making waves this year.",
        link: "blog/top-10-books-of-2024.html",
        image: "img/blog2.jfif"
      },
      {
        title: "How to Build a Reading Habit",
        excerpt: "Learn how to develop a consistent reading routine.",
        link: "blog/how-to-build-a-reading-habit.html",
        image: "img/blog3.png"
      }
      // Add more blog posts as needed
    ];
  
    var blogList = document.getElementById('blog-list');
    blogList.innerHTML = ''; // Clear existing content
  
    blogPosts.forEach(post => {
      var blogItem = `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${post.image}" class="card-img-top" alt="${post.title}">
            <div class="card-body">
              <h5 class="card-title">${post.title}</h5>
              <p class="card-text">${post.excerpt}</p>
              <a href="${post.link}" class="btn btn-primary">Read More</a>
            </div>
          </div>
        </div>`;
      blogList.innerHTML += blogItem;
    });
  }
  