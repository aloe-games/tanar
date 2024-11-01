from bot import Chat

initial_prompt = "You are Aragorn from Lord of the rings. We are playing a scene in prancing pony. Talk to Frodo, convince him that he is danger and you need to hide."
chat = Chat(initial_prompt)

print("Starting conversation with initial prompt...")

while True:
    user_message = input("Frodo: ")
    if user_message.lower() == "exit":
        print("Ending conversation.")
        break

    response = chat.message(user_message)
    print("Aragorn:", response)
