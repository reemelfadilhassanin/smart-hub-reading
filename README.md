# Smart Hub:

## Introduction
Smart Hub is your go-to online library for exploring amazing books and resources. We provide a comprehensive platform where you can browse a vast collection of books, create your own virtual bookshelf, and embark on new reading adventures. Built with HTML, CSS, JavaScript, and Flask (Python), Smart Hub offers a user-friendly interface and robust functionality.

## Author(s)
- [REEM ALFADIL ABD ALLAH](https://github.com/reemelfadilhassanin) 

## Demo

### Login:

![login page ](project/static/img/demo/login.JPG)

### Singup:

![singup page ](project/static/img/demo/signup.JPG)

### banner section:

![banner page ](project/static/img/demo/banner.JPG)

### books:

![books page ](project/static/img/demo/book.JPG)

### shelves:

![shelves page ](project/static/img/demo/shelves.JPG)

### Favorit shelves:

![favorit books page ](project/static/img/demo/favorit.JPG)

## Installation
To get a local copy up and running, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-hub.git
2. Install environment: 

```bash
     python3 -m pip install --user --upgrade pip
     python3 -m pip install --user virtualenv
     python3 -m venv env

Enable virtual environment: source env/bin/activate 

Install packages: pip install -r requirements.txt


3. Run the app:

.\env\Scripts\activate  # For Windows

Python

from project import create_app
 
app = create_app()
 
app.run()  # This should start the Flask development server


