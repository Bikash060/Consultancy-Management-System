import os
from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime
from ..extensions import db
from ..models.user import User, UserRole
from ..models.document import Document, DocumentType, DocumentStatus

documents_bp = Blueprint('documents', __name__)


def allowed_file(filename):
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'pdf', 'png'})
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
        return jsonify({'success': False, 'message': 'Only PDF and PNG files are allowed'}), 400
    
    # --- Validation: Passport limited to 1 ---
    if doc_type == 'passport':
        existing_passport = Document.query.filter_by(
            user_id=user_id, type=DocumentType.PASSPORT
        ).first()
        if existing_passport:
            return jsonify({
                'success': False,
                'message': 'You can only have one passport document. Delete the existing one first.'
            }), 400
    
    # --- Validation: Max 2 documents per non-passport type ---
    if doc_type != 'passport':
        existing_count = Document.query.filter_by(
            user_id=user_id, type=DocumentType(doc_type)
        ).count()
        if existing_count >= 2:
            return jsonify({
                'success': False,
                'message': f'Maximum 2 documents allowed for type "{doc_type}". Delete one first.'
            }), 400
    
    # --- Validation: Duplicate filename within same type ---
    existing_name = Document.query.filter_by(
        user_id=user_id, type=DocumentType(doc_type)
    ).filter(db.func.lower(Document.file_name) == file.filename.lower()).first()
    if existing_name:
        return jsonify({
            'success': False,
            'message': f'A document named "{file.filename}" already exists for this type.'
        }), 400
    
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
    elif user.role == UserRole.COUNSELOR:
        if client_id:
            documents = Document.query.filter_by(user_id=client_id).all()
        else:
            # Only show documents from clients assigned to this counselor
            client_ids = db.session.query(User.id).filter_by(assigned_counselor_id=int(user_id), role=UserRole.CLIENT)
            documents = Document.query.filter(Document.user_id.in_(client_ids)).all()
    elif user.role == UserRole.ADMIN:
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
    
    if str(document.user_id) != str(user_id):
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Document deleted'})


@documents_bp.route('/<int:doc_id>/download', methods=['GET'])
def download_document(doc_id):
    """Download/view a document. Accepts JWT token via query parameter for new-tab viewing."""
    from flask_jwt_extended import decode_token
    
    # Get token from query parameter (for opening in new tab)
    token = request.args.get('token')
    
    if not token:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    
    try:
        decoded = decode_token(token)
        user_id = decoded.get('sub')
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    document = Document.query.get(doc_id)
    if not document:
        return jsonify({'success': False, 'message': 'Document not found'}), 404
    
    # Permission check: owner, counselor assigned to this client, or admin
    if user.role == UserRole.CLIENT and str(document.user_id) != str(user_id):
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    if not os.path.exists(document.file_path):
        return jsonify({'success': False, 'message': 'File not found on server'}), 404
    
    # Determine mimetype
    ext = document.file_name.rsplit('.', 1)[-1].lower() if '.' in document.file_name else ''
    mimetypes = {
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
    }
    mimetype = mimetypes.get(ext, 'application/octet-stream')
    
    return send_file(
        document.file_path,
        mimetype=mimetype,
        as_attachment=False,  # Display inline in browser
        download_name=document.file_name
    )
