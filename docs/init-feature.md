Project Overview
Build an MVP web platform for internal company knowledge sharing with core features: secure authentication, document management, intelligent search, and AI integration.
Detailed Technical Requirements
1. Authentication & Authorization System
   Create a comprehensive authentication system with:

Login form with user/password validation
Session management using JWT or cookies
Auto logout when session expires
Redirect logic after successful login
Clear error handling with descriptive messages
Secure logout functionality

2. Dashboard Homepage
   Design a homepage displaying:

Top 5 latest documents (sorted by creation date)
Top 5 most popular documents (by star ratings)
Top 5 documents by current user
Each item shows: title, brief summary, creation date, star count
Responsive design for mobile and desktop

3. Document Upload & Management
   Build upload system with:

File upload supporting DOC, PDF, Images
File size validation (max 10MB)
Required fields: title, summary (max 500 words)
Manual tag input system
Privacy level dropdown: Private/Group/Public
File preview before upload
User's uploaded file management

4. Search & Discovery
   Develop search functionality:

Search bar with multiple filters: name, tags, creation date, group
Results displayed in grid/list with pagination
Filter by privacy level (show only accessible documents)
Advanced search with multiple criteria
Sort options: newest, most popular, alphabetical

5. Document Detail & Interaction
   Create document detail page:

Layout showing complete information: title, summary, tags, creation date
Embedded PDF viewer and image preview
Star rating system (1-5 stars) with intuitive UI
Only owner can edit sharing status
Author information and view statistics

6. AI Integration (Advanced Feature)
   Implement AI features:

Auto-summary: AI API integration for content summarization (500 word limit)
Auto-tagging: Content-based tag suggestions
User can edit/approve AI suggestions
Loading states for AI processing

7. Security & Access Control
   Build security system:

Role-based access control
Private: owner-only access
Group: department/team members only
Public: all company employees
Session validation for all requests
Secure file storage and access

Recommended Technology Stack
Frontend

Framework: Angular 17+ with Standalone Components
UI Library: Angular Material + Angular CDK
State Management: NgRx or Akita
Form Handling: Angular Reactive Forms with Custom Validators
File Upload: ng2-file-upload or ngx-dropzone
PDF Viewer: ng2-pdf-viewer or PDF.js
HTTP Client: Angular HttpClient with Interceptors

Backend

Framework: Node.js + Express or Python + FastAPI
Database: PostgreSQL with Prisma ORM
Authentication: JWT + bcrypt
File Storage: AWS S3 or local storage
AI Integration: OpenAI API or Google Gemini

Infrastructure

Deployment:

Frontend: Firebase Hosting or Netlify
Backend: Node.js on Google Cloud Run or AWS Lambda


Database: Supabase or PlanetScale
File CDN: Cloudinary or AWS CloudFront

Angular Architecture Patterns
Project Structure
src/
├── app/
│   ├── core/               # Singleton services, guards
│   │   ├── auth/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/             # Shared components, pipes, directives  
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   ├── features/           # Feature modules
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── search/
│   │   └── auth/
│   └── layout/             # Layout components
│       ├── header/
│       ├── sidebar/
│       └── footer/
Key Angular Services
typescript// DocumentService
- uploadDocument(file: File, metadata: DocumentMetadata)
- getDocuments(filters?: SearchFilters)
- getDocumentById(id: string)
- updateDocument(id: string, updates: Partial<Document>)
- deleteDocument(id: string)
- rateDocument(documentId: string, rating: number)

// AuthService
- login(credentials: LoginRequest)
- logout()
- getCurrentUser()
- isAuthenticated()
- getToken()

// SearchService
- searchDocuments(query: string, filters?: SearchFilters)
- getSuggestions(query: string)
- saveRecentSearch(query: string)

// AIService
- generateSummary(content: string)
- suggestTags(content: string)
- extractText(file: File)
  Route Configuration
  typescriptconst routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
  path: 'login',
  loadComponent: () => import('./features/auth/login.component')
  },
  {
  path: '',
  component: LayoutComponent,
  canActivate: [AuthGuard],
  children: [
  {
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard/dashboard.component')
  },
  {
  path: 'documents',
  loadChildren: () => import('./features/documents/documents.routes')
  },
  {
  path: 'search',
  loadComponent: () => import('./features/search/search.component')
  }
  ]
  }
  ];
  Core Database Schema
  sql-- Users table
  users: id, username, password_hash, email, department, role, created_at

