# PitchPointLabs

A full-stack contact application with an Express/MongoDB backend and a static HTML/CSS/JS frontend.

## Project structure

```
PitchPointLabs/
├── backend/          # Express API server
│   ├── config/        # Database connection setup
│   ├── controllers/   # Route logic
│   ├── middleware/     # Auth / admin key middleware
│   ├── models/         # Mongoose models
│   ├── routes/          # API routes
│   └── server.js        # App entry point
└── frontend/          # Static frontend (HTML/CSS/JS)
```

## Prerequisites

- Node.js (v18+ recommended)
- npm
- A MongoDB instance (local or hosted, e.g. MongoDB Atlas)
- An email account for sending mail (e.g. Gmail with an App Password)

## Setup

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd PitchPointLabs
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Configure environment variables**

   Copy the example env file and fill in your own values:
   ```bash
   cp backend/.env.example backend/.env
   ```

   Then edit `backend/.env`:
   ```
   DB_HOST=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   EMAIL_USER=
   EMAIL_APP_PASSWORD=
   CORS_ORIGINS=
   NODE_ENV=development
   ```

   > ⚠️ Never commit your real `backend/.env` file — it's already excluded via `.gitignore`.

4. **Run the backend**
   ```bash
   cd backend
   npm start
   ```

5. **Open the frontend**

   Open `frontend/indexx.html` in your browser, or serve the `frontend/` folder with any static file server.

## Notes

- The frontend communicates with the backend API — make sure `CORS_ORIGINS` in your `.env` includes the origin you're serving the frontend from.
- See `backend/frontend-fetch-example.js` for a reference on how the frontend calls the backend API.
