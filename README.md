# 🥛 MilkNet — Hyperlocal Milk Delivery Platform

A full-stack hyperlocal milk delivery platform connecting customers 
with local milkmen, featuring real-time subscriptions, digital 
payments, and automated cloud deployment.

🔗 **Live Demo:** https://milknet-connected.vercel.app  
⚙️ **Backend API:** https://milknet-backend.onrender.com/api/health

---

## 🛠️ Tech Stack

**Frontend:** React · Vite · CSS  
**Backend:** Node.js · Express.js  
**Database:** MongoDB Atlas  
**Payments:** Razorpay  
**DevOps:** Docker · Kubernetes (Minikube) · GitHub Actions · Docker Hub  
**Hosting:** Vercel (Frontend) · Render (Backend)  

---

💡 What Makes MilkNet Different

Most delivery apps are marketplaces for big vendors. MilkNet is built specifically for individual local milkmen — the kind who deliver to your door every morning.

ProblemHow MilkNet Solves ItNo digital presence for local milkmenMilkmen get a profile with area, price, schedule, milk typesCustomers don't know who delivers in their areaSearch and filter by area, price, ratingCash-only payments cause tracking issuesRazorpay integration — UPI, card, netbankingNo subscription trackingMonthly expense dashboard with chartsFake or incomplete listingsMilkmen only appear in search after completing their profile.

---
🔐 Dual Role System

The app works completely differently depending on who logs in:

As a Customer:


Browse and search milkmen by area
View ratings, reviews, delivery schedule
Subscribe to a milkman for daily delivery
Pay monthly via Razorpay
Track expenses with monthly charts
Toggle auto-pay on/off


As a Milkman:


Set up delivery area, price per litre, milk types
Set delivery days and time window
Toggle availability (on leave / accepting customers)
View active subscribers and earnings
Profile only visible to customers after setup is complete
---
✨ Key Features


🔐 JWT Role-based Auth — same login page, completely different experience for Customer vs Milkman
🔍 Smart Search — filter by area, availability, price; sort by rating or reviews
📅 Subscription Model — daily recurring delivery, not one-time orders
💳 Razorpay Integration — real HMAC signature verification, not just a UI demo
📊 Expense Dashboard — monthly bar charts, payment history, due reminders
⭐ Review System — one review per customer per milkman, auto-updates average rating
🔔 Payment Reminders — banner notification for pending payments
---

## 🚀 CI/CD Pipeline

Every `git push` to `main` automatically:

git push → GitHub Actions → Docker Hub → Render (auto deploy)

1. Builds Docker image (multi-stage build)
2. Pushes to Docker Hub (`adriannaa3/milknet-frontend`)
3. Triggers Render deployment

---

## 🐳 Docker + Kubernetes

- Containerized with **Docker multi-stage builds**
- Deployed locally on **Kubernetes (Minikube)** with:
  - 2 backend replicas + 2 frontend replicas
  - Nginx Ingress Controller
  - PersistentVolumeClaim for MongoDB
  - HorizontalPodAutoscaler (CPU-based scaling)
  - Kubernetes Secrets and ConfigMaps

---

## 🏃 Run Locally

```bash
# Clone the repo
git clone https://github.com/adriannaa-anand/MILKNET-connected.git
cd MILKNET-connected

# Install dependencies
npm install

# Create .env file
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key

# Start dev server
npm run dev
```

---

## 📁 Project Structure
```
MILKNET-connected/
├── src/
│   ├── Components/
│   │   ├── AuthModal/
│   │   ├── Navbar/
│   │   ├── MilkmanCard/
│   │   ├── RazorpayModal/
│   │   ├── ExpenseChart/
│   │   └── TransactionList/
│   ├── pages/
│   │   ├── Landing/
│   │   ├── Dashboard/
│   │   ├── Milkmen/
│   │   ├── MilkmanProfile/
│   │   ├── MilkmanDashboard/
│   │   └── Payments/
│   ├── context/
│   │   └── AuthContext.jsx
│   └── utils/
│       ├── api.js
│       └── s3Upload.js
├── Dockerfile
├── nginx.conf
└── .github/
└── workflows/
└── deploy.yml

```
---

## 🔗 Related Repositories

- **Backend:** https://github.com/adriannaa-anand/milknet-server
- **Docker Hub:** https://hub.docker.com/u/adriannaa3

Click Commit changes → Commit directly to main.
