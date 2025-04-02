# Open License Media Search

A comprehensive web application for searching open-license media using the Openverse API. This project demonstrates the application of software engineering principles to create a user-friendly and robust application.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Development](#development)
  - [Project Structure](#project-structure)
  - [Design Patterns](#design-patterns)
  - [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## Overview

This application provides a platform for searching and managing open-license media from various sources. Users can:

- Search for images and audio with advanced filtering
- Save bookmarks for future reference
- Track search history
- View detailed media information

## Features

### User Account Management
- User registration and authentication via Clerk
- Secure user data handling

### Media Search Interface
- Integration with Openverse API
- Advanced search filtering capabilities
- Image and audio support
- Responsive user interface

### Media Management
- Save and organize bookmarks
- View and manage search history
- View detailed media information

### Software Engineering Best Practices
- Modular architecture
- Containerization with Docker
- Automated testing
- Clean, well-documented code

## Architecture

The application follows a modern web architecture:

- **Frontend**: React-based Single Page Application (SPA)
- **Backend**: FastAPI-based RESTful API
- **Database**: PostgreSQL relational database
- **Authentication**: Clerk authentication service

The architecture implements the following design patterns:
- Model-View-Controller (MVC)
- Repository Pattern
- Service Layer
- Dependency Injection

## Technology Stack

### Frontend
- React (with hooks and context)
- Material UI component library
- React Router for navigation
- React Query for data fetching
- Clerk for authentication

### Backend
- FastAPI (Python web framework)
- SQLAlchemy ORM
- Alembic for database migrations
- Pydantic for data validation

### Infrastructure
- Docker and Docker Compose for containerization
- PostgreSQL database

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local development)
- Clerk account for authentication

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/open-license-media-search.git
   cd open-license-media-search
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

3. Edit the environment files to add your Clerk authentication keys and other configuration.

### Configuration

1. Create a Clerk application at https://clerk.dev
2. Add your Clerk publishable key to `frontend/.env`
3. Add your Clerk JWT issuer and JWKS URL to `backend/.env`
4. (Optional) Sign up for an Openverse API key for higher rate limits

### Running the Application

Using Docker Compose:

```bash
docker-compose up
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8000
- Frontend on port 3000

Access the application at http://localhost:3000

### Running Without Docker (Development)

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Development

### Project Structure

```
open-license-media-search/
├── .env.example
├── docker-compose.yml
├── README.md
├── backend/
│   ├── alembic.ini
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── tests/
└── frontend/
    ├── index.html
    ├── package.json
    ├── src/
        ├── components/
        ├── hooks/
        ├── pages/
        ├── services/
        └── styles/
```

### Design Patterns

The application implements the following design patterns:

1. **Repository Pattern**: Encapsulates database operations for each entity
2. **Service Layer**: Contains business logic and orchestrates operations
3. **Dependency Injection**: Components receive their dependencies via constructor or function parameters
4. **MVC (Model-View-Controller)**: Separation of concerns between data, UI, and logic

### Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd frontend
npm test
```

## Deployment

The application is containerized and can be deployed to any Docker-compatible environment:

1. Build production Docker images:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```

2. Deploy to your chosen platform (AWS, GCP, Azure, etc.)

## License

This project is released under the MIT License. See the LICENSE file for details.

---

*This project was created as part of the CMP9134 Software Engineering module at the University of Lincoln.*