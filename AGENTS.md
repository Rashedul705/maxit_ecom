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
- **Git Hygiene**: Commit after completing each milestone with descriptive git messages.
