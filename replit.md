# GallyPal - Gallbladder Recovery Meal Planning App

## Overview

GallyPal is a specialized web application designed to help users recover from gallbladder surgery by providing meal planning, food safety guidance, and nutrition tracking features. The app focuses on managing fat intake, which is crucial for gallbladder recovery, and provides a comprehensive food database with safety ratings.

## Recent Changes

**July 29, 2025 - Database Integration and Profile Improvements**
- ✓ Added clickable logo/title in top navigation that returns to home page
- ✓ Added visible "Home" button in top navigation when not on home page  
- ✓ Created comprehensive user profile page (/profile) with:
  - User information display and editing capabilities
  - Recovery stage tracking with day-based recommendations
  - Surgery date and daily fat limit management
  - Recovery-specific food guidelines by stage
  - App preference toggles
- ✓ Added profile route to app navigation
- ✓ Added user update API endpoint (PATCH /api/users/:id)
- ✓ Migrated from in-memory storage to PostgreSQL database:
  - Configured Neon Database integration with Drizzle ORM
  - Implemented DatabaseStorage class with full CRUD operations
  - Added database seeding with comprehensive food and recipe data
  - Maintained all existing functionality with persistent data storage
- ✓ Improved user experience with intuitive navigation flow

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Pattern**: RESTful API with Express routes
- **Session Management**: PostgreSQL-backed sessions (connect-pg-simple)

### Development Setup
- **Monorepo Structure**: Single repository with client, server, and shared code
- **Development Server**: Vite dev server with HMR in development
- **Production Build**: Static assets served by Express in production

## Key Components

### Database Schema (shared/schema.ts)
- **Foods Table**: Comprehensive nutrition database with safety levels (safe/moderate/avoid)
- **Recipes Table**: User recipes with calculated fat content per serving
- **Meal Plans Table**: Daily meal plans with fat tracking
- **Grocery Lists Table**: Shopping lists generated from meal plans
- **User Progress Table**: Daily nutrition tracking and recovery progress
- **Users Table**: User profiles with surgery date tracking

### Storage Layer (server/storage.ts)
- **Interface-Based Design**: IStorage interface defining all data operations
- **Database Implementation**: DatabaseStorage class using PostgreSQL with Drizzle ORM
- **Legacy Support**: MemStorage class retained for testing (not currently used)
- **Database Operations**: Full CRUD operations for all entities with search and filtering

### API Routes (server/routes.ts)
- **Food Management**: Search, categorize, and retrieve food information
- **Recipe Management**: Create and manage recipes with nutrition calculations
- **Meal Planning**: Daily and weekly meal plan management
- **Grocery Lists**: Generate and manage shopping lists
- **Progress Tracking**: Monitor daily nutrition and recovery metrics

### UI Components
- **Navigation**: Top navigation and bottom mobile navigation
- **Dashboard Widgets**: Fat tracker, meal plan preview, grocery list preview
- **Search Interface**: Food search with safety level indicators
- **Form Components**: Meal planning and recipe creation forms

## Data Flow

1. **User Interaction**: Users interact with React components in the client
2. **API Requests**: TanStack Query manages API calls to Express server
3. **Data Processing**: Server validates requests and interacts with storage layer
4. **Database Operations**: Storage layer performs CRUD operations on PostgreSQL
5. **Response Handling**: Query client caches responses and updates UI reactively

### Key Data Patterns
- **Fat Safety Calculation**: Foods categorized as safe (<5g), moderate (5-15g), or avoid (>15g) fat per serving
- **Recipe Nutrition**: Automatic calculation of fat content based on ingredients
- **Daily Tracking**: Progress monitoring with recovery day counting from surgery date

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection Management**: Automatic connection pooling via Neon serverless driver

### UI Libraries
- **Radix UI**: Headless accessible components
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation utilities
- **Embla Carousel**: Touch-friendly carousel component

### Development Tools
- **Replit Integration**: Custom plugins for Replit environment
- **TypeScript**: Full type safety across frontend and backend
- **ESLint/Prettier**: Code formatting and linting (implied)

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express API proxy
- **Hot Module Replacement**: Real-time code updates in development
- **Environment Variables**: DATABASE_URL required for database connection

### Production Build
- **Client Build**: Vite builds static assets to dist/public
- **Server Build**: esbuild bundles server code to dist/
- **Static Serving**: Express serves built client assets
- **Database Migrations**: Drizzle handles schema changes via migrations/

### Architecture Decisions

**Why Drizzle ORM**: Chosen for type safety and performance over traditional ORMs like Prisma. Provides direct SQL-like queries while maintaining TypeScript integration.

**Why TanStack Query**: Selected for powerful caching, background updates, and optimistic updates. Essential for responsive user experience with nutrition tracking data.

**Why Radix UI + Tailwind**: Combines accessibility-first components with utility-first styling. Provides consistent design system while maintaining customization flexibility.

**Why Express over Fastify/Koa**: Express chosen for ecosystem maturity and middleware compatibility, particularly important for session management and static file serving.

**Why In-Memory Storage Pattern**: Abstracted storage interface allows easy switching between development (in-memory) and production (database) implementations without changing business logic.

The application prioritizes user health and safety by implementing strict fat content tracking and providing clear visual indicators for food safety levels during gallbladder recovery.