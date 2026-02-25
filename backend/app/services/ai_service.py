class AIService:
    @staticmethod
    def get_chat_response(message: str) -> str:
        try:
            from g4f.client import Client
            client = Client()
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful education consultancy assistant."
                    },
                    {"role": "user", "content": message}
                ]
            )
            return response.choices[0].message.content
        except Exception:
            return "Sorry, I couldn't process your request."
    
    @staticmethod
    def get_course_recommendations(grade: str, budget: str, country: str, field: str) -> str:
        prompt = f"""Recommend courses for:
Grade: {grade}, Budget: {budget}, Country: {country}, Field: {field}
Provide 3 specific recommendations."""
        
        return AIService.get_chat_response(prompt)
