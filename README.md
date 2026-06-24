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

## ✨ Features

- 🔐 JWT authentication with role-based access (Customer / Milkman)
- 🥛 Browse and search local milkmen by area, price, rating
- 📅 Subscribe to a milkman for daily delivery
- 💳 Pay monthly subscriptions via Razorpay (UPI / Card / NetBanking)
- 📊 Expense dashboard with monthly charts
- ⭐ Review and rating system
- 🧑‍🌾 Milkman dashboard to manage profile, schedule, availability

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
