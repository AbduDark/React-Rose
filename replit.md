# Overview

Rose Academy is a learning management system (LMS) designed for Egyptian high school students, offering video-based courses under a subscription model. The platform features a React frontend and a Laravel backend API, enabling students to browse courses, subscribe with payment proof, access protected video lessons, and monitor their learning progress. Administrators utilize a dashboard to manage courses, lessons, subscriptions, and user notifications. The project aims to provide a modern, accessible, and secure educational platform with a focus on an intuitive user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is a Single-Page Application (SPA) built with React 19 and Vite, utilizing React Router for navigation and i18next for internationalization (Arabic/English). It employs a component-based design, Context API for state management (authentication, courses, notifications, user data, theme), and Tailwind CSS for styling, including comprehensive dark mode support and RTL/LTR layouts. Key features include lazy loading for performance, Framer Motion for smooth UI animations, and robust video content protection.

## Backend Architecture (Laravel API)

The backend is a RESTful API developed with Laravel, providing robust support for course management, user authentication (Laravel Sanctum), subscription workflows, and secure video content delivery. It features token-based authentication, resource-based API responses with localized messages, and dedicated endpoints for administrative CRUD operations on courses, lessons, and subscriptions, as well as user-specific actions. The API is designed for clear separation of concerns and extensibility.

## Course Intro Videos

Each course can optionally include an intro video (YouTube link) that appears in the course overview section. The intro video is displayed using ReactPlayer with a custom play button overlay, allowing prospective students to preview the course content before subscribing.

## Video Content Protection

Video content is protected through comprehensive client-side security measures. Videos are delivered as **direct unencrypted URLs** (MP4, WebM, etc.) from the Laravel backend with no HLS streaming. The VideoJSPlayer component uses the Video.js library for native HTML5 video playback with multiple playback speeds (0.5x to 2x) while maintaining robust security features:

- **Right-Click Protection**: Context menu disabled on video player
- **Download Prevention**: `controlsList="nodownload noremoteplayback"` attribute blocks native download buttons
- **Picture-in-Picture Blocking**: `disablePictureInPicture` attribute prevents PiP mode
- **Text Selection Blocking**: All player elements have `user-select: none` to prevent text copying
- **Fullscreen Support**: Maintains all protection measures in fullscreen mode
- **Direct Video Playback**: Uses native HTML5 video (`techOrder: ["html5"]`) without HLS/DASH streaming - videos must be direct MP4/WebM URLs
- **Robust Initialization**: Retry mechanism (10 attempts, 50ms intervals) ensures Video.js initializes only after the video element is fully mounted in the DOM, preventing race conditions
- **Multi-Quality Support**: Optional quality selector appears when backend provides multiple quality sources via `qualitySources` array (e.g., 1080p, 720p, 480p). Quality selector only uses server-provided sources and never auto-generates URLs from signed links.

**Note**: HLS streaming has been completely removed as of October 25, 2025. The backend must provide direct video file URLs. Watermark overlay feature was removed as of October 25, 2025.

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

## Admin Video Management

The admin VideoUpload component (`src/components/admin/lessons/VideoUpload.jsx`) provides an enhanced video upload experience:
- **Drag & Drop Support**: Admins can drag video files directly onto the upload zone or click to browse
- **Video Preview**: Live preview of selected video before upload with play controls
- **Upload Progress Tracking**: Real-time progress bar with percentage display
- **Upload Speed Monitoring**: Shows current upload speed (MB/s) with elapsed time
- **Time Remaining Estimate**: Calculates and displays estimated time remaining for upload completion
- **Smooth Animations**: Uses Framer Motion for intuitive UI transitions
- **Error Handling**: Guards against NaN/Infinity values in speed and time calculations

# External Dependencies

## Core Frontend Libraries

- **React 19.1.0**: UI development.
- **React Router DOM 7.7.1**: Client-side routing.
- **React Player 3.3.1**: Universal video player for YouTube intro videos.
- **Video.js 8.23.3**: Professional HTML5 video player for protected lesson videos with playback rate control.

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
- **Video Hosting**: Self-hosted MP4 video files delivered directly via Laravel backend.