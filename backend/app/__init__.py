"""
Flask Application Factory.

This module contains the application factory function that creates and
configures the Flask application. It initializes all extensions, registers
blueprints, and sets up error handlers.
"""
import os
from flask import Flask, jsonify
from .config import config_by_name
from .extensions import db, jwt, cors, migrate, mail


def create_app(config_name: str = None) -> Flask:
    """
    Create and configure the Flask application.
    
    Args:
        config_name: Configuration environment ('development', 'production', 'testing')
    
    Returns:
        Configured Flask application instance
    """
    # Get config from environment or use default
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    initialize_extensions(app)
    
    # Register blueprints (API routes)
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    return app


def initialize_extensions(app: Flask) -> None:
    """
    Initialize Flask extensions with the application.
    
    Args:
        app: Flask application instance
    """
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    
    # Configure CORS with allowed origins
    cors.init_app(
        app,
        origins=app.config['CORS_ORIGINS'],
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )


def register_blueprints(app: Flask) -> None:
    """
    Register all API route blueprints.
    
    Args:
        app: Flask application instance
    """
    from .routes.auth import auth_bp
    from .routes.users import users_bp
    from .routes.appointments import appointments_bp
    from .routes.documents import documents_bp
    from .routes.applications import applications_bp
    from .routes.messages import messages_bp
    from .routes.admin import admin_bp
    from .routes.ai import ai_bp
    
    # Register blueprints with URL prefix
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')


def register_error_handlers(app: Flask) -> None:
    """
    Register global error handlers for the application.
    
    Args:
        app: Flask application instance
    """
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': 'Bad Request',
            'message': str(error.description)
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': 'Authentication required'
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource'
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Not Found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(422)
    def unprocessable(error):
        return jsonify({
            'success': False,
            'error': 'Unprocessable Entity',
            'message': 'Invalid or missing authentication token'
        }), 422
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
        }), 500
    
    # JWT specific error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'error': 'Token Expired',
            'message': 'Your session has expired. Please log in again.'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'error': 'Invalid Token',
            'message': 'Invalid authentication token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'error': 'Missing Token',
            'message': 'Authentication token is required'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'error': 'Token Revoked',
            'message': 'This token has been revoked'
        }), 401

