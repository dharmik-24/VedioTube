# VideoTube - Full-Stack Video Streaming Platform

VideoTube is a comprehensive, YouTube-like video streaming platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It features secure user authentication, robust video management, community features like comments and tweets, and a sleek, responsive user interface.

## 🚀 Features

*   **User Authentication & Security:** Secure registration, login, and logout using JWT (JSON Web Tokens) and bcrypt for password hashing.
*   **Video Management:** Upload, publish, edit, and delete videos. Video files and thumbnails are securely stored and managed using Cloudinary.
*   **Community Interaction:** 
    *   Like and dislike videos, comments, and tweets.
    *   Comment on videos and reply to existing comments.
    *   Post and interact with text-based "tweets" in a dedicated feed.
*   **Subscriptions:** Subscribe to channels, manage your subscriptions, and view subscriber counts.
*   **Playlists:** Create, update, and manage custom playlists. Add or remove videos from playlists.
*   **Dashboard:** A comprehensive user dashboard to track channel statistics, video views, and overall engagement.
*   **Responsive UI:** A modern, mobile-friendly interface built with React and Tailwind CSS.

## 🛠️ Technology Stack

### Frontend
*   **Framework:** React.js (v18) built with Vite
*   **State Management:** Redux Toolkit & React-Redux
*   **Routing:** React Router v6
*   **Styling:** Tailwind CSS
*   **API Requests:** Axios
*   **Icons:** Lucide React
*   **Notifications:** React Hot Toast

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB & Mongoose
*   **Authentication:** JSON Web Tokens (JWT)
*   **Media Storage:** Cloudinary & Multer (for file uploads)
*   **Security & Utilities:** bcrypt, cors, cookie-parser, dotenv

## 📂 Project Structure

```
DTT/
├── backend/            # Express.js REST API Server
│   ├── src/
│   │   ├── controllers/  # Request handlers for different routes
│   │   ├── db/           # Database connection setup
│   │   ├── middlewares/  # Custom Express middlewares (auth, multer)
│   │   ├── models/       # Mongoose database schemas
│   │   ├── routes/       # API route definitions
│   │   ├── utils/        # Helper functions and utilities
│   │   ├── app.js        # Express app configuration
│   │   └── index.js      # Server entry point
│   └── package.json    # Backend dependencies and scripts
│
├── frontend/           # React.js Client Application
│   ├── src/            # React source code (components, pages, store, etc.)
│   ├── index.html      # Main HTML template
│   ├── vite.config.js  # Vite configuration
│   └── package.json    # Frontend dependencies and scripts
│
└── README.md           # Project Documentation
```

## ⚙️ Local Development Setup

To run this project locally, you will need to start both the backend and frontend development servers.

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create an `.env` file in the `backend` directory based on the following variables:
    ```env
    PORT=8000
    MONGODB_URI=your_mongodb_connection_string
    CORS_ORIGIN=http://localhost:5173 # Or your frontend URL
    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRY=10d
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
4.  Start the backend development server:
    ```bash
    npm run dev
    ```
    The server should now be running on `http://localhost:8000`.

### 2. Frontend Setup

1.  Open a new terminal window and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    The application should now be accessible in your browser, typically at `http://localhost:5173`.

## 📜 API Endpoints Overview

The backend exposes several RESTful endpoints organized under `/api/v1`:

*   `/users` - Authentication, profile management, watch history.
*   `/videos` - Video CRUD operations, publishing.
*   `/tweets` - Tweet CRUD operations.
*   `/subscriptions` - Subscribe, unsubscribe, view channel subscribers.
*   `/playlist` - Playlist creation and management.
*   `/likes` - Toggle likes on videos, comments, and tweets.
*   `/comments` - Add, edit, and delete video comments.
*   `/dashboard` - Channel statistics and uploaded videos.
*   `/healthcheck` - Server status verification.

## 👥 Author

*   Dharmik Kansara
