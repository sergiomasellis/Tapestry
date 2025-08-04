# Tapestry - Family Calendar Application

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Overview
Tapestry is a modern, touch-friendly multi-user calendar application designed for families. It provides a weekly view of events, chore tracking with a point system, and a leaderboard to encourage children to complete their tasks.

<img width="1103" height="1030" alt="image" src="https://github.com/user-attachments/assets/5041e590-4f73-4ef0-bba1-71757d9381a1" />

## Features
- Weekly calendar view with events
- Event details view
- Chore tracking with points system
- Leaderboard for family members
- Goal setting and prize tracking

## Tech Stack
- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: FastAPI with SQLAlchemy
- Database: SQLite (for development)- 


## Project Structure
```
.
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   └── postcss.config.js
└── backend/
    ├── main.py
    ├── models.py
    ├── schemas.py
    ├── crud.py
    ├── database.py
    └── requirements.txt
```

## Getting Started

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Create a virtual environment:
   ```
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Run the backend server:
   ```
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```

## Database
The application uses SQLite for development. The database file (`tapestry.db`) will be created automatically when you run the backend for the first time.

## API Endpoints
The backend provides RESTful API endpoints for:
- Users management
- Family groups management
- Events management
- Chores management
- Points tracking
- Goals management

## Contributing
To contribute to Tapestry:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the [MIT License](./LICENSE) © 2025 Sergio Masellis.
