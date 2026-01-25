# Habit Tracker - Full-Stack Application
This project is a habit tracking app designed to help users build consistency by keeping daily and weekly routines in one place. This app provides a simple “Today” dashboard, quick daily check-ins, and progress insights (streaks and completion rates) so users can clearly see what to do next and how they’re improving over time.

## Project Description
The core functionality of this project is adding habits and keeping track of whether you have completed them or not. The Progress Dashboard shows percentages of habits completed in the past 7 or 30 days, with blue meaning complete, and yellow meaning incomplete. It also has a streak counter and tells you out of the last 7 or 30 days what percentage of your habits you have completed overall and individually.

## Technologies Used

### Frontend
- **React 19** - UI library for building interactive user interfaces
- **Vite** - Fast build tool and development server
- **React Router DOM 7** - Client-side routing and navigation
This project was created using Flask for the backend and React for the frontend.

### Backend
- **Flask 3.0** - Python web framework
- **Flask-SQLAlchemy 3.1** - ORM for database operations
- **Flask-JWT-Extended 4.6** - JWT token management for authentication
- **Flask-CORS 4.0** - Cross-origin resource sharing
- **bcrypt 4.1** - Password hashing and security
- **flask-migrate 4.0** -Simplifies database schema migrations for applications using SQLAlchemy.
- **SQLAlchemy** - Database abstraction layer


## Setup and Run Instructions

### Backend Setup
1. **Install backend dependencies:**
    ```bash
   pipenv install
   ```
2. **Create virtual environment:**
    ```bash
   pipenv shell
   ```
3. **Navigate to server directory:**
   ```bash
   cd server
   ```
4. **Start flask server:**
   ```bash
   flask run --port 5555
   ```

    The backend needs to run at **http://localhost:5555**

### Frontend Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start React App:**
   ```bash
   npm run start
   ```

   The frontend will run at **http://localhost:4000**
   To see some sample data, you can login with username: Ben, and password: password123


### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| GET | `/habits` | List habits  | Yes |
| POST | `/habits` | Create habits | Yes |
| PATCH | `/habits/:id` | Update habit | Yes |
| DELETE | `/habits/:id` | Delete habit | Yes |
| POST | `/habits/:id/checkin` | Complete a habit| Yes |
| GET | `/today` | See today dashboard | Yes |
| GET | `/progress` | See habits progress | Yes |