# Cake Paradise by Sayu 🎂

A modern and responsive e-commerce platform built for **Cake Paradise by Sayu**, a custom cake business in Sri Lanka. The platform transforms traditional Facebook-based ordering into a complete digital storefront with online ordering, custom cake requests, and centralized management.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Made with](https://img.shields.io/badge/made%20with-React%20%7C%20Firebase-orange)

---

# 📖 About the Project

Cake Paradise by Sayu is a full-stack bakery management and online ordering system developed to digitize the business operations of a custom cake shop.

Instead of relying solely on Facebook or WhatsApp orders, customers can conveniently browse products, place orders, request customized cakes, and communicate with the bakery through a professional web application.

The system also provides an Admin Dashboard that allows administrators to manage products, categories, customer orders, inquiries, and website content efficiently.

---

# ✨ Features

## 🛒 Customer Features

- Browse all available cakes
- Search cakes instantly
- Filter cakes by category
- View detailed product information
- Add products to shopping cart
- Secure checkout process
- Submit custom cake requests
- Contact bakery directly
- View customer testimonials
- Fully responsive design

---

## 🔐 Admin Features

- Secure Admin Login
- Dashboard Overview
- Product Management (CRUD)
- Category Management
- Order Management
- Customer Management
- Contact Message Management
- Inventory Management
- Firebase Authentication

---

# 🎂 Product Categories

- Birthday Cakes
- Wedding Cakes
- Anniversary Cakes
- Cupcakes
- Brownies
- Pastries
- Cake Pops
- Seasonal Cakes
- Custom Cakes

---

# 🏗 Project Structure

```text
Cake-Paradise-By-Sayu/
│
├── public/
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── Admin/
│   │   ├── Customer/
│   │   ├── Layout/
│   │   └── Shared/
│   │
│   ├── pages/
│   │
│   ├── firebase/
│   │
│   ├── services/
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── styles/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── firebase.json
├── firestore.rules
├── storage.rules
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

---

# 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| React.js | Frontend Development |
| Vite | Build Tool |
| Firebase | Backend Platform |
| Firestore | Cloud Database |
| Firebase Authentication | User Authentication |
| Firebase Storage | Image Storage |
| React Router DOM | Navigation |
| EmailJS | Email Services |
| Lucide React | Icons |
| CSS3 | Styling |

---

# 🚀 Getting Started

## Prerequisites

Before running the project, install:

- Node.js (Version 18 or above)
- npm
- Git
- Firebase Account

---

## Clone the Repository

```bash
git clone https://github.com/yourusername/Cake-Paradise-By-Sayu.git

cd Cake-Paradise-By-Sayu
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## Run the Application

```bash
npm run dev
```

Open your browser:

```
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

---

## Preview Production Build

```bash
npm run preview
```

---

# 📱 System Workflow

```text
Customer
    │
    ▼
Visit Website
    │
    ▼
Browse Cakes
    │
    ▼
View Product Details
    │
    ▼
Add to Cart
    │
    ▼
Checkout
    │
    ▼
Order Confirmation
    │
    ▼
Admin Receives Order
```

---

# 📂 Firebase Collections

| Collection | Description |
|------------|-------------|
| products | Stores all cake products |
| categories | Product categories |
| orders | Customer orders |
| customOrders | Custom cake requests |
| customers | Customer information |
| testimonials | Customer reviews |
| contacts | Contact messages |

---

# 🔐 User Roles

## Customer

- Browse Products
- Search Products
- Add Items to Cart
- Place Orders
- Request Custom Cakes
- Contact Bakery

---

## Administrator

- Login Securely
- Manage Products
- Manage Categories
- Manage Orders
- Manage Customers
- View Dashboard
- Manage Contact Messages

---

# 🎯 Target Audience

- Birthday Celebrations
- Wedding Events
- Anniversary Celebrations
- Corporate Events
- Baby Showers
- Party Organizers
- Gift Buyers


---

# 🔮 Future Enhancements

- Online Payment Gateway
- Delivery Tracking
- Customer Accounts
- Wishlist
- Discount Coupons
- Loyalty Rewards
- AI-based Cake Recommendation

---

## 💖 Brand Vision

> **"Baking memories, one slice at a time."**

Cake Paradise by Sayu combines handcrafted artistry, premium ingredients, and exceptional customer service to create memorable cakes for every celebration.

---

## 📄 License

This project was developed for educational and portfolio purposes.

All branding, product images, and business content belong to **Cake Paradise by Sayu**.

---

## 👨‍💻 Developed By

### wenuri sanjana
