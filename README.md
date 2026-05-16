# Finlytics

**Finlytics** is a full-stack personal finance web application built with the MERN stack. It helps individuals track income and expenses, visualize spending patterns, and plan ahead with scheduled transactions—all from a clean, responsive dashboard.

Managing money across categories and time periods is easier when everything lives in one place. Finlytics combines secure authentication, structured transaction management, and real-time analytics so users can see their financial picture at a glance. Completed transactions drive your balance and charts; future-dated entries stay scheduled until their date, so projections stay accurate without skewing current totals.

This project demonstrates production-oriented patterns: REST APIs with MVC structure, JWT-based auth with role-based access, MongoDB aggregations for analytics, and a modern React frontend with Tailwind CSS and Recharts.

---

## Features

- **User authentication** — Register, login, logout, and forgot-password flow with bcrypt-hashed passwords
- **30-day SSO session** — JWT stored client-side; stay signed in without re-entering credentials daily
- **Role-based access** — `admin` and `user` roles; admins manage users from a dedicated panel
- **Transaction CRUD** — Add, edit, and delete income/expense entries with amount, category, date, and description
- **Predefined categories** — Food, Travel, Shopping, Salary, Bills, and more (validated on the server)
- **Filters** — Filter transactions by category, type (income/expense), date range, and status
- **Scheduled transactions** — Future-dated entries are marked `scheduled` and excluded from balance and charts until they become due
- **Dashboard analytics** — Total income, total expenses, and net balance for a selected period
- **Charts** — Pie chart (expenses by category) and line chart (spending trends over time)
- **Pagination & CSV export** — Paginated transaction lists and export to CSV
- **Dark mode** — Theme toggle with persisted preference
- **Responsive UI** — Mobile-friendly layout built with Tailwind CSS

---

## Tech Stack


| Layer          | Technologies                               |
| -------------- | ------------------------------------------ |
| **Backend**    | Node.js, Express.js, MongoDB, Mongoose     |
| **Frontend**   | React 18, Vite, React Router, Tailwind CSS |
| **Auth & API** | JSON Web Tokens (JWT), bcrypt, Axios       |
| **Charts**     | Recharts                                   |
| **Tooling**    | dotenv, cors, morgan, concurrently         |


---

## Screenshots

Add your screenshots under the `screenshots/` folder, then reference them here.

### Dashboard

Overview of income, expenses, balance, and analytics charts for the selected date range

Finlytics dashboard with summary cards and charts
![Dashboard](./screenshots/Dashboard.png)

### Transactions

Completed and scheduled transactions with filters, pagination, and CSV export

Finlytics transactions page
![Transactions](./screenshots/Transactions.png)

### Add Transaction

Create income or expense entries with category, date, and description

Add transaction modal
![Add Transaction](./screenshots/Add_Transaction.png)

### Scheduled Transaction

Future-dated entries are saved as scheduled and excluded from balance and charts until due

Scheduled transaction with future date
![Scheduled](./screenshots/Add_Scheduled_Transaction.png)

### Admin Panel

Administrators can view system stats and manage user roles

