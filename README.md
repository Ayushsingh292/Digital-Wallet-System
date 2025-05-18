
# Digital Wallet System – Backend API

A secure and extensible backend system for a digital wallet platform, built using **Node.js**, **Express**, and **MongoDB**. This API allows user authentication, wallet operations, transaction tracking, fraud detection, and admin analytics.

---

## Features

### 1. User Authentication & Session Management
- Secure registration & login using hashed passwords (`bcrypt`)
- Token-based session management using JWT
- Authentication middleware to protect routes

### 2. Wallet Operations
- Deposit, withdraw, and transfer funds
- Track wallet balances
- Transaction history per user
- Soft delete support for users and transactions

### 3. Transaction Validation
- Prevent overdrafts, invalid amounts, or transfers to self
- Atomic transfer processing (ensuring consistency)

### 4. Fraud Detection (Basic)
- Flags:
  - Large withdrawals
  - Multiple transfers in a short period
- Logs suspicious activity
- Daily fraud scan via scheduled job

### 5. Admin & Reporting APIs
- View flagged transactions
- Top users by wallet balance
- Aggregate total balance

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT, bcrypt
- **Utilities**: dotenv, node-cron
- **API Testing**: Postman

---

##  Setup Instructions

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/digital-wallet-backend.git
   cd digital-wallet-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file**

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the server**

   ```bash
   npm start
   ```

   Server will run on `http://localhost:5000`.

---

##  API Routes Overview

| Method | Endpoint                      | Description                      |
|--------|-------------------------------|----------------------------------|
| POST   | `/auth/register`              | Register a new user              |
| POST   | `/auth/login`                 | Login & get token                |
| GET    | `/wallet/balance`             | Get wallet balance (auth)        |
| POST   | `/wallet/deposit`             | Deposit funds                    |
| POST   | `/wallet/withdraw`            | Withdraw funds                   |
| POST   | `/wallet/transfer`            | Transfer to another user         |
| GET    | `/wallet/transactions`        | View transaction history         |
| GET    | `/admin/flagged`              | View flagged transactions        |
| GET    | `/admin/top-users`            | Top users by balance             |
| GET    | `/admin/aggregate`            | Aggregate total balance          |

---

## Optional Features (Bonus)
- [x] Scheduled fraud scan using `node-cron`
- [x] Soft delete for users & transactions
- [ ] Email notifications (placeholder only)

---

##  Project Structure

```
digital-wallet-backend/
├── models/
│   ├── User.js
│   └── Transaction.js
├── routes/
│   ├── auth.js
│   ├── wallet.js
│   └── admin.js
├── middleware/
│   ├── auth.js
│   └── fraudDetection.js
├── utils/
│   └── scheduledJobs.js
├── .env
├── app.js
└── README.md
```

---

##  Postman Collection (Optional)
You can test endpoints using Postman. Ensure you pass the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_token_here>
```

---

##  Deployment Notes

This project is backend-only and should be deployed on platforms like:
- [Render](https://render.com)
- [Railway](https://railway.app)
- [Cyclic](https://cyclic.sh)
- [Heroku](https://heroku.com)

---

## 👨‍💻 Author

**Ayush Singh**

📧 Contact: Singhayush6234@gmail.com  
🌐 GitHub: [github.com/Ayushsingh292](https://github.com/Ayushsingh292)

---

## License

This project is licensed under the [MIT License](LICENSE).
