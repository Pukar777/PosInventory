# Phase 1: MVP (Foundation & CRUD) - Detailed Tasks

Based on the roadmap, here are the detailed tasks for Phase 1.

## 1. Project Setup
- [ ] **Shadcn/UI Installation**
  - [x] Initialize Shadcn/UI (create `components.json`, `lib/utils.ts`)
  - [x] Configure `tailwind.config.ts` for Shadcn theme
  - [x] Add base styles to `src/index.css`
  - [ ] Test with a Button component

## 2. Authentication (Backend - Laravel)
- [x] **Install & Configure Sanctum**
  - [x] Run `composer require laravel/sanctum`
  - [x] Publish Sanctum configuration
- [x] Update `User` model with `HasApiTokens`
- [x] **Auth Controllers**
  - [x] Create `AuthController` (login, logout, me)
  - [x] Implement `login` method (validation, token creation)
  - [x] Implement `logout` method (token revocation)
- [x] **Role Middleware**
  - [x] Define roles (enum or simple string in database: `admin`, `waiter`)
  - [x] Create middleware `EnsureUserHasRole` or similar
  - [x] Register middleware in `bootstrap/app.php` or `kernel`

## 3. Authentication (Frontend - React)
- [ ] **Auth Context/Provider**
  - [x] Create `AuthContext`
  - [x] Implement `AuthProvider` with login/logout/user state
  - [x] Persist token in HttpOnly cookie or localStorage (basic MVP: localStorage + Bearer header)
- [x] **Login Page**
  - [x] Create Form with Email/Password
  - [x] Connect to Backend Login API
  - [x] Handle errors and redirect on success
- [x] **Protected Routes**
  - [x] Create `<ProtectedRoute>` wrapper check auth state
  - [x] Restrict Admin routes

## 4. Core Inventory (Admin)
- [x] **Database Schema (Migrations)**
  - [x] `categories`: id, name, icon?, timestamps
  - [x] `ingredients`: id, name, unit, cost, current_stock, timestamps
  - [x] `menu_items`: id, category_id, name, description, price, image_url, timestamps
  - [x] `ingredient_menu_item` (Recipe): menu_item_id, ingredient_id, quantity, timestamps
- [x] **API Resources (CRUD)**
  - [x] `CategoryController` (index, store, update, destroy)
  - [x] `IngredientController` (index, store, update, destroy)
  - [x] `MenuItemController` (index, store, update, destroy + image handling)
- [ ] **Frontend Management Pages**
  - [ ] **Categories**: List view, Add/Edit Modal
  - [ ] **Ingredients**: List view, Stock adjustment, Add/Edit Modal
  - [ ] **Menu Items**:
    - [ ] List view with images
    - [ ] Create/Edit Form (including Recipe builder/ingredient selector)