-- Documents table  
documents: id, title, summary, file_url, file_type, file_size,
owner_id, privacy_level, created_at, updated_at

-- Tags table
tags: id, name, color

-- Document_tags junction table
document_tags: document_id, tag_id

-- Ratings table
ratings: id, document_id, user_id, stars, created_at
UI/UX Guidelines - Confluence-Inspired Design
Layout Structure (Confluence-Inspired)

Top Navigation Bar: Logo, centered search bar, user avatar + dropdown menu
Side Navigation:

Dashboard (Home icon)
My Documents (Document icon)
Browse All (Grid icon)
Recently Viewed (Clock icon)
Starred (Star icon)


Main Content Area: Clean white background with proper spacing
Breadcrumb Navigation: Display navigation path

Component Design System

Cards: Rounded corners (8px), subtle shadows, hover effects
Typography:

Headers: Segoe UI/Inter font, bold weights
Body: 14px line-height 1.6 for readability
Code/tags: Monospace font with background highlight


Colors:

Primary: #0052CC (Confluence blue)
Secondary: #6B778C (muted gray)
Success: #00875A, Warning: #FF8B00, Error: #DE350B
Background: #F4F5F7 (light gray background)


Spacing: 8px grid system (8, 16, 24, 32px)

Page-Specific UI Elements
Dashboard Homepage

Hero Section: Welcome message + quick stats (total docs, recent activity)
Three-column Layout:

Column 1: "Recent Documents" with thumbnail previews
Column 2: "Popular Documents" with visible star ratings
Column 3: "My Documents" with edit/delete actions


Document Cards:

Thumbnail/icon at top
Title (max 2 lines)
Snippet preview (1-2 lines)
Author avatar + name
Date and star rating
Tags display



Search Results Page

Search Bar: Prominent with advanced filter toggle
Filter Sidebar (collapsible):

Date range picker
Tags with color coding
File types checkbox
Privacy levels
Authors dropdown


Results Grid: Similar to Confluence search results

Large clickable cards
Relevance highlighting
"Load more" pagination



Document Detail Page

Header Section:

Document title (editable by owner)
Breadcrumb navigation
Author info + created date
Action buttons: Star, Share, Download, Edit (if owner)


Content Area:

Document viewer/preview (full width)
Tags section below content
Comments/ratings section


Right Sidebar:

Document info (file size, type, etc.)
Recent viewers (if permitted)
Related documents



Upload Page

Drag & Drop Zone: Large, central with Confluence-style dashed border
Form Fields: Clean Material Design inputs
AI Features Toggle: Switches for auto-summary and auto-tagging
Privacy Settings: Card-based selection (Visual radio buttons)
Preview Section: Live preview of document info

Interactive Elements

Hover Effects: Subtle card elevation, color changes
Loading States: Confluence-style skeleton screens
Notifications: Toast messages at top-right
Modals: Material Design dialogs with backdrop blur
Tooltips: Helpful contextual information

Responsive Design

Breakpoints:

Mobile: <768px (collapsed sidebar, stacked layout)
Tablet: 768-1024px (collapsible sidebar)
Desktop: >1024px (full layout)


Mobile Navigation: Bottom tab bar for main sections
Touch Interactions: Appropriate touch targets (44px minimum)

MVP Priority with Angular Implementation

Phase 1:

Angular Authentication module with Guards
Basic Document upload with Angular Material File Input
Simple search with Angular Material Autocomplete


Phase 2:

Dashboard with Angular Material Cards
Document viewer component with PDF.js integration
Rating system with Angular Material Rating component


Phase 3:

Advanced search with Angular Material Expansion Panels
Permission system with Role-based Guards
Responsive layout with Angular Flex Layout


Phase 4:

AI Integration with HTTP Interceptors for loading states
Advanced features with Angular Animations
PWA capabilities with Angular Service Worker



Success Metrics

User adoption rate within team
Number of documents uploaded per month
Search success rate
User engagement (views, ratings, comments)


Important Notes:

Prioritize security and user experience
Responsive design for mobile users
Performance optimization for file handling
Scalable architecture for future growth
Comprehensive error handling and logging
Follow Angular best practices and style guide
Implement proper TypeScript typing throughout
Use Angular Material theming for consistent design
