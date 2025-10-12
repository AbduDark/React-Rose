# Overview

Rose Academy is a learning management system (LMS) designed for Egyptian high school students, offering video-based courses under a subscription model. The platform features a React frontend and a Laravel backend API, enabling students to browse courses, subscribe with payment proof, access protected video lessons, and monitor their learning progress. Administrators utilize a dashboard to manage courses, lessons, subscriptions, and user notifications. The project aims to provide a modern, accessible, and secure educational platform with a focus on an intuitive user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is a Single-Page Application (SPA) built with React 19 and Vite, utilizing React Router for navigation and i18next for internationalization (Arabic/English). It employs a component-based design, Context API for state management (authentication, courses, notifications, user data, theme), and Tailwind CSS for styling, including comprehensive dark mode support and RTL/LTR layouts. Key features include lazy loading for performance, Framer Motion for smooth UI animations, and robust video content protection.

## Backend Architecture (Laravel API)

The backend is a RESTful API developed with Laravel, providing robust support for course management, user authentication (Laravel Sanctum), subscription workflows, and secure video content delivery. It features token-based authentication, resource-based API responses with localized messages, and dedicated endpoints for administrative CRUD operations on courses, lessons, and subscriptions, as well as user-specific actions. The API is designed for clear separation of concerns and extensibility.

## Video Content Protection

To prevent unauthorized access and sharing of video content, a multi-layered security approach is implemented. This includes AES-256 encryption of video URLs with embedded user and lesson metadata, temporary session-based tokens, and HLS/DASH streaming with software AES decryption. Client-side protections disable common piracy methods like right-click and keyboard shortcuts, and a DOM Mutation Observer detects attempts to tamper with the video player. Security configurations are centralized for easy management.

## Subscription Workflow

The platform incorporates a multi-step subscription workflow requiring manual approval. Users select a course, submit personal and payment details along with an uploaded payment proof image. Subscriptions are initially set to "pending" status, awaiting administrator review and approval or rejection based on payment verification. Users are notified of the decision, and approved subscribers gain access to course lessons. The system supports `pending`, `approved`, `rejected`, and `expired` subscription states with backend validation for all submitted data.

### Subscription Renewal

Expired or rejected subscriptions can be renewed through an elegant modal-based form (RenewSubscriptionModal component). The renewal process includes:
- **Egyptian Phone Validation**: Enforces Egyptian mobile format using regex `/^01[0-2,5]{1}[0-9]{8}$/` (starts with 01, total 11 digits) for both payer and parent phone numbers
- **Payment Proof Upload**: Image upload with live preview
- **Modal Design**: Smooth animations using Framer Motion with AnimatePresence
- **User-Friendly Labels**: Changed from "Vodafone number" to "The number you transferred from" for clarity
- **Auto-Redirect**: After successful submission, users see a success message and are redirected to subscriptions page after 2 seconds
- **No Auto-Open**: Modal only opens when user clicks the "Renew" button (removed automatic form display)

## Notification System

A server-generated notification system keeps users informed about subscription status updates, new courses, and system announcements. Notifications are stored in a database, with real-time unread counts displayed in the header. A dedicated notification center allows users to view and manage all their alerts, which are marked as read upon viewing.

# External Dependencies

## Core Frontend Libraries

- **React 19.1.0**: UI development.
- **React Router DOM 7.7.1**: Client-side routing.
- **React Player 3.3.1**: Universal video player.
- **hls.js 1.6.12**: HTTP Live Streaming playback.
- **crypto-js 4.2.0**: Client-side encryption.

## Internationalization

- **i18next 25.3.6**, **react-i18next 15.6.1**: Core i18n framework and React bindings.
- **i18next-browser-languagedetector 8.2.0**: Automatic language detection.
- **i18next-http-backend 3.0.2**: Dynamic translation file loading.

## UI & Styling

- **Tailwind CSS 3.4.17**: Utility-first CSS framework.
- **Framer Motion 12.0.0**: Animation library for React.
- **React Icons 5.5.0**: Icon library.

## Backend API (Laravel)

- **Base URL**: Proxied through Vite dev server (`/api` → `http://127.0.0.1:8000`).
- **Authentication**: Laravel Sanctum for token-based authentication.
- **Database**: Expected relational database (MySQL/PostgreSQL) with tables for users, courses, lessons, subscriptions, notifications, and favorites.
- **File Storage**: Laravel storage for uploaded images and videos.

## Third-Party Integrations

- **Payment Method**: Manual verification via Vodafone Cash/mobile money (users upload payment proof screenshots).
- **Video Hosting**: Self-hosted video files delivered via Laravel backend with HLS streaming.