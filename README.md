# Social Media App

A full-stack social media application with authentication, post feed, friend connections, real-time chat, and 1:1 video calling.


## Note

Due to Render's free tier limitations, real-time features like messaging and video calling will not work. Note that the Render free tier may require additional startup time.

## Demo

- Live demo: [https://socialmediaweb-jb1b.onrender.com/](https://socialmediaweb-jb1b.onrender.com/)
- YouTube demo: [https://youtu.be/B1IpjAvUjRI](https://youtu.be/B1IpjAvUjRI)

## Features

- User registration and login (JWT-based auth)
- Profile management (username, age, gender, birthday, bio)
- Profile image upload (base64 image upload, stored on server)
- Follow/unfollow users
- User suggestions and username search
- Feed with friends' posts
- Create, edit, and delete posts
- Like/unlike posts
- Add and remove comments
- Real-time chat with Socket.IO
- Chat notifications (in-app toasts + browser notification support)
- 1:1 audio/video calling (WebRTC via PeerJS + Socket.IO signaling)
- Responsive Vue UI with Bootstrap and Bootstrap Icons

## Tech Stack

### Frontend

- Vue 3
- Vue Router
- Vuex
- Vite
- Socket.IO Client
- Bootstrap 5 + Bootstrap Icons
- PeerJS (loaded in `socialMediaFrontEnd/index.html`)

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT (`jsonwebtoken`) + `bcryptjs`
- `dotenv`

### Tooling / Ops

- Cypress (E2E test setup)
- Docker + Docker Compose
- Nodemon

## Project Structure

- `index.js`: Express app + API mounting + static serving for production build
- `socket.js`: Socket.IO events for chat/call flows
- `routes/`: API endpoints (`users`, `posts`, `rooms`)
- `models/`: Mongoose schemas
- `socialMediaFrontEnd/`: Vue app source
- `dist/`: Built frontend assets served by backend
- `uploads/`: Uploaded profile images

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm
- MongoDB connection string (local or Atlas)

## Environment Variables (Backend)

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
CORS_ORIGINS=http://localhost:5173
```

Notes:
- `CORS_ORIGINS` can be a comma-separated list.
- Keep secrets out of version control.

## Run Locally (Development)

This project runs as two apps in development:
- Backend API/socket server on `http://localhost:3000`
- Frontend Vite dev server on `http://localhost:5173`

### 1) Install dependencies

From the project root:

```bash
npm install
```

For frontend:

```bash
cd socialMediaFrontEnd
npm install
```

### 2) Start backend

From project root:

```bash
npm start
```

### 3) Start frontend

In a second terminal:

```bash
cd socialMediaFrontEnd
npm run dev
```

Vite is configured to proxy `/api` requests to `http://localhost:3000`.

## Run with Docker

The Dockerfile builds frontend assets, then serves them from the backend container.

```bash
docker compose up --build
```

App will be available on:
- `http://localhost:3000`

## Build for Production

Build frontend manually:

```bash
cd socialMediaFrontEnd
npm run build
```

The backend serves static files from root `dist/`.

## API Overview

### Auth & Users

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `POST /api/user/profile/image`
- `DELETE /api/user/profile`
- `GET /api/user/suggestions/:limit`
- `GET /api/user/:search`
- `POST /api/user/follow/:friend_id`
- `POST /api/user/unfollow/:friend_id`

### Posts

- `GET /api/post/all`
- `POST /api/post/`
- `PUT /api/post/`
- `DELETE /api/post/`
- `PUT /api/post/:postId/like`
- `POST /api/post/:postId/comment`
- `DELETE /api/post/:postId/comment/:commentId`

### Rooms

- `GET /api/room/`
- `POST /api/room/call`

## Real-time Events (Socket.IO)

- Chat: `join room`, `read room`, `chat message`, `notification`, `chat init`
- Call: `start call`, `decline call`, `join-call`, `call-peers`, `user-connected`, `user-disconnected`, `leave call`

## Testing

Cypress is configured in the repository.

```bash
npx cypress open
```

## Notes

- Authentication token is expected in `Authorization` header.
- Uploaded profile images are served from `/uploads/profile-images/...`.
- Frontend routes require login except `login` and `register`.
