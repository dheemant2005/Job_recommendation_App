import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.5,
)

prompt_with_memory = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful career guidance assistant."),
    ("placeholder", "{chat_history}"),
    ("human", "{user_query}")
])

chain_with_memory = prompt_with_memory | llm

store = {}

def get_history(session_id: str) -> ChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

chat_with_memory = RunnableWithMessageHistory(
    runnable=chain_with_memory,
    get_session_history=get_history,
    input_messages_key="user_query",
    history_messages_key="chat_history"
)

def ask_career_chatbot_response(question: str, session_id: str = "default") -> str:
    try:
        response = chat_with_memory.invoke(
            {"user_query": question},
            {"configurable": {"session_id": session_id}}
        )
        return response.content
    except Exception as e:
        api_key = os.getenv("GROQ_API_KEY", "")
        if "dummy" in api_key or "invalid" in str(e).lower() or "401" in str(e):
            clean_q = question.strip().lower().rstrip("?.!")
            if clean_q in ["hi", "hello", "hey", "hola", "greetings", "good morning", "good afternoon", "good evening"]:
                return (
                    f"🤖 [DEMO MODE - Chatbot Greeting]\n\n"
                    f"Hello! I am your AI Career Coach. Currently, I am running in **Demo Mode** because no valid `GROQ_API_KEY` was found in your `backend/.env` file.\n\n"
                    f"Feel free to ask me career-related questions, or set up your API key to get personalized answers powered by Llama 3.3!"
                )
            return (
                f"🤖 [DEMO MODE - Mock Response]\n\n"
                f"To get real AI responses, please set a valid `GROQ_API_KEY` in your `backend/.env` file.\n\n"
                f"Here is some general career advice for your query: \"{question}\"\n\n"
                f"1. **Research & Prepare**: Always look up market rates for your role and experience level before interviews/negotiations.\n"
                f"2. **Highlight Achievements**: Focus on the value and impact you bring to the company, backed by metrics if possible.\n"
                f"3. **Practice**: Rehearse your key points so you can communicate them confidently."
            )
        raise e