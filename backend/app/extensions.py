"""
Flask extensions initialization module.

This module initializes all Flask extensions used in the application.
Extensions are created here and initialized with the app in the factory.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from flask_mail import Mail

# Database ORM
db = SQLAlchemy()

# JWT Authentication
jwt = JWTManager()

# Cross-Origin Resource Sharing
cors = CORS()

# Database Migrations
migrate = Migrate()

# Email Service
mail = Mail()
