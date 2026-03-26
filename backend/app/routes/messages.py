from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User
from ..models.message import Message

messages_bp = Blueprint('messages', __name__)


@messages_bp.route('', methods=['POST'])
@jwt_required()
def send_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    receiver_id = data.get('receiver_id')
    content = data.get('content', '').strip()
    
    if not receiver_id or not content:
        return jsonify({'success': False, 'message': 'Receiver and content required'}), 400
    
    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'success': False, 'message': 'Receiver not found'}), 404
    
    message = Message(
        sender_id=user_id,
        receiver_id=receiver_id,
        content=content
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': message.to_dict()
    }), 201


@messages_bp.route('', methods=['GET'])
@jwt_required()
def get_messages():
    user_id = int(get_jwt_identity())
    other_user_id = request.args.get('user_id')
    
    query = Message.query.filter(
        db.or_(
            Message.sender_id == user_id,
            Message.receiver_id == user_id
        )
    )
    
    if other_user_id:
        query = query.filter(
            db.or_(
                db.and_(Message.sender_id == user_id, Message.receiver_id == other_user_id),
                db.and_(Message.sender_id == other_user_id, Message.receiver_id == user_id)
            )
        )
    
    messages = query.order_by(Message.sent_at.asc()).all()
    
    return jsonify({
        'success': True,
        'messages': [m.to_dict() for m in messages]
    })


@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = int(get_jwt_identity())
    
    sent = db.session.query(Message.receiver_id).filter(Message.sender_id == user_id).distinct()
    received = db.session.query(Message.sender_id).filter(Message.receiver_id == user_id).distinct()
    
    user_ids = set([r[0] for r in sent.all()] + [r[0] for r in received.all()])
    users = User.query.filter(User.id.in_(user_ids)).all()
    
    return jsonify({
        'success': True,
        'conversations': [u.to_dict() for u in users]
    })


@messages_bp.route('/read', methods=['PUT'])
@jwt_required()
def mark_read_batch():
    """Mark all messages from a specific user as read."""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    other_user_id = data.get('user_id')

    if not other_user_id:
        return jsonify({'success': False, 'message': 'user_id is required'}), 400

    messages = Message.query.filter_by(
        sender_id=other_user_id,
        receiver_id=user_id,
        is_read=False
    ).all()

    for message in messages:
        message.is_read = True

    db.session.commit()

    return jsonify({'success': True, 'marked': len(messages)})


@messages_bp.route('/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(message_id):
    user_id = int(get_jwt_identity())
    
    message = Message.query.get(message_id)
    if not message:
        return jsonify({'success': False, 'message': 'Message not found'}), 404
    
    if message.receiver_id != user_id:
        return jsonify({'success': False, 'message': 'Permission denied'}), 403
    
    message.is_read = True
    db.session.commit()
    
    return jsonify({'success': True})
