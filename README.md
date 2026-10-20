# maxitshop

E-Commerce platform tailored for Bangladesh, engineered with Next.js (App Router, TypeScript, Tailwind CSS) and Express.js REST API. Layout, structure, and design closely inspired by BDShop with customized branding, high-conversion UX, and BDT (৳) currency.

## Applications & Ports

| Application | Technology | Port | Local URL |
|-------------|------------|------|-----------|
| **Frontend** (Shop & Admin) | Next.js 14/15, Tailwind, TS | `3000` | [http://localhost:3000](http://localhost:3000) |
| **Backend** (REST API) | Node.js, Express | `5000` | [http://localhost:5000](http://localhost:5000) |

## Quick Start Guide

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Git

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend runs on `http://localhost:5000` (API base: `http://localhost:5000/api/v1`).

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Frontend runs on `http://localhost:3000`.

### 4. Admin Access
- URL: `http://localhost:3000/admin`
- Default Admin Token: `admin_secret_token_123` (configured in `backend/.env`)

## Project Structure
```
maxitshop/
├── backend/          # Express API server with mock/db services
├── frontend/         # Next.js customer shop + admin portal
├── docs/reference/   # Reference screenshots & architecture guides
├── DESIGN.md         # Detailed design specification matching BDShop aesthetics
├── AGENTS.md         # Developer & Agent instructions
└── plan.txt          # Implementation plan & status checklist
```
