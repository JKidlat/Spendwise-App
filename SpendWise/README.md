# SpendWise - Expense Tracker Web Application

SpendWise is a complete, production-ready, full-stack expense tracker web application that allows users to track their daily expenses, categorize them, view spending summaries, and manage their financial habits.

## 🚀 Features

### Core Features

1. **User Authentication**
   - Email/password signup and login
   - Secure session handling with JWT
   - Password hashing with bcrypt

2. **Expense Management**
   - Add expenses (amount, category, date, description)
   - Edit expenses
   - Delete expenses
   - View all expenses in a list
   - Filter by date range or category

3. **Categories**
   - Default categories: Food, Transport, Bills, Shopping, Entertainment, Other
   - Add custom categories with custom colors
   - Cannot delete categories that are in use

4. **Dashboard & Analytics**
   - Total expenses for the month/week
   - Line chart for daily spending trends
   - Pie chart for category breakdown
   - Category breakdown table with percentages
   - Switch between weekly and monthly views

5. **Export & Sharing**
   - Export expense reports as PDF
   - Share via WhatsApp link
   - Share via Email link

6. **Currency Management**
   - Switch between multiple currencies (USD, EUR, GBP, NGN, GHS)
   - User preference saved per account

7. **UI/UX**
   - Clean, modern UI with TailwindCSS
   - Mobile-responsive design
   - Reusable components
   - Loading states and error handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** for styling
- **React Query** for data fetching
- **Chart.js** with react-chartjs-2 for charts
- **jsPDF** for PDF generation

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **SQLite** (can be switched to PostgreSQL)
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Zod** for validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SpendWise
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: Email configuration for password reset (not implemented yet)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@spendwise.com"
```

**⚠️ Important:** Change `JWT_SECRET` to a random, secure string in production!

### 4. Database Setup

Generate Prisma Client:

```bash
npm run db:generate
```

Create the database and run migrations:

```bash
npm run db:push
```

Seed default categories:

```bash
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
SpendWise/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── expenses/        # Expense CRUD endpoints
│   │   ├── categories/      # Category management endpoints
│   │   ├── dashboard/       # Dashboard statistics endpoint
│   │   ├── export/          # PDF export endpoint
│   │   └── user/            # User settings endpoints
│   ├── dashboard/           # Dashboard page
│   ├── expenses/            # Expenses page
│   ├── categories/          # Categories page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (redirects)
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── lib/                     # Utility functions and configurations
│   ├── prisma.ts            # Prisma client instance
│   ├── auth.ts              # Authentication utilities
│   ├── auth-context.tsx     # Auth context provider
│   ├── api.ts               # API client functions
│   ├── utils.ts             # General utilities
│   └── pdf-export.ts        # PDF generation utilities
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script for default categories
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🗄️ Database Schema

### User
- `id`: Unique identifier
- `email`: User email (unique)
- `password`: Hashed password
- `name`: User name (optional)
- `currency`: Preferred currency (default: USD)
- `createdAt`, `updatedAt`: Timestamps

### Category
- `id`: Unique identifier
- `name`: Category name
- `userId`: User ID (null for default categories)
- `isDefault`: Boolean flag
- `color`: Hex color code for UI
- `createdAt`: Timestamp

### Expense
- `id`: Unique identifier
- `amount`: Expense amount (float)
- `description`: Optional description
- `date`: Expense date
- `userId`: Foreign key to User
- `categoryId`: Foreign key to Category
- `createdAt`, `updatedAt`: Timestamps

## 🔐 Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt
3. User is created in database
4. User is automatically logged in after registration
5. JWT token is generated and stored in localStorage
6. Token is sent with each API request in Authorization header
7. API routes verify token before processing requests

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses (with optional filters)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get single expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create custom category
- `DELETE /api/categories/[id]` - Delete custom category

### Dashboard
- `GET /api/dashboard?period=week|month` - Get dashboard statistics

### Export
- `GET /api/export?startDate=&endDate=` - Get expense report data

### User
- `PUT /api/user/currency` - Update user currency preference

## 🧪 Testing the Application

1. **Register a new account:**
   - Go to `/register`
   - Fill in email and password
   - Submit the form

2. **Add an expense:**
   - Navigate to `/expenses`
   - Click "Add Expense"
   - Fill in amount, category, date, and description
   - Submit

3. **View dashboard:**
   - Go to `/dashboard`
   - View total expenses, charts, and category breakdown
   - Switch between week and month views
   - Change currency preference

4. **Manage categories:**
   - Go to `/categories`
   - View default categories
   - Add custom categories with colors
   - Delete custom categories (if not in use)

5. **Export report:**
   - Go to `/expenses`
   - Set date range filters
   - Click "Export PDF"
   - PDF will be downloaded

## 🚢 Production Deployment

### Important Steps:

1. **Change JWT_SECRET** to a secure random string
2. **Use PostgreSQL** instead of SQLite for production:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/spendwise"
   ```
3. **Run migrations:**
   ```bash
   npm run db:migrate
   ```
4. **Build the application:**
   ```bash
   npm run build
   ```
5. **Start production server:**
   ```bash
   npm start
   ```

### Recommended Hosting:
- **Vercel** (best for Next.js)
- **Railway** (includes database)
- **Render** (good for full-stack apps)
- **AWS** or **DigitalOcean** (for custom deployments)

## 🔒 Security Best Practices

- ✅ Passwords are hashed using bcrypt
- ✅ JWT tokens for authentication
- ✅ Input validation with Zod
- ✅ SQL injection protection via Prisma ORM
- ✅ CORS protection (if needed)
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting for API routes
- ⚠️ Add CSRF protection for forms

## 🐛 Troubleshooting

### Database Issues
- Ensure Prisma Client is generated: `npm run db:generate`
- Reset database: Delete `prisma/dev.db` and run `npm run db:push` again

### Authentication Issues
- Clear localStorage and try logging in again
- Check that JWT_SECRET is set in `.env`

### Build Issues
- Delete `node_modules` and `.next` folder
- Run `npm install` again
- Run `npm run build`

## 📚 Learning Resources

This project is designed to be beginner-friendly with:
- Clear code comments
- Organized folder structure
- TypeScript for type safety
- Reusable components
- Standard Next.js patterns

## 🤝 Contributing

This is a starter project, but feel free to:
- Add new features
- Improve UI/UX
- Fix bugs
- Add tests
- Improve documentation

## 📄 License

This project is open source and available for educational purposes.

## ✨ Future Enhancements

- [ ] Forgot password functionality with email
- [ ] Email notifications
- [ ] Recurring expenses
- [ ] Budget planning
- [ ] Multi-currency conversion
- [ ] Data import/export (CSV)
- [ ] Dark mode
- [ ] Mobile app (React Native)

## 📞 Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**
