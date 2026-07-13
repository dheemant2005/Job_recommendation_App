import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3,
)

resume_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a professional resume analyser.
Analyse the given resume text and provide:
1. Key Skills found
2. Experience Level (Junior/Mid/Senior)
3. Strengths
4. Areas to Improve
5. Suggested Job Roles

Keep the analysis short and structured."""),
    ("human", "{resume_text}")
])

resume_chain = resume_prompt | llm


def analyse_resume(resume_text: str) -> str:
    try:
        response = resume_chain.invoke({"resume_text": resume_text})
        return response.content
    except Exception as e:
        api_key = os.getenv("GROQ_API_KEY", "")
        if "dummy" in api_key or "invalid" in str(e).lower() or "401" in str(e):
            return (
                f"🤖 [DEMO MODE - Mock Resume Analysis]\n\n"
                f"To get real AI resume analysis, please set a valid `GROQ_API_KEY` in `backend/.env`.\n\n"
                f"Here is a mock analysis based on your resume text:\n\n"
                f"1. **Key Skills**: Identified from input text (e.g. Python, SQL, React, etc.)\n"
                f"2. **Experience Level**: Estimated based on keywords\n"
                f"3. **Strengths**: Professional layout and clear project descriptions\n"
                f"4. **Areas to Improve**: Add more quantifiable achievements and metrics\n"
                f"5. **Suggested Job Roles**: Software Engineer, Web Developer"
            )
        raise e

