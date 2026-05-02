from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI(title="Auth Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

SECRET_KEY = "aiops-mca-project-secret-key-2024"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

users_db = {
    "admin@aiops.com": {
        "email": "admin@aiops.com",
        "hashed_password": pwd_context.hash("admin123"),
        "role": "admin",
        "name": "Admin User",
        "created_at": datetime.now().isoformat()
    }
}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "viewer"

def create_token(data: dict):
    expire = datetime.utcnow() + timedelta(hours=24)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@app.get("/health")
def health():
    return {"status": "auth service running"}

@app.post("/auth/login")
def login(request: LoginRequest):
    user = users_db.get(request.email)
    if not user or not pwd_context.verify(request.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": request.email, "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"],
        "email": user["email"]
    }

@app.post("/auth/register")
def register(request: RegisterRequest):
    if request.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    users_db[request.email] = {
        "email": request.email,
        "hashed_password": pwd_context.hash(request.password),
        "role": request.role,
        "name": request.name,
        "created_at": datetime.now().isoformat()
    }
    token = create_token({"sub": request.email, "role": request.role})
    return {
        "message": "Registration successful",
        "access_token": token,
        "token_type": "bearer",
        "role": request.role,
        "name": request.name,
        "email": request.email
    }

@app.get("/auth/users")
def get_users():
    return [{"email": u["email"], "name": u["name"], "role": u["role"],
             "created_at": u["created_at"]} for u in users_db.values()]