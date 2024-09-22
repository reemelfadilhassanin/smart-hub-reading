from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate  # Import Flask-Migrate
import os 

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()  # Initialize Flask-Migrate

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'key-goes-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'

    app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'justreemjust49@gmail.com'
    app.config['MAIL_PASSWORD'] = "reem@2024"

    db.init_app(app)
    migrate.init_app(app, db)  # Initialize Flask-Migrate with the app and db

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    jwt.init_app(app)
    mail.init_app(app)

    from .models import User, OAuth

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Blueprints for auth routes
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    # Import and register only the Google blueprint
    from .social_login import google_blueprint
    app.register_blueprint(google_blueprint, url_prefix="/login")

    # Non-auth parts
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app