# 🥛 MilkNet — Frontend

Hyperlocal milk delivery platform built with **Vite + React**.

---

## 📁 Project Structure

```
MILKNET/
├── index.html
├── vite.config.js
├── package.json
├── eslint.config.js
├── .env                         ← AWS / Razorpay keys (never commit)
└── src/
    ├── main.jsx                 ← Vite entry point
    ├── App.jsx                  ← Root component + page router
    ├── App.css
    ├── index.css                ← Global styles + CSS variables
    ├── assets/                  ← Images, icons, fonts
    ├── Components/
    │   ├── Navbar/              ← Navbar.jsx + Navbar.css
    │   ├── AuthModal/           ← AuthModal.jsx + AuthModal.css
    │   ├── MilkmanCard/         ← MilkmanCard.jsx + MilkmanCard.css
    │   ├── S3Upload/            ← S3Upload.jsx + S3Upload.css
    │   ├── RazorpayModal/       ← RazorpayModal.jsx + RazorpayModal.css
    │   ├── ExpenseChart/        ← ExpenseChart.jsx + ExpenseChart.css
    │   └── TransactionList/     ← TransactionList.jsx + TransactionList.css
    ├── pages/
    │   ├── Landing/             ← Landing.jsx + Landing.css
    │   ├── Dashboard/           ← Dashboard.jsx + Dashboard.css
    │   ├── Milkmen/             ← Milkmen.jsx + Milkmen.css
    │   ├── MilkmanProfile/      ← MilkmanProfile.jsx + MilkmanProfile.css
    │   └── Payments/            ← Payments.jsx + Payments.css
    ├── data/
    │   ├── milkmenData.js       ← Mock milkmen (swap with API later)
    │   └── transactionsData.js  ← Mock transactions
    ├── hooks/
    │   └── useAuth.js           ← Auth state hook
    └── utils/
        ├── api.js               ← Axios instance with JWT interceptor
        └── s3Upload.js          ← AWS S3 upload helper
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server  →  http://localhost:3000
npm run dev

# 3. Build for production
npm run build
```

---

## 🔌 Connecting to Backend

1. Start your Express server on port `5000`
2. The Vite proxy in `vite.config.js` will forward `/api/*` automatically
3. Replace mock data in `src/data/` with real `axios` calls from `src/utils/api.js`

---

## ₹ Razorpay Setup

- Add your Razorpay Key ID to `.env`
- In `RazorpayModal.jsx`, replace the mock `setTimeout` with the real Razorpay JS SDK:

```js
const rzp = new window.Razorpay({ key: import.meta.env.VITE_RAZORPAY_KEY_ID, ... })
rzp.open()
```
