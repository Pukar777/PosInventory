# 🍽️ Restaurant Inventory

A full-stack **Restaurant Management System** built with **Laravel 12** (backend) and **React + TypeScript** (frontend). The application covers core restaurant operations including inventory tracking, order management, real-time updates, and analytics — all in one place.

---

## 📋 Table of Contents

- [About the App](#about-the-app)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the App](#running-the-app)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## 📖 About the App

**Restaurant Inventory** is a modern, full-stack web application designed to help restaurant owners and managers streamline their day-to-day operations. It provides a centralized dashboard to manage:

- **Inventory** — Track stock levels, get low-stock alerts, and manage suppliers.
- **Orders** — Create, update, and monitor customer orders in real time.
- **Menu Management** — Manage menu items, categories, and pricing.
- **Analytics** — Visualize sales trends, revenue, and inventory usage through charts.
- **Real-time Notifications** — Powered by Laravel Reverb (WebSockets) and Laravel Echo for live order and stock updates.

---

## ✨ Features

- 🛒 **Order Management** — Place, track, and complete orders with status updates
- 📦 **Inventory Tracking** — Monitor stock quantities and receive low-stock alerts
- 🍕 **Menu Management** — Add/edit menu items with categories and pricing
- 📊 **Dashboard & Analytics** — Charts and KPIs for sales, revenue, and stock
- 🔔 **Real-time Updates** — Live notifications via WebSockets (Laravel Reverb + Pusher.js)
- 🔐 **Authentication** — Secure login and role-based access
- 📱 **Responsive UI** — Mobile-friendly design with Tailwind CSS

---

## 🛠️ Tech Stack

### Backend — `Laravel 12`

| Package | Version | Purpose |
|---|---|---|
| `laravel/framework` | ^12.0 | Core PHP framework |
| `laravel/reverb` | ^1.7 | WebSocket server for real-time events |
| `laravel/tinker` | ^2.10.1 | REPL for artisan interaction |
| `php` | ^8.2 | Runtime |
| **Dev** | | |
| `fakerphp/faker` | ^1.23 | Fake data for seeders |
| `laravel/pail` | ^1.2.2 | Real-time log viewer |
| `laravel/pint` | ^1.24 | PHP code style fixer |
| `laravel/sail` | ^1.41 | Docker dev environment |
| `phpunit/phpunit` | ^11.5.3 | Testing framework |
| `nunomaduro/collision` | ^8.6 | Better error reporting |

### Frontend — `React 19 + TypeScript` (Bun)

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.0 | UI library |
| `react-dom` | ^19.2.0 | DOM rendering |
| `react-router-dom` | ^7.13.0 | Client-side routing |
| `@tanstack/react-query` | ^5.90.21 | Server state management & caching |
| `zustand` | ^5.0.11 | Client-side state management |
| `axios` | ^1.13.5 | HTTP client |
| `react-hook-form` | ^7.71.1 | Form handling |
| `@hookform/resolvers` | ^5.2.2 | Zod integration for forms |
| `zod` | ^4.3.6 | Schema validation |
| `recharts` | ^3.7.0 | Charts & data visualization |
| `laravel-echo` | ^2.3.0 | WebSocket client for Laravel Reverb |
| `pusher-js` | ^8.4.0 | Pusher/Reverb WebSocket driver |
| `lucide-react` | ^0.574.0 | Icon library |
| `sonner` | ^2.0.7 | Toast notifications |
| `date-fns` | ^4.1.0 | Date formatting utilities |
| `currency.js` | ^2.0.4 | Currency formatting |
| **Dev** | | |
| `vite` | ^7.3.1 | Build tool & dev server |
| `typescript` | ~5.9.3 | Type safety |
| `tailwindcss` | 3 | Utility-first CSS framework |
| `postcss` + `autoprefixer` | latest | CSS processing |
| `eslint` | ^9.39.1 | Linting |

---

## 📁 Project Structure

```
Restaurant-Inventory/
├── backend/                  # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   └── Events/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── .env
│   └── composer.json
│
├── frontend/                 # React + TypeScript (Bun)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── types/
│   │   └── main.tsx
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## ✅ Prerequisites

Make sure you have the following installed:

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Bun** >= 1.x — [Install Bun](https://bun.sh)
- **Node.js** >= 20.x (optional, Bun handles most tasks)
- **MySQL** / **PostgreSQL** / **SQLite**
- **Git**

---

## 🚀 Getting Started

### Backend Setup

```bash
# Navigate to the backend folder
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# (Optional) Seed the database with sample data
php artisan db:seed
```

### Frontend Setup

```bash
# Navigate to the frontend folder
cd frontend

# Install JS dependencies using Bun
bun install
```

---

## ▶️ Running the App

### Backend (Laravel)

```bash
cd backend

# Start all backend services (server + queue + logs)
composer run dev
```

This runs concurrently:
- `php artisan serve` — API server at `http://localhost:8000`
- `php artisan queue:listen` — Background job worker
- `php artisan pail` — Real-time log viewer
- `php artisan reverb:start` — WebSocket server

### Frontend (React + Vite)

```bash
cd frontend

# Start the Vite dev server
bun run dev
```

Frontend runs at: **`http://localhost:5173`**

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
APP_NAME="Restaurant Inventory"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurant_inventory
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=reverb
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
VITE_REVERB_APP_KEY=
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

---

## 📄 License

This project is open-sourced under the [MIT License](https://opensource.org/licenses/MIT).

---

> Built with ❤️ using Laravel 12 + React 19 + TypeScript + Bun
