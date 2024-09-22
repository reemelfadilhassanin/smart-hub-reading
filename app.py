from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate  
import os 

# Allow insecure transport for OAuth
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Configuration settings
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'key-goes-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
    app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'your_email@gmail.com'
    app.config['MAIL_PASSWORD'] = "your_password"

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    jwt.init_app(app)
    mail.init_app(app)

    # Import models
    from models import User  # Import your User model

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register blueprints
    from auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from social_login import google_blueprint
    app.register_blueprint(google_blueprint, url_prefix="/login")

    from main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app

# Entry point
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
