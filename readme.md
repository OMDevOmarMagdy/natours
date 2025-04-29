# Natours Project

A fully-featured Node.js application for managing tours, users, and bookings—a comprehensive project that demonstrates modern backend development practices.

## Table of Contents

- [Natours Project](#natours-project)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Installation](#installation)
    - [2. Available Endpoints](#2-available-endpoints)
      - [Authentication](#authentication)
      - [Tours](#tours)
      - [Bookings](#bookings)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)

## Overview

**Natours** is a tour booking application built with a focus on scalability, security, and maintainability. This project was created to hone practical skills in Node.js and Express, as well as working with MongoDB via Mongoose. It includes a robust RESTful API, user authentication, error handling, and production-ready deployment strategies.

## Features

- **RESTful API** for tours, users, and bookings
- **Authentication & Authorization** using JWT
- **Image Uploading** and cloud storage integration
- **Data Validation** and error handling
- **Security Enhancements:** Data sanitization, rate limiting, secure HTTP headers (Helmet)
- **Deployment Ready:** Configurations for Heroku and MongoDB Atlas
- **Logging:** Request logging and global error management

## Tech Stack

- **Backend Framework:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** Helmet, express-rate-limit, mongo-sanitize
- **File Upload:** Multer (for handling image uploads)
- **Deployment:** Heroku, MongoDB Atlas

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/OMDevOmarMagdy/natours.git
   cd natours

   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory and fill it based on the `.env.example` provided.

   Example:

   ```env
   PORT=3000
   DATABASE=your_database_connection_string
   DATABASE_PASSWORD=your_database_password
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

> 🔥 **Important:** Never push your real `.env` file to GitHub!

---

## Usage

### 1. Start the development server

```bash
npm run dev
```

The API will run on:  
`http://localhost:3000/api/v1/`

---

### 2. Available Endpoints

#### Authentication

- `POST /api/v1/users/signup`
- `POST /api/v1/users/login`
- `PATCH /api/v1/users/updateMyPassword`

#### Tours

- `GET /api/v1/tours`
- `GET /api/v1/tours/:id`
- `POST /api/v1/tours` (admin only)
- `PATCH /api/v1/tours/:id` (admin only)
- `DELETE /api/v1/tours/:id` (admin only)

#### Bookings

- `POST /api/v1/bookings/checkout-session/:tourId`

---

## Environment Variables

Make sure your `.env` file includes (minimum):

```bash
PORT=3000
DATABASE=your_database_url
DATABASE_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=90d
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## Project Structure

```plaintext
natours/
├── controllers/           # Route controllers for handling requests
├── models/                # Mongoose models
├── routes/                # Express routes
├── public/                # Static assets
├── utils/                 # Utility functions (error handling, email, etc.)
├── config/                # Configuration files (database, cloudinary)
├── .env.example           # Example environment variables
├── .gitignore             # Files to ignore in Git
├── package.json           # Project metadata and dependencies
├── server.js              # Entry point of the app
└── README.md              # Project documentation
```
