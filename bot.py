import os

import requests
from openai import OpenAI


class Chat:
    def __init__(self, prompt):
        self.prompt = prompt
        self.conversation = [{"role": "system", "content": prompt}]

    def message(self, content):
        self.conversation.append({"role": "user", "content": content})
        api_key = os.environ.get("CHAT_API_KEY")
        if api_key:
            client = OpenAI(api_key=api_key)
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=self.conversation,
            )
            reply = completion.choices[0].message.content
        else:
            response = requests.post("http://localhost:8080/chat", json=self.conversation)
            reply = response.json()["message"]
        self.conversation.append({"role": "assistant", "content": reply})
        return reply