Finlytics admin panel
![Admin](./screenshots/AdminPanel.png)

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [MongoDB](https://www.mongodb.com/) (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm (included with Node.js)

---

## Installation & Setup

### Clone the repository

```bash
git clone https://github.com/BhumikaSigadapu3/Finlytics.git
cd finlytics
```

### Install dependencies (root + server + client)

From the project root:

```bash
npm install
npm run install:all
```

### Backend setup

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your MongoDB URI and secrets (see [Environment variables](#environment-variables)), then:

```bash
npm run dev
```

The API runs at **[http://localhost:5000](http://localhost:5000)** by default.

### Frontend setup

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The app runs at **[http://localhost:5173](http://localhost:5173)**.

### Run both from the root (recommended)

```bash
# From project root (after install:all)
npm run dev
```

### Seed sample data (optional)

```bash
npm run seed
```


| Role  | Email               | Password    |
| ----- | ------------------- | ----------- |
| Admin | `admin@example.com` | `admin1234` |
| User  | `demo@example.com`  | `demo1234`  |


---

## Environment Variables

### Backend (`server/.env`)


| Variable           | Description                                         | Example                           |
| ------------------ | --------------------------------------------------- | --------------------------------- |
| `PORT`             | HTTP port for the API                               | `5000`                            |
| `MONGODB_URI`      | MongoDB connection string (use a dedicated DB name) | `mongodb://127.0.0.1:27017/test1` |
| `JWT_SECRET`       | Secret key for signing JWTs                         | Long random string                |
| `JWT_EXPIRES_IN`   | Token lifetime                                      | `30d`                             |
| `SSO_SESSION_DAYS` | SSO session length (days)                           | `30`                              |
| `CLIENT_ORIGIN`    | Allowed CORS origin(s) for the frontend             | `http://localhost:5173`           |
| `SMTP_*`           | Optional — send password-reset emails               | See `server/.env.example`         |


**Atlas tip:** append your database name to the URI, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/test1?appName=Cluster0`.

### Frontend (`client/.env` — optional)


| Variable       | Description                                    | Example                     |
| -------------- | ---------------------------------------------- | --------------------------- |
| `VITE_API_URL` | API base URL when not using the Vite dev proxy | `http://localhost:5000/api` |


In development, Vite proxies `/api` to the backend, so you can omit `VITE_API_URL`.

> **Note:** This project uses **Vite**, not Create React App. The frontend env prefix is `VITE_`, not `REACT_APP_`.

---

## Folder Structure

```
finlytics/
├── client/                 # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── components/     # UI components (charts, forms, layout)
│       ├── context/        # Auth & theme (Context API)
│       ├── pages/          # Route-level screens
│       ├── services/       # Axios API clients
│       └── utils/          # Helpers (CSV export, session)
├── server/                 # Express API
│   ├── config/             # Database connection
│   ├── constants/          # Categories, roles, statuses
│   ├── controllers/        # Route handlers (MVC)
│   ├── middleware/         # Auth, authorization, errors
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── scripts/            # Seed script
│   └── utils/              # Tokens, mail, transaction status
├── data/                   # Sample JSON payloads
├── screenshots/            # README images (add your own)
└── package.json            # Root scripts (dev, seed)
```

---

## API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication (`/api/auth`)


| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| POST   | `/register`        | Create account            |
| POST   | `/login`           | Sign in (returns JWT)     |
| GET    | `/me`              | Current user (protected)  |
| POST   | `/logout`          | Log out (protected)       |
| POST   | `/forgot-password` | Request password reset    |
| POST   | `/reset-password`  | Reset password with token |


### Transactions (`/api/transactions`)


| Method | Endpoint      | Description                                                            |
| ------ | ------------- | ---------------------------------------------------------------------- |
| GET    | `/`           | List transactions (`?status=completed|scheduled`, filters, pagination) |
| POST   | `/`           | Create transaction                                                     |
| GET    | `/:id`        | Get one transaction                                                    |
| PUT    | `/:id`        | Update transaction                                                     |
| DELETE | `/:id`        | Delete transaction                                                     |
| GET    | `/categories` | List predefined categories                                             |


### Analytics (`/api/analytics`)


| Method | Endpoint              | Description                               |
| ------ | --------------------- | ----------------------------------------- |
| GET    | `/summary`            | Income, expense, balance (completed only) |
| GET    | `/category-breakdown` | Pie chart data                            |
| GET    | `/spending-trends`    | Line chart data                           |


### Admin (`/api/admin`) — admin role only


| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| GET    | `/users`          | List users        |
| PATCH  | `/users/:id/role` | Update user role  |
| DELETE | `/users/:id`      | Delete user       |
| GET    | `/stats`          | System statistics |


Protected routes require header: `Authorization: Bearer <token>`.

---

## Production Build

```bash
npm run build --prefix client
```

Serve the `client/dist` folder with a static host and point `VITE_API_URL` to your deployed API.

---

## Future Improvements

- Recurring transactions (monthly rent, subscriptions)
- Email/push notifications for upcoming scheduled payments
- PDF export and advanced reporting
- Budget limits per category with alerts
- Multi-currency support
- OAuth login (Google / GitHub)

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please keep changes focused, follow existing code style, and test locally before submitting.

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Finlytics

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Author

Name: Bhumika Sigadapu  
GitHub profile: [https://github.com/BhumikaSigadapu3](https://github.com/BhumikaSigadapu3)  
LinkedIn:  [https://www.linkedin.com/in/bhumika-sigadapu-44b34a280/](https://www.linkedin.com/in/bhumika-sigadapu-44b34a280/)  
