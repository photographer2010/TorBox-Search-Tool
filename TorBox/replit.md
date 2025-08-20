# TorBox Search Application

## Overview

TorBox Search is a modern web application that provides torrent search functionality integrated with TorBox cloud torrent management service. The application allows users to search for torrents across multiple categories using the Knaben API and seamlessly add selected torrents to their TorBox account for cloud-based downloading and management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 using TypeScript and follows a modern component-based architecture:

- **Framework**: React with TypeScript for type safety and developer experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build Tool**: Vite for fast development and optimized builds

The frontend follows a clean component structure with separation of concerns:
- UI components in `/components/ui/` for reusable design system elements
- Feature components for business logic (search, results, settings)
- Custom hooks for shared functionality
- Type definitions in shared schema for API consistency

### Backend Architecture
The server is built with Express.js in a RESTful API pattern:

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js for HTTP server and middleware
- **API Proxy**: Acts as a proxy between frontend and external services (Knaben API, TorBox API)
- **Request Handling**: JSON middleware for parsing requests and CORS handling
- **Error Management**: Centralized error handling with proper HTTP status codes
- **Development**: Vite integration for hot reloading in development mode

### Data Storage Solutions
The application uses a minimal storage approach:

- **Database ORM**: Drizzle ORM configured for PostgreSQL with migrations support
- **Database Provider**: Neon Database (serverless PostgreSQL) for scalable cloud storage
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple
- **Caching Strategy**: Client-side caching through TanStack Query with stale-while-revalidate pattern

Currently, the application primarily acts as a proxy service with minimal persistent storage needs, focusing on API orchestration rather than data persistence.

### Authentication and Authorization
The application implements a simple environment-based API key management system:

- **API Security**: TorBox API key stored as environment variable on server
- **Request Validation**: Zod schemas for runtime type checking and validation
- **Error Handling**: Proper HTTP status codes and error messages for API failures

### Design Patterns and Architectural Decisions

**Monorepo Structure**: The application uses a monorepo pattern with clear separation:
- `/client/` - React frontend application
- `/server/` - Express.js backend API
- `/shared/` - Common TypeScript schemas and types

**API-First Design**: All data interactions go through well-defined API endpoints with consistent request/response patterns using Zod validation schemas.

**Component Composition**: Frontend uses composition pattern with Radix UI primitives, allowing for flexible and accessible UI components.

**Proxy Architecture**: Backend serves as an intelligent proxy, handling authentication with external services while providing a simplified API to the frontend.

## External Dependencies

### Core Services
- **Knaben API**: Primary torrent search provider offering comprehensive torrent indexing across multiple categories
- **TorBox API**: Cloud torrent management service for adding and managing torrents remotely
- **Neon Database**: Serverless PostgreSQL provider for scalable database hosting

### Development and Build Tools
- **Replit Integration**: Development environment optimizations with error modal and cartographer plugins
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database schema management and migrations

### UI and Styling Dependencies
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management with validation support

### Utility Libraries
- **Axios**: HTTP client for external API requests
- **date-fns**: Date manipulation and formatting utilities
- **clsx/tailwind-merge**: Conditional CSS class composition
- **nanoid**: Unique ID generation for client-side operations