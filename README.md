# Skill Lobang 🎓

> Transform your SkillsFuture course discovery and selection experience

Skill Lobang is a comprehensive web application designed to help users in Singapore efficiently discover, compare, and optimize their SkillsFuture credit spending. The platform aggregates courses from multiple providers, offers intelligent filtering and sorting capabilities, and provides actionable insights to maximize the value of your SkillsFuture journey.

## 🌟 Features

### Core Features
- **Course Discovery**: Aggregates SkillsFuture courses from public and private sources
- **Smart Filtering**: Filter by price, subsidy, session frequency, start/end dates, availability, and provider ratings
- **Credit Optimization**: Highlights courses optimal for users with soon-to-expire credits
- **Provider Reviews**: Comprehensive ratings and reviews system for training providers
- **Personal Dashboard**: Track saved courses, credits, and upcoming deadlines
- **Alert System**: Notifications for credit expiry and course registration deadlines

### User Experience
- **Responsive Design**: Optimized for desktop and mobile devices
- **Secure Authentication**: JWT-based authentication with secure session management
- **Personalized Recommendations**: Course suggestions based on user preferences and credit status
- **Real-time Updates**: Automated course data refresh and availability tracking

## 🏗️ Architecture

### Backend
- **Framework**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Redis for caching
- **Authentication**: JWT-based authentication
- **Data Aggregation**: Automated scraping service with scheduled updates
- **API**: RESTful API with comprehensive endpoint coverage

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Context API with Zustand for complex state
- **UI Components**: Custom component library with Lucide React icons
- **Forms**: React Hook Form with validation

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Database**: PostgreSQL with automated migrations
- **Caching**: Redis for session and data caching
- **Monitoring**: Comprehensive logging and error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skill-lobang.git
   cd skill-lobang
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Using Docker (Recommended)**
   ```bash
   # Start all services
   docker-compose up -d

   # The application will be available at:
   # Frontend: http://localhost:3000
   # Backend API: http://localhost:3001
   ```

4. **Manual Setup**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install

   # Start PostgreSQL and Redis
   # Then run the development servers
   cd ..
   npm run dev
   ```

## 📁 Project Structure

```
skill-lobang/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   ├── database/       # Database configuration
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── app/           # Next.js 14 app directory
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── styles/        # CSS styles
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Docker services
├── .env.example          # Environment variables template
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/skill_lobang

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Search and filter courses
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/categories` - Get available categories

### User Management
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/saved-courses` - Get saved courses
- `POST /api/users/saved-courses` - Save a course

### Reviews
- `GET /api/reviews/course/:courseId` - Get course reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

## 🚀 Deployment

### Production Build
```bash
# Build all services
npm run build

# Start production server
npm start
```

### Docker Production
```bash
# Build production images
docker-compose build

# Deploy
docker-compose up -d
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Properly configured CORS policies
- **Input Validation**: Comprehensive input validation with Joi
- **SQL Injection Prevention**: Parameterized queries

## 🔄 Data Aggregation

The application includes an automated course data aggregation system:

- **Scheduled Updates**: Daily course data refresh at 2 AM
- **Multiple Sources**: Supports various course providers and APIs
- **Error Handling**: Robust error handling and retry mechanisms
- **Data Validation**: Validates and normalizes course data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- SkillsFuture Singapore for providing the framework for skills development
- All the training providers who make learning accessible
- The open-source community for the amazing tools and libraries

---

**Built with ❤️ in Singapore for the SkillsFuture community**

# Prompt to Claude Code

```txt
## Project Overview  
Skill Lobang is a web app designed to transform the SkillsFuture course discovery and selection experience. It helps users quickly find, compare, and optimize their SkillsFuture credit spending by letting them sort and filter courses by pricing, subsidy, availability, course start/end dates, frequency, provider ratings, and more. The app addresses the pain point of users with expiring or unused credits by highlighting relevant courses and offering actionable insights on maximizing benefit.

## Key Features  
- Aggregates SkillsFuture courses from public and private sources.  
- Allows sorting and filtering of courses by: price, subsidy, session frequency, start/end dates, available seats, and provider ratings.  
- Highlights courses optimal for users with soon-to-expire credits.  
- Provides ratings and reviews for each service provider.  
- Offers reminders or alerts for impending expiry of credits and upcoming course registration deadlines.  
- Responsive web UI for desktop and mobile.  
- Secure login, personal saved course lists and credit tracking.  
- Easy-to-use with clear, actionable insights for busy professionals.

## Technical Specifications

### Backend  
- Node.js + Express or Python (FastAPI/Flask) for API.  
- Scrapes or integrates with SkillsFuture course datasets and APIs.  
- Database (PostgreSQL or MongoDB) to store course info, reviews, provider data, user profiles.  
- Scheduled jobs to refresh course data and update expiring/soonest-starting courses.  

### Frontend  
- React 18+ and TypeScript, or Next.js for SSR optimization.  
- Filter/sort UI: price (low to high), dates, availability, subsidy, frequency, ratings.  
- Secure authentication.  
- Personalized dashboard showing expiring credits and suggested courses.  
- Rating/integrated reviews component.

### Deployment  
- Docker and CI/CD scripts for cloud deployment (Netlify, Vercel, AWS).

## Usage Example  

- Landing page: modern search/filter dashboard directly listing all courses by default.  
- Users create an account, see SkillsFuture credit balance, receive smart suggestions.  
- Can bookmark, rate, review courses, and set expiry reminder alerts.

## Deliverables  
- Full-stack multi-folder codebase with all core features.  
- Comprehensive README with setup, usage, and extension details.
- Test coverage for backend logic, UI, and course aggregation.

## Notes for Claude Code  
- Generate all code and folder structure, including backend, frontend, config files, and tests.
- Ensure clean separation of concerns between aggregation, API logic, and UI components.
- Prioritize user experience with clear flows and helpful suggestions/reminders for credit usage.
```

# Sample Linkedin Post

```txt
Excited to share Skill Lobang — a new app designed to help Singaporeans optimize their SkillsFuture course choices! 🎓✨

With so many courses available, sorting by price, subsidy, availability, dates, and provider ratings can be overwhelming. Skill Lobang makes it easy to find the best-fit courses and manage expiring credits, ensuring users get the most out of their SkillsFuture benefits.

Built with a clean, user-friendly interface, the app offers personalized alerts and insightful course comparisons to help make the right learning decisions.

Looking forward to empowering lifelong learners with smarter course discovery!

#SkillsFuture #EdTech #LifelongLearning #Singapore #CourseDiscovery #SkillLobang
```

[![](https://img.shields.io/badge/skill_lobang_1.0.0-passing-green)](https://github.com/gongahkia/skill-lobang/releases/tag/1.0.0) 

# `Skill Lobang`

...

## Rationale

...

## Stack

...

## Screenshots

...

## Usage

...

## Support

...

## Architecture

...

## Legal

...

## Reference

... Name is in reference to the show Suits