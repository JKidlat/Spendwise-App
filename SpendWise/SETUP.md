# Quick Setup Guide

Follow these steps to get SpendWise up and running:

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

### 3. Initialize Database
```bash
# Generate Prisma Client
npm run db:generate

# Create database and tables
npm run db:push

# Seed default categories
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Quick Test

1. Register a new account at `/register`
2. Login at `/login`
3. Add an expense at `/expenses`
4. View dashboard at `/dashboard`
5. Manage categories at `/categories`

## Troubleshooting

**Database errors?**
- Delete `prisma/dev.db` and run `npm run db:push` again

**Authentication not working?**
- Check that `.env` file exists and has `JWT_SECRET` set
- Clear browser localStorage and try again

**Build errors?**
- Delete `node_modules` and `.next` folder
- Run `npm install` again

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Switch to PostgreSQL database
- [ ] Update `DATABASE_URL` to PostgreSQL connection string
- [ ] Set up environment variables on hosting platform
- [ ] Enable HTTPS
- [ ] Run `npm run build` to test production build
