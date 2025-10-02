# Overview

Rose Academy is a learning management system (LMS) built for Egyptian high school students. The platform provides video-based courses with a subscription model, featuring a React frontend and Laravel backend API. Students can browse courses, subscribe with payment proof, watch protected video lessons, and track their learning progress. Administrators manage courses, lessons, subscriptions, and user notifications through a comprehensive dashboard.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React 19 with Vite build tool, using React Router for navigation and i18next for internationalization (Arabic/English).

**Problem Addressed**: Need for a modern, fast, and accessible educational platform supporting RTL (Arabic) and LTR (English) layouts.

**Solution**: Single-page application (SPA) architecture with component-based design, context API for state management, and Tailwind CSS for styling.

**Key Design Decisions**:
- **Routing**: React Router v7 handles navigation between public pages (home, courses) and protected routes (dashboard, subscriptions, video player)
- **State Management**: Context API manages authentication, courses, notifications, and user data across components
- **Styling**: Tailwind CSS with custom configuration for primary colors (#06d4b5ff) and Arabic font support (Cairo)
- **Internationalization**: i18next with HTTP backend loads translations dynamically, supports language detection from localStorage

**Directory Structure**:
- `/src/api/`: API client functions for backend communication (auth, courses, lessons, subscriptions, notifications, favorites)
- `/src/components/`: Reusable UI components and page-specific components (admin dashboard, course viewers, subscription forms)
- `/src/services/`: Business logic services (VideoSecurityService for content protection)
- `/src/utils/`: Helper functions (subscription formatting, date/price utilities)
- `/src/config/`: Configuration files (security settings for video protection)
- `/public/locales/`: Translation JSON files organized by language (ar/en) and namespace (common/translation)

**Pros**: Fast development with hot module replacement, excellent developer experience, component reusability  
**Cons**: Initial bundle size, requires JavaScript enabled, SEO challenges (mitigated with SSR if needed later)

## Backend Architecture (Laravel API)

**Problem Addressed**: Need for robust API supporting course management, user authentication, subscription workflows, and video content delivery.

**Solution**: RESTful API architecture with Laravel framework, featuring:
- Token-based authentication (Laravel Sanctum)
- Resource-based API responses with localized messages (Arabic/English)
- Admin endpoints for CRUD operations on courses, lessons, subscriptions
- User endpoints for course browsing, subscription management, lesson access

**Key Endpoints**:
- **Authentication**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- **Courses**: `/api/courses` (public), `/api/admin/courses` (admin CRUD)
- **Lessons**: `/api/admin/lessons` (admin management), `/api/lessons/{id}` (user access)
- **Subscriptions**: `/api/subscribe`, `/api/my-subscriptions`, `/api/admin/subscriptions` (approval workflow)
- **Notifications**: `/api/notifications`, `/api/notifications/unread-count`

**Response Format**: Standardized JSON with `success`, `status_code`, `message` (localized), and `data` fields using `ApiResponseTrait`

**Pros**: Clear separation of concerns, easy to extend, standardized error handling  
**Cons**: Requires careful management of N+1 queries, caching needed for performance

## Video Content Protection

**Problem Addressed**: Prevent unauthorized downloading and sharing of educational video content.

**Solution**: Multi-layered security approach:
1. **URL Encryption**: Video URLs encrypted with AES-256 using crypto-js, includes user ID, lesson ID, timestamp, and expiry
2. **Temporary Tokens**: Session-based tokens with configurable expiry (30 minutes) and maximum view counts
3. **HLS/DASH Streaming**: Uses hls.js for adaptive streaming with software AES decryption
4. **Client-Side Protection**: Disables right-click, keyboard shortcuts (F12, Ctrl+S, etc.), and monitors for DevTools
5. **DOM Mutation Observer**: Detects attempts to modify video player DOM

**Configuration**: Centralized in `/src/config/security.js` with separate encryption, token, streaming, and monitoring settings

**Alternatives Considered**: Server-side DRM (too complex for MVP), simple URL obfuscation (insufficient protection)

**Pros**: Strong deterrent against casual piracy, configurable security levels, works across devices  
**Cons**: Determined users can still circumvent, performance overhead, requires maintenance

## Subscription Workflow

**Problem Addressed**: Manual approval process for course subscriptions with payment verification.

**Solution**: Multi-step subscription flow:
1. User selects course and fills subscription form (Vodafone number, parent phone, student info)
2. User uploads payment proof image (screenshot/photo of transfer)
3. Subscription created with "pending" status
4. Admin reviews payment proof in dashboard and approves/rejects
5. User receives notification of decision
6. Approved users gain access to course lessons

**Status States**: `pending`, `approved`, `rejected`

**Data Validation**: Backend validates required fields, phone number format, image file type/size

**Pros**: Prevents fraudulent access, flexible payment methods, clear audit trail  
**Cons**: Manual review creates delay, requires admin availability, scalability concerns with high volume

## Notification System

**Problem Addressed**: Keep users informed about subscription status changes, new courses, and system announcements.

**Solution**: Server-generated notifications stored in database with real-time count updates:
- Unread notification badge in header (polls `/api/notifications/unread-count`)
- Notification center displays paginated list of all notifications
- Notifications marked as read when viewed
- Admin can send broadcast notifications to all users

**Context Management**: NotificationContext provides global state for unread count and notification list

**Pros**: Simple implementation, reliable delivery, persistent across sessions  
**Cons**: Polling creates unnecessary requests, lacks real-time push (websockets would improve)

# External Dependencies

## Core Frontend Libraries

- **React 19.1.0**: UI component library with latest concurrent features
- **React Router DOM 7.7.1**: Client-side routing and navigation
- **React Player 3.3.1**: Universal video player component supporting multiple formats
- **hls.js 1.6.12**: HTTP Live Streaming playback for adaptive video delivery
- **crypto-js 4.2.0**: Client-side encryption/decryption for video URL protection

## Internationalization

- **i18next 25.3.6**: Core i18n framework for multi-language support
- **react-i18next 15.6.1**: React bindings for i18next
- **i18next-browser-languagedetector 8.2.0**: Automatic language detection
- **i18next-http-backend 3.0.2**: Dynamic translation file loading

## UI & Styling

- **Tailwind CSS 3.4.17**: Utility-first CSS framework with custom configuration
- **React Icons 5.5.0**: Icon library (Feather icons primarily used)
- **PostCSS 8.5.6** & **Autoprefixer 10.4.21**: CSS processing and browser compatibility

## Development Tools

- **Vite 7.0.4**: Fast build tool and dev server with HMR
- **ESLint 9.32.0**: Code linting with React-specific rules
- **@vitejs/plugin-react 4.6.0**: Official Vite plugin for React with Fast Refresh

## Backend API (Laravel)

**Base URL**: Proxied through Vite dev server (`/api` → `http://127.0.0.1:8000`)

**Authentication**: Laravel Sanctum token-based auth with Bearer tokens stored in localStorage

**Expected Database**: Relational database (MySQL/PostgreSQL) with tables for:
- `users`: Authentication and user profiles
- `courses`: Course metadata (title, description, price, level, language, instructor, grade)
- `lessons`: Individual video lessons linked to courses
- `subscriptions`: User course subscriptions with payment proof and approval status
- `notifications`: System and admin notifications
- `favorites`: User favorite courses

**File Storage**: Laravel storage for uploaded images (payment proofs, course thumbnails) and videos (lesson content)

## Third-Party Integrations

**Payment Method**: Manual verification via Vodafone Cash/mobile money - users upload payment proof screenshots

**Video Hosting**: Self-hosted video files served through Laravel backend with HLS streaming support

**Future Considerations**: 
- Payment gateway integration (Fawry, Paymob) for automated payment processing
- CDN integration for video delivery optimization
- WebSocket server (Pusher/Laravel Echo) for real-time notifications
- Analytics integration (Google Analytics, Mixpanel) for user behavior tracking