# Planning Document: Spiritual Candle Shop Website

## Project Overview
Build a full-stack spiritual candle shop website allowing customers to browse products, search, create user profiles, add to cart, and securely checkout.  
Backend powered by Node.js/Express and MongoDB with user authentication.

---

## Tech Stack

- **Frontend:**  
  - React (bootstrapped with Vite)  
  - React Router for navigation  
  - Tailwind CSS for styling  
  - Context API or Redux for state management  
  - Axios for API requests  

- **Backend:**  
  - Node.js + Express  
  - MongoDB + Mongoose (user, product, order models)  
  - JSON Web Tokens (JWT) for authentication  
  - bcrypt for password hashing  

- **Payment:**  
  - PayPal or Stripe (integration in later phase)  

---

## Core Features

### Frontend  
- Responsive NavBar with Search bar  
- Product listing with filters and pagination  
- Product detail pages  
- User Registration & Login pages with form validation  
- User profile dashboard (order history, saved info)  
- Shopping cart and checkout flow  

### Backend  
- RESTful API for products, users, orders  
- Secure user authentication (register, login, protected routes)  
- MongoDB data models for users, products, orders  
- Integration with payment gateway (phase 2)  

---

## Suggested Routes

| Frontend Routes      | Backend API Routes         |
|---------------------|---------------------------|
| `/` (Home)          | `GET /api/products`       |
| `/shop`             | `GET /api/products/:id`   |
| `/product/:id`      | `POST /api/users/register`|
| `/login`            | `POST /api/users/login`   |
| `/profile`          | `GET /api/users/:id`      |
| `/cart`             | `POST /api/orders`        |
| `/checkout`         | ...                       |

---

## Milestones & Estimated Timeline

| Milestone                         | Tasks                                                     | Estimated Time      |
|----------------------------------|-----------------------------------------------------------|---------------------|
| **1. Project Setup & Frontend**  | Scaffold React app with Vite, install Tailwind, setup router and global state | 2-3 days            |
| **2. Backend Setup**              | Initialize Express app, connect MongoDB, define data models (User, Product, Order) | 2-3 days            |
| **3. User Authentication**       | Register/login API, JWT tokens, frontend auth pages, protected routes | 3-4 days            |
| **4. Product Catalog & Search**  | Backend product APIs, frontend product listing, detail, search/filter | 3-4 days            |
| **5. Shopping Cart & Checkout UI**| Cart state management, checkout page UI (without payment integration) | 2-3 days            |
| **6. Payment Integration**        | Add PayPal/Stripe integration for payments (optional phase) | 2-3 days            |
| **7. Styling & Responsiveness**   | Final UI polish, mobile-friendly design, accessibility improvements | 2 days              |
| **8. Testing & Deployment**       | Basic tests, bug fixes, deploy backend and frontend (e.g., Vercel + Heroku) | 2 days              |

---

## Next Steps

1. Confirm tech stack and feature list with client  
2. Bootstrap frontend and backend projects  
3. Set up MongoDB (Atlas or local) and connect backend  
4. Implement user auth (registration/login with JWT)  
5. Build product APIs and frontend UI  

---

## Notes

- Keep payment integration as a second phase to avoid blocking MVP  
- Use environment variables for sensitive info (DB URI, JWT secret)  
- Consider adding admin features later (product management, order tracking)  

---

