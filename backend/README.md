# 🍽️ Restaurant Inventory (Backend)

The backend API for the **Restaurant Inventory Management System**, built with **Laravel 12**. It powers the entire system with a robust REST API, real-time WebSockets (Laravel Reverb), and strict business logic for stock management.

---

## 🛠️ Tech Stack

- **Framework**: Laravel 12 (PHP 8.2+)
- **Database**: MySQL / PostgreSQL
- **Real-time**: Laravel Reverb (WebSockets)
- **Authentication**: Laravel Sanctum (API Tokens)
- **ORM**: Eloquent (Relationships, Scopes, Accessors)
- **Testing**: PHPUnit / Pest

---

## ✨ Key Features

### 🔐 Authentication & Roles
- **Sanctum API Tokens** for secure stateless authentication.
- **Role-based Access Control (RBAC)**:
  - **Admin**: Full access to dashboard, inventory, menu, and users.
  - **Waiter**: Access to order creation and management.

### 📦 Inventory & Stock Logic
- **Critical Stock Deduction Algorithm**: Uses `DB::transaction` and pessimistic locking (`lockForUpdate`) to prevent race conditions during high-volume ordering.
- **Automatic Stock Alerts**: Triggers notifications when ingredients fall below minimum thresholds.
- **Stock Movement Logs**: Immutable history of every stock change (orders, manual adjustments).

### 📡 Real-time Events
- **Order Updates**: Status changes pushed instantly to waiter and kitchen screens.
- **Live Dashboard**: Admin stats update in real-time without page refreshes.

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- MySQL or other supported DB

### Installation

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Run migrations and seeders
php artisan migrate --seed
```

### Running the Server

```bash
# Start API server, Queue, and Reverb (WebSockets)
composer run dev
```
Runs at `http://localhost:8000`

---

## 📚 API Endpoints

### Public
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | User login (Admin/Waiter) |
| `GET` | `/api/customer/menu/{token}` | View menu via QR code |
| `POST` | `/api/customer/order/{token}` | Place guest order |

### Protected (Admin)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Analytics & Stats |
| `API` | `/api/categories` | CRUD Categories |
| `API` | `/api/menu-items` | CRUD Menu Items |
| `API` | `/api/ingredients` | CRUD Ingredients |
| `POST` | `/api/ingredients/{id}/stock-in` | Add stock manually |
| `API` | `/api/modifiers` | CRUD Modifiers |
| `API` | `/api/tables` | Manage Tables & QR Codes |

### Protected (Waiter)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | View active orders |
| `POST` | `/api/orders` | Create new order |
| `PATCH` | `/api/orders/{id}/status` | Update status (Pending → Delivered) |

---

## 🗄️ Database Schema

The system uses 13 relational tables:
- **Core**: `users`, `categories`, `menu_items`
- **Inventory**: `ingredients`, `recipes` (pivot), `stock_movements`
- **Orders**: `orders`, `order_items`, `tables`
- **Modifiers**: `modifiers`, `menu_item_modifiers`, `order_item_modifiers`

---

## 🧪 Testing

```bash
# Run feature & unit tests
php artisan test
```
