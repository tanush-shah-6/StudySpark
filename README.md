# StudySpark ✨

StudySpark is an AI-powered collaborative learning platform that enables students to generate custom flashcards & quizzes using Gemini, join real-time collaborative study rooms, and study together seamlessly.

---

## 🚀 Features

- **🤖 Gemini-Powered Study Tools**: Generate custom flashcards and multiple-choice quizzes on any topic in seconds.
- **💬 Real-Time Study Rooms**: Create, join, and collaborate in study rooms with live WebSocket chat.
- **🔒 Secure Authentication**: User registration and login powered by JWT & bcrypt.
- **✨ Responsive & Modern UI**: Built with React & Vite featuring glassmorphism and intuitive tabs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Socket.io-client, CSS3
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT
- **AI**: Google Generative AI (Gemini Flash)

---

## 📁 Project Structure

```
StudySpark/
├── backend/
│   ├── models/            # MongoDB Schemas (User, StudyRoom, etc.)
│   ├── routes/            # Express Route Handlers
│   ├── sockets/           # Socket.io Real-time Handlers
│   ├── middleware/        # JWT Authentication Middleware
│   ├── server.js          # Express & Socket Server Entrypoint
│   └── .env.example       # Backend Environment Variables Template
└── frontend/
    ├── public/            # Static Assets & Images
    ├── src/
    │   ├── components/    # Reusable UI & Feature Components
    │   ├── pages/         # Route Views (Tools, StudyRoom, Auth, etc.)
    │   ├── config.js      # Dynamic API URL Configuration
    │   ├── App.jsx        # Root Component & Route Definitions
    │   └── index.jsx      # React Entrypoint
    └── vite.config.js     # Vite Configuration
```

---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/tanush-shah-6/StudySpark.git
cd StudySpark
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

(Optional) Create a `.env` in `frontend/` if connecting to a deployed backend:
```env
VITE_API_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

- **Backend**: Deploy the `backend/` folder on [Render](https://render.com/) or [Railway](https://railway.app/) as a Node Web Service.
- **Frontend**: Deploy the `frontend/` folder on [Vercel](https://vercel.com/) with the environment variable `VITE_API_URL` pointing to your deployed backend URL.

---

## 📄 License
This project is open-source and available under the MIT License.