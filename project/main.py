from flask import Blueprint, render_template 
from flask_login import login_required, current_user
from . import db 

main = Blueprint('main', __name__)

@main.route('/')
def index():
  return render_template('index.html')

@main.route('/profile')
@login_required
def profile():
  return render_template('profile.html', username = current_user.username)
@main.route('/shelves')
@login_required
def shelves():
    return render_template('shelves.html')

@main.route('/books')
@login_required
def books():
    return render_template('books.html')  # Create this template

@main.route('/contact')
def contact():
    return render_template('contact.html')  # Create this template
@main.route('/about')
def about():
    
    return render_template('about.html')
    