# 🏢 Consultancy Management System

A full-stack web application for managing consultancy operations — clients, projects, consultants, invoices, appointments, and AI-powered assistance — built with **Flask** (Python), **Next.js** (TypeScript), and **MySQL**.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Database Setup](#1-database-setup)
  - [Backend Setup](#2-backend-setup)
  - [Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Overview](#api-overview)
- [License](#license)

---

## ✨ Features

- 🔐 **Authentication & Authorization** — JWT-based login/register with role-based access (Admin, Consultant, Client)
- 👥 **Client Management** — Add, update, and manage client profiles and contact information
- 📁 **Project Management** — Track projects, milestones, statuses, and assignments
- 🧑‍💼 **Consultant Management** — Manage consultant profiles, skills, and workloads
- 📅 **Appointment Scheduling** — Book and manage appointments between clients and consultants
- 🧾 **Invoice & Billing** — Generate and track invoices with payment status
- 📂 **File Uploads** — Attach and manage documents for projects and clients
- 🤖 **AI Assistant** — Integrated AI chat for smart consultancy recommendations (powered by `g4f`)
- 📊 **Dashboard & Analytics** — Overview charts and key metrics using Recharts
- 📧 **Email Notifications** — Automated email alerts via Flask-Mail

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| Flask | 3.0.0 | Web framework |
| Flask-SQLAlchemy | 3.1.1 | ORM |
| Flask-JWT-Extended | 4.6.0 | JWT authentication |
| Flask-Migrate | 4.0.5 | Database migrations |
| Flask-CORS | 4.0.0 | Cross-origin support |
| Flask-Mail | 0.9.1 | Email notifications |
| PyMySQL | 1.1.0 | MySQL connector |
| bcrypt | 4.1.2 | Password hashing |
| g4f | 0.3.1.7 | AI integration |
| marshmallow | 3.20.1 | Serialization |
| pytest | 7.4.3 | Testing |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.1 | React framework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 4 | Styling |
| Axios | 1.13.2 | HTTP client |
| Recharts | 3.6.0 | Data visualization |
| react-markdown | 10.1.0 | Markdown rendering |
| date-fns | 4.1.0 | Date utilities |

### Database
- **MySQL** (via XAMPP or standalone MySQL server)

---

## 📂 Project Structure

```
app/
├── backend/                  # Flask API server
│   ├── app/
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── routes/           # API route blueprints
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Helper utilities
│   │   ├── config.py         # App configuration
│   │   ├── extensions.py     # Flask extensions
│   │   └── __init__.py       # App factory
│   ├── migrations/           # Flask-Migrate migration files
│   ├── tests/                # Pytest test suite
│   ├── uploads/              # Uploaded files storage
│   ├── seed_demo_data.py     # Demo data seeder script
│   ├── run.py                # App entry point
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
│
├── frontend/                 # Next.js frontend
│   ├── src/                  # Source code
│   │   └── app/              # Next.js App Router pages & components
│   ├── public/               # Static assets
│   ├── package.json          # Node.js dependencies
│   └── next.config.ts        # Next.js configuration
│
├── consultancy_db.sql        # Full MySQL database dump
└── README.md
```

---

## ✅ Prerequisites

Make sure you have the following installed:

- **Python** 3.10 or higher
- **Node.js** 18 or higher & **npm**
- **MySQL** (via [XAMPP](https://www.apachefriends.org/) or standalone MySQL Server)
- **Git**

---

## 🚀 Installation

### 1. Database Setup

1. Start your MySQL server (e.g., start Apache & MySQL in XAMPP Control Panel).
2. Open **phpMyAdmin** (or MySQL CLI) and create a new database named `consultancy_db`.
3. Import the provided SQL dump:

```bash
mysql -u root -p consultancy_db < consultancy_db.sql
```

Or via phpMyAdmin: select the `consultancy_db` database → **Import** → choose `consultancy_db.sql`.

---

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy the environment file and configure it
cp .env.example .env
# Edit .env with your MySQL credentials and secret keys (see Environment Variables section)

# Run database migrations
flask db upgrade

# (Optional) Seed demo data
python seed_demo_data.py
```

---

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory by copying `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Then fill in the values:

```env
# App
FLASK_ENV=development
SECRET_KEY=your-super-secret-key-change-this
JWT_SECRET_KEY=your-jwt-secret-key-change-this

# MySQL Database (XAMPP default)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=          # Leave empty for XAMPP default; set if you have a password
MYSQL_DB=consultancy_db

# CORS — must match your frontend URL
CORS_ORIGINS=http://localhost:3000

# Email (optional — for notification features)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=noreply@consultancy.com
```

> **Note:** For Gmail, generate an [App Password](https://myaccount.google.com/apppasswords) if 2FA is enabled.

---

## ▶️ Running the Project

### Start the Backend Server

```bash
# From the backend/ directory, with virtual environment activated
cd backend
source venv/bin/activate   # macOS/Linux
python run.py
```

The Flask API will be available at: **http://localhost:5000**

---

### Start the Frontend Development Server

```bash
# From the frontend/ directory
cd frontend
npm run dev
```

The Next.js app will be available at: **http://localhost:3000**

---

> **Tip:** Run both servers simultaneously in separate terminal windows.

---

## 🔌 API Overview

The backend exposes RESTful API endpoints under the `/api` prefix. Core route groups:

| Route Group | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Register, login, logout, token refresh |
| Users | `/api/users` | User profile management |
| Clients | `/api/clients` | Client CRUD operations |
| Consultants | `/api/consultants` | Consultant management |
| Projects | `/api/projects` | Project tracking |
| Appointments | `/api/appointments` | Scheduling |
| Invoices | `/api/invoices` | Billing and payments |
| Files | `/api/files` | File upload/download |
| AI | `/api/ai` | AI assistant chat |

All protected routes require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## 🧪 Running Tests

```bash
# From the backend/ directory, with virtual environment activated
cd backend
pytest tests/ -v
```

---

## 📄 License

This project is developed for educational purposes.

---

*Built with ❤️ using Flask + Next.js + MySQL*
