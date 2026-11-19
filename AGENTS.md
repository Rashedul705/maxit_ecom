# AGENTS.md

## Agent Guidelines for maxitshop

### Code Standards
- **Currency**: Always use BDT with the symbol `৳` (e.g. `৳1,250`).
- **Endpoints**: Prefix all API routes with `/api/v1`.
- **Response Format**: Every Express endpoint must strictly return:
  ```json
  {
    "success": true,
    "data": ...,
    "message": "Optional message"
  }
  ```
- **Error Handling**: Use central error handling middleware in Express; never leak stack traces in production.
- **Data Layer**: Keep controllers thin, delegate queries and data mutations to `services/`.
- **Frontend Components**: Server Components by default; use `'use client'` only when state/effects are required.
- **Design Tokens**: Adhere strictly to the design specifications in `DESIGN.md`. Do not invent random colors.
- **Admin URL Standard (CRITICAL)**: The Admin Panel must ALWAYS be served and accessed strictly on the main storefront domain path `domain.com/admin` (e.g. `http://localhost:3001/admin` in local development). **NEVER** expose, link, or instruct the user to visit the admin panel via a raw backend port, server link, or standalone dev port (e.g. never use `:5173` or `:5002`). Next.js rewrites must route `/admin` directly so the user only ever interacts with `domain.com/admin`.
- **Git Hygiene**: Commit after completing each milestone with descriptive git messages.
