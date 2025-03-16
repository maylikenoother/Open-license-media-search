from starlette.middleware.sessions import SessionMiddleware
import os

def add_session_middleware(app):
    SECRET_KEY = os.getenv("SECRET_KEY") 
    app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, same_site="lax")


