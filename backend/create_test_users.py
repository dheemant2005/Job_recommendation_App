import asyncio
from sqlalchemy.future import select
from database import SessionLocal
from models.users import User
from utils.security import hash_password

async def create_user(name, email, password, role):
    async with SessionLocal() as db:
        # Check if user exists
        result = await db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        if not user:
            hashed = hash_password(password)
            new_user = User(name=name, email=email, hashed_password=hashed, role=role)
            db.add(new_user)
            await db.commit()
            print(f"Created {role} user: {email} / {password}")
        else:
            print(f"User {email} already exists.")

async def main():
    await create_user("Test Admin", "admin@example.com", "adminpassword", "admin")
    await create_user("Test Candidate", "candidate@example.com", "candidatepassword", "candidate")

if __name__ == "__main__":
    asyncio.run(main())
