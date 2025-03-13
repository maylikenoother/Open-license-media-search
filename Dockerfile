# Use an official Python image as the base
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Ensure Alembic works by setting the correct directory
WORKDIR /app/backend

# Set PYTHONPATH to help with module resolution
ENV PYTHONPATH=/app

# Expose the port that FastAPI will run on
EXPOSE 8000

# Command to start the FastAPI server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
