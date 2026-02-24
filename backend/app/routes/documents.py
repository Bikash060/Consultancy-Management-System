import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime
from ..extensions import db
from ..models.user import User, UserRole
from ..models.document import Document, DocumentType, DocumentStatus

documents_bp = Blueprint('documents', __name__)


def allowed_file(filename):
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


@documents_bp.route('', methods=['POST'])
@jwt_required()
def upload_document():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'}), 400
    
    file = request.files['file']
    doc_type = request.form.get('type', 'other')
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'File type not allowed'}), 400
    
    filename = secure_filename(f"{user_id}_{datetime.now().timestamp()}_{file.filename}")
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    document = Document(
        user_id=user_id,
        type=DocumentType(doc_type),
        file_name=file.filename,
        file_path=file_path
    )
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Document uploaded',
        'document': document.to_dict()
    }), 201


@documents_bp.route('', methods=['GET'])
@jwt_required()
def get_documents():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    client_id = request.args.get('client_id')
    
    if user.role == UserRole.CLIENT:
        documents = Document.query.filter_by(user_id=user_id).all()
    elif user.role in [UserRole.COUNSELOR, UserRole.ADMIN]:
        if client_id:
            documents = Document.query.filter_by(user_id=client_id).all()
        else:
            documents = Document.query.all()
    else:
        documents = []
    
    return jsonify({
        'success': True,
        'documents': [d.to_dict() for d in documents]
    })


@documents_bp.route('/<int:doc_id>/verify', methods=['PUT'])
@jwt_required()
def verify_document(doc_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if user.role not in [UserRole.COUNSELOR, UserRole.ADMIN]:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    document = Document.query.get(doc_id)
    if not document:
        return jsonify({'success': False, 'message': 'Document not found'}), 404
    
    status = data.get('status', 'verified')
    comments = data.get('comments', '')
    
    document.status = DocumentStatus(status)
    document.comments = comments
    document.verified_by = user_id
    document.verified_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'success': True, 'document': document.to_dict()})


@documents_bp.route('/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_document(doc_id):
    user_id = get_jwt_identity()
    
    document = Document.query.get(doc_id)
    if not document:
        return jsonify({'success': False, 'message': 'Document not found'}), 404
    
    if document.user_id != user_id:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Document deleted'})
