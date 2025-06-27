# Listify Backend

A simple backend API for a music playlist app where users can create playlists and add songs to them.

## What This Does

This is the backend (server) part of a music app. It handles:

- User registration and login
- Creating and managing playlists
- Adding songs to playlists
- Storing all the data in a database

## How It Works

### User Management

- Users can sign up with their name, email, and password
- Users can log in and get a special token to access their account
- The app remembers who you are using this token

### Playlists

- Users can create playlists with a name and description
- Users can see all their playlists
- Users can update playlist details or delete playlists
- Users can search through their playlists

### Songs

- Users can add songs to their playlists
- Each song has: title, artists, album, duration, cover image, and Spotify links
- If a song doesn't exist in the database, it gets created automatically
- Users can remove songs from playlists

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Log into your account
- `GET /api/auth/profile` - Get your profile info

### Playlists

- `POST /api/playlists` - Create a new playlist
- `GET /api/playlists` - Get all your playlists
- `GET /api/playlists/:id` - Get a specific playlist
- `PUT /api/playlists/:id` - Update a playlist
- `DELETE /api/playlists/:id` - Delete a playlist

### Songs in Playlists

- `POST /api/playlists/:id/add-song` - Add a song to a playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove a song from a playlist

## Setup

### Prerequisites

- Node.js installed on your computer
- MongoDB database (you can use MongoDB Atlas for free)

### Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Create a `.env` file with your database connection and secret key
4. Run `npm run dev` to start the development server

### Environment Variables

Create a `.env` file with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_for_tokens
PORT=3000
```

## Running the App

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on `http://localhost:3000`

## Data Structure

### User

- name, email, password, profile image

### Playlist

- name, description, list of songs, owner

### Song

- title, artists (array), album, duration, cover image, Spotify ID and URL

## Security Features

- Passwords are encrypted before storing
- Users need a valid token to access their data
- Rate limiting prevents too many requests
- Each user can only access their own playlists

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - Database helper
- **JWT** - User authentication
- **bcrypt** - Password encryption

## Project Structure

```
src/
├── app.js              # Main server file
├── config/             # Database and environment setup
├── controllers/        # Business logic for each feature
├── middleware/         # Authentication and security
├── models/            # Database schemas
└── routes/            # API endpoints
```

This backend is designed to work with a frontend app that handles the user interface. The frontend would make requests to these API endpoints to manage playlists and songs.
