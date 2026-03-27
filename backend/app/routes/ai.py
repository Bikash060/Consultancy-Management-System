from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

ai_bp = Blueprint('ai', __name__)


def get_ai_response(prompt: str) -> str:
    """Try multiple providers/models for better reliability."""
    models_to_try = ["gpt-4o", "gpt-3.5-turbo", "llama-3.1-70b"]
    
    for model in models_to_try:
        try:
            from g4f.client import Client
            client = Client()
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an AI assistant for a study-abroad education consultancy. You MUST ONLY answer questions related to:
- Studying abroad (universities, courses, countries, admissions)
- Visa processes and requirements
- Required documents (passport, transcripts, SOP, recommendation letters, bank statements)
- English proficiency tests (IELTS, TOEFL, PTE, Duolingo)
- Scholarships and financial aid for international students
- Application procedures and timelines
- Living costs and budgets for studying abroad
- Career prospects after studying abroad

If the user asks ANYTHING that is NOT related to education consultancy, studying abroad, or the application process, you MUST politely decline and redirect them. For example respond with:
"I'm here to help with study-abroad and education consultancy queries only. Please ask me about universities, courses, visa requirements, documents, or anything related to your study-abroad journey!"

Never answer questions about coding, recipes, entertainment, politics, health, or any other off-topic subjects. Stay strictly within education consultancy scope.

Be concise, helpful, and practical in your responses."""
                    },
                    {"role": "user", "content": prompt}
                ]
            )
            content = response.choices[0].message.content
            if content and len(content) > 10:  # Valid response
                return content
        except Exception as e:
            print(f"[AI] Model {model} failed: {str(e)}")
            continue
    
    # If all models fail, return a helpful fallback
    return "I'm currently unable to process your request. Please try again in a few moments, or contact our counselors directly for assistance."


@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    data = request.get_json()
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'success': False, 'message': 'Message required'}), 400
    
    response = get_ai_response(message)
    
    return jsonify({
        'success': True,
        'response': response
    })


@ai_bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    grade = data.get('grade', '')
    budget = data.get('budget', '')
    preferred_country = data.get('preferred_country', '')
    preferred_field = data.get('preferred_field', '')
    
    prompt = f"""Based on the following student profile, recommend suitable countries and courses for studying abroad:

Student Profile:
- Academic Grade: {grade}
- Budget: {budget}
- Preferred Country: {preferred_country or 'No preference'}
- Preferred Field: {preferred_field or 'No preference'}

Provide 3-5 specific recommendations with:
1. Country
2. Suggested universities
3. Recommended courses/programs
4. Estimated costs
5. Why this is a good match

Be specific and practical."""

    response = get_ai_response(prompt)
    
    return jsonify({
        'success': True,
        'recommendations': response
    })


@ai_bp.route('/faq', methods=['GET'])
def get_faqs():
    faqs = [
        {
            'question': 'What documents do I need for studying abroad?',
            'answer': 'Common documents include: Passport, Academic transcripts, English proficiency test scores (IELTS/TOEFL), Statement of Purpose (SOP), Recommendation letters, Bank statements showing financial capability.'
        },
        {
            'question': 'How long does the visa process take?',
            'answer': 'Visa processing times vary by country. Generally: USA (3-5 months), UK (3-6 weeks), Canada (4-8 weeks), Australia (4-6 weeks). We recommend starting early.'
        },
        {
            'question': 'What are the requirements for Canada?',
            'answer': 'For Canada, you need: Valid passport, Letter of acceptance from a DLI, Proof of funds, English/French proficiency, Clean criminal record, Medical exam results.'
        },
        {
            'question': 'How can I track my application?',
            'answer': 'You can track your application through your dashboard. The timeline shows: Document Collection, Application Submitted, Offer Letter, Visa Lodged, and Visa Decision stages.'
        }
    ]
    
    return jsonify({'success': True, 'faqs': faqs})
