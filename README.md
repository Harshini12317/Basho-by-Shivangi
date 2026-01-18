# Basho by Shivangi - E-Commerce & Workshop Platform

A comprehensive full-stack e-commerce platform built with **Next.js 15**, **React 19**, **TypeScript**, **MongoDB**, and **Tailwind CSS**. The platform features product management, custom orders, workshops, events, galleries, admin dashboard with payment integration via Razorpay, and a sophisticated popup management system.

**Live URL**: https://bashoproject.vercel.app

---

## To access admin panel, use the credentials given below

Email : bashoshivangi@gmail.com
Password : Abc*1234

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Pages & Routes](#pages--routes)
- [Admin Features](#admin-features)
- [Components](#components)
- [Mobile Responsive Design](#mobile-responsive-design)
- [Scripts & Commands](#scripts--commands)
- [Development](#development)
- [Deployment](#deployment)
- [Recent Updates](#recent-updates)

---

## Features

### Core E-Commerce Features
- **Product Catalog** - Browse, search, and filter products by categories with full mobile responsiveness
- **Shopping Cart** - Add/remove items, manage quantities, persistent cart storage
- **Checkout & Payments** - Secure checkout with Razorpay payment gateway integration (PCI-DSS compliant)
- **Order Management** - Order tracking, status updates, order history with invoice generation
- **Wishlist** - Save favorite products for later
- **Product Reviews** - User reviews and ratings for products
- **Product Search & Filtering** - Advanced search with debouncing and category filtering

### Custom Orders
- **Custom Order Requests** - Users can request custom products with specifications
- **Photo Uploads** - Upload reference photos for custom orders with preview functionality
- **Order Tracking** - Monitor custom order progress and status
- **Admin Management** - Manage custom orders and photos with image management

### Workshops & Events
- **Workshop Management** - Browse and register for workshops with detailed information
- **Workshop Registration** - User registration with date selection and mandatory login
- **Workshop Details** - Rich content with formatted sections:
  - What you will learn (displays as bullet points)
  - Includes section (formatted text display)
  - More information section
- **Event Management** - Create and manage events with capacity tracking
- **Event Bookings** - User bookings and attendance tracking

### Gallery & Media
- **Gallery Management** - Showcase product photography and work samples
- **Image Optimization** - Cloudinary integration for fast image delivery with multiple formats (AVIF, WebP)
- **Responsive Media** - Optimized images for all device sizes
- **MediaShowcase Component** - Beautiful image gallery with navigation
- **Hero Slideshow** - Dynamic hero section with image and video support (10-second slide transitions)
- **Video Support** - Upload and display MP4, WebM, OGG, MOV, MKV, AVI videos in hero slideshow

### User Features
- **User Authentication** - NextAuth.js integration with secure login/signup
- **User Profiles** - View and manage personal information and order history
- **Corporate Inquiries** - Handle B2B inquiries and requests
- **Testimonials** - Showcase customer testimonials with carousel display
- **Messaging System** - Internal messaging between users and support
- **Email Notifications** - Automated email notifications for orders, registrations, confirmations

### Admin Dashboard
- **Complete Admin Panel** - Unified dashboard for all platform management
- **Product Management** - Create, edit, delete products with image uploads and category management
- **Order Management** - View, filter, and update order statuses with invoice PDF generation
- **User Management** - Manage user accounts and permissions
- **Workshop Management** - Create workshops with image/video support, register users, manage registrations
- **Event Management** - Create and manage events with capacity and booking limits
- **Payment Tracking** - Monitor Razorpay transactions and payment statuses
- **Custom Order Management** - View and manage custom order requests with photo galleries
- **Popup Management** - 
  - Create promotional popups with rich content and images
  - **Edit existing popups** with form pre-population
  - Target popups to specific pages (homepage, workshops)
  - Schedule popups with start/end dates
  - Set frequency (once per session, once per day, always)
  - Support multiple display triggers (page load, delay, scroll)
  - Reset popup view history
- **Homepage Content Management** - Manage hero slideshow images/videos (7 slots), GSAP slider images, and features section
- **Static Data Management** - Manage static content and pages
- **Gallery Management** - Upload, organize, and delete gallery items
- **Analytics Dashboard** - View key business metrics

### Popup System Features
- **Page-Specific Display** - Popups only show on selected pages during creation
- **Schedule Control** - Set start/end times for popup availability
- **Frequency Options**:
  - Always: Shows on every page load
  - Once per session: Shows once until page refresh
  - Once per day: Shows once per 24-hour period
- **Multiple Triggers**:
  - Page load: Displays immediately
  - Delay: Shows after X milliseconds
  - Scroll: Shows after scrolling 40% down page
- **Rich Content** - Title, subtitle, description, images, CTA buttons
- **Image Gallery** - Multiple image support with carousel navigation

### Additional Features
- **Contact Form** - User inquiries through contact form
- **GST Validation** - Built-in GST validation for Indian business compliance
- **PDF Invoice Generation** - Automatic invoice generation for orders with Razorpay details
- **Email Service** - Nodemailer integration for transactional emails
- **Image CDN** - Cloudinary for optimized image delivery
- **Mobile Responsive** - Full responsive design from mobile (320px) to desktop (2560px+)

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.9 (React Server Components & Client Components)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.x with strict type checking
- **Styling**: Tailwind CSS 4 with PostCSS for utility-first CSS
- **Icons**: 
  - Lucide React 0.562.0
  - React Icons 5.5.0
- **Animations**: 
  - GSAP 3.14.2 (complex animations & tweens)
  - Framer Motion 12.23.26 (component animations)
  - Particles.js 3.9.1 (particle effects)
- **HTTP Client**: Axios 1.13.2 with interceptors
- **Date Handling**: date-fns for date operations
- **State Management**: React Hooks (useState, useContext, useEffect)

### Backend
- **Runtime**: Node.js with TypeScript
- **API**: Next.js API Routes (serverless functions)
- **Database**: MongoDB with Mongoose ODM 9.0.2
- **Authentication**: NextAuth.js 4.24.13 (session-based with JWT support)
- **Security**: bcryptjs 3.0.3 for password hashing
- **Email**: Nodemailer 7.0.12 for transactional emails
- **PDF Generation**: pdfkit 0.13.0 for invoice generation

### External Services & Integrations
- **Payment Gateway**: Razorpay 2.9.6 (PCI-DSS compliant payment processing)
- **Image CDN**: Cloudinary for image optimization and delivery
- **File Storage**: Cloudinary for video and image hosting
- **Email Service**: Nodemailer with Gmail/SMTP support
- **Deployment**: Vercel (Next.js optimized platform)
- **Image Management**: 
  - Cloudinary 2.8.0
  - Next-Cloudinary 6.17.5
- **PDF Generation**: PDFKit 0.17.2

### Development Tools
- **Linting**: ESLint 9 with Next.js config
- **Build Tool**: Next.js Built-in (Webpack 5)
- **CSS Processing**: PostCSS 4 with Tailwind CSS 4
- **Type Safety**: TypeScript 5
- **Code Optimization**: React Compiler (babel-plugin-react-compiler 1.0.0)

---

## Project Structure

```
basho/
├── src/
│   ├── app/                              # Next.js App Router (File-based routing)
│   │   ├── api/                          # API Routes (Backend endpoints)
│   │   │   ├── admin/                    # Admin-only endpoints
│   │   │   │   ├── stats                 # Dashboard statistics
│   │   │   │   ├── users                 # User management
│   │   │   │   ├── orders                # Order management
│   │   │   │   └── admins                # Admin user management
│   │   │   ├── auth/                     # Authentication endpoints
│   │   │   │   ├── register              # User registration
│   │   │   │   ├── login                 # User login
│   │   │   │   ├── session               # Session check
│   │   │   │   └── logout                # User logout
│   │   │   ├── cart/                     # Shopping cart endpoints
│   │   │   │   ├── add                   # Add to cart
│   │   │   │   ├── update                # Update cart item
│   │   │   │   ├── remove                # Remove from cart
│   │   │   │   └── clear                 # Clear cart
│   │   │   ├── categories/               # Product category management
│   │   │   │   ├── [id]                  # Category by ID
│   │   │   │   └── list                  # All categories
│   │   │   ├── contact/                  # Contact form endpoint
│   │   │   ├── corporate-inquiry/        # B2B corporate inquiries
│   │   │   ├── custom-order-photos/      # Custom order photo upload
│   │   │   ├── custom-orders/            # Custom order management
│   │   │   │   └── [id]                  # Custom order by ID
│   │   │   ├── events/                   # Event management
│   │   │   │   ├── [id]                  # Event by ID
│   │   │   │   ├── [id]/book             # Event booking
│   │   │   │   └── list                  # All events
│   │   │   ├── gallery/                  # Gallery management
│   │   │   │   ├── [id]                  # Gallery item by ID
│   │   │   │   └── list                  # All gallery items
│   │   │   ├── health/                   # Health check endpoint
│   │   │   ├── messages/                 # Messaging system
│   │   │   │   ├── [id]                  # Message by ID
│   │   │   │   └── send                  # Send message
│   │   │   ├── orders/                   # Order management
│   │   │   │   ├── [id]                  # Order by ID
│   │   │   │   ├── [id]/invoice          # Generate invoice
│   │   │   │   └── create                # Create order
│   │   │   ├── payments/                 # Razorpay payment processing
│   │   │   │   ├── create                # Create payment order
│   │   │   │   ├── verify                # Verify payment
│   │   │   │   └── [id]                  # Payment details
│   │   │   ├── popups/                   # Popup management
│   │   │   │   ├── [id]                  # Popup by ID
│   │   │   │   └── list                  # All popups
│   │   │   ├── products/                 # Product endpoints
│   │   │   │   ├── [id]                  # Product by ID
│   │   │   │   ├── list                  # All products
│   │   │   │   └── search                # Product search
│   │   │   ├── profile/                  # User profile endpoints
│   │   │   │   ├── get                   # Get profile
│   │   │   │   └── update                # Update profile
│   │   │   ├── reviews/                  # Product reviews
│   │   │   │   ├── [id]                  # Review by ID
│   │   │   │   └── create                # Create review
│   │   │   ├── testimonials/             # Testimonials
│   │   │   │   ├── [id]                  # Testimonial by ID
│   │   │   │   └── list                  # All testimonials
│   │   │   ├── upload/                   # Cloudinary file uploads
│   │   │   ├── user/                     # User management
│   │   │   │   ├── [id]                  # User by ID
│   │   │   │   └── list                  # All users
│   │   │   ├── wishlist/                 # Wishlist operations
│   │   │   │   ├── add                   # Add to wishlist
│   │   │   │   ├── remove                # Remove from wishlist
│   │   │   │   └── get                   # Get wishlist
│   │   │   └── workshop/                 # Workshop management
│   │   │       ├── [id]                  # Workshop by ID
│   │   │       ├── [id]/register         # Workshop registration
│   │   │       └── list                  # All workshops
│   │   │
│   │   ├── (pages)/                      # Main application pages
│   │   │   ├── page.tsx                  # Home page
│   │   │   ├── about/page.tsx            # About page
│   │   │   ├── gallery/page.tsx          # Gallery page
│   │   │   ├── products/page.tsx         # Products listing
│   │   │   ├── products/[id]/page.tsx    # Product detail page
│   │   │   ├── workshop/page.tsx         # Workshop listing
│   │   │   ├── workshop/[id]/page.tsx    # Workshop detail page
│   │   │   ├── events/page.tsx           # Events listing
│   │   │   ├── events/[id]/page.tsx      # Event detail page
│   │   │   ├── testimonial/page.tsx      # Testimonials page
│   │   │   ├── corporate/page.tsx        # Corporate inquiry form
│   │   │   ├── custom-order/page.tsx     # Custom order form
│   │   │   ├── checkout/page.tsx         # Shopping cart & checkout
│   │   │   ├── profile/page.tsx          # User profile (authenticated)
│   │   │   ├── studio/page.tsx           # Studio/about page
│   │   │   └── auth/                     # Authentication pages
│   │   │       ├── login/page.tsx        # User login
│   │   │       └── signup/page.tsx       # User registration
│   │   │
│   │   ├── admin/                        # Admin dashboard pages
│   │   │   ├── layout.tsx                # Admin layout wrapper
│   │   │   ├── page.tsx                  # Redirect to dashboard
│   │   │   ├── login/page.tsx            # Admin login
│   │   │   ├── dashboard/page.tsx        # Main dashboard
│   │   │   ├── products/page.tsx         # Product management
│   │   │   ├── categories/page.tsx       # Category management
│   │   │   ├── orders/page.tsx           # Order management
│   │   │   ├── payments/page.tsx         # Payment tracking
│   │   │   ├── customers/page.tsx        # Customer management
│   │   │   ├── workshops/page.tsx        # Workshop management
│   │   │   ├── workshop-registrations/page.tsx # Registration tracking
│   │   │   ├── events/page.tsx           # Event management
│   │   │   ├── gallery/page.tsx          # Gallery management
│   │   │   ├── custom-orders/page.tsx    # Custom order tracking
│   │   │   ├── custom-order-photos/page.tsx # Photo management
│   │   │   ├── corporate-inquiries/page.tsx # Corporate inquiry tracking
│   │   │   ├── testimonials/page.tsx     # Testimonial management
│   │   │   ├── user-reviews/page.tsx     # Review management
│   │   │   ├── popups/page.tsx           # Popup management
│   │   │   ├── static-data/page.tsx      # Static content management
│   │   │   ├── homepage/page.tsx         # Homepage section editor
│   │   │   └── admins/page.tsx           # Admin user management
│   │   │
│   │   ├── layout.tsx                    # Root layout component
│   │   ├── globals.css                   # Global styles
│   │   └── favicon.ico                   # Website favicon
│   │
│   ├── components/                       # Reusable React Components
│   │   ├── admin/                        # Admin dashboard components
│   │   │   ├── DashboardCard.tsx         # Dashboard stat card
│   │   │   ├── OrderTable.tsx            # Orders data table
│   │   │   ├── ProductForm.tsx           # Product create/edit form
│   │   │   ├── UserManagement.tsx        # User management component
│   │   │   └── ...                       # More admin components
│   │   ├── auth/                         # Authentication components
│   │   │   ├── LoginForm.tsx             # Login form
│   │   │   ├── SignupForm.tsx            # Registration form
│   │   │   └── ProtectedRoute.tsx        # Route protection
│   │   ├── common/                       # Shared components
│   │   │   ├── Button.tsx                # Button component
│   │   │   ├── Card.tsx                  # Card component
│   │   │   ├── Modal.tsx                 # Modal component
│   │   │   ├── Input.tsx                 # Input field
│   │   │   ├── Spinner.tsx               # Loading spinner
│   │   │   ├── Pagination.tsx            # Pagination component
│   │   │   └── ...                       # More shared components
│   │   ├── workshop/                     # Workshop-specific components
│   │   │   ├── WorkshopCard.tsx          # Workshop display card
│   │   │   ├── WorkshopRegistration.tsx  # Registration form
│   │   │   └── ...                       # More workshop components
│   │   ├── about/                        # About page components
│   │   │   ├── StudioInfo.tsx            # Studio information
│   │   │   └── ...                       # More about components
│   │   ├── ChatComponent.tsx             # Chat widget/component
│   │   ├── FeaturesSection.tsx           # Features showcase
│   │   ├── FeaturesSection.css           # Features styles
│   │   ├── Footer.tsx                    # Footer component
│   │   ├── Footer.css                    # Footer styles
│   │   ├── GsapSlider.tsx                # GSAP-powered image slider
│   │   ├── GsapSlider.css                # Slider styles
│   │   ├── HeroPot.tsx                   # Hero pot component
│   │   ├── HeroSlideshow.tsx             # Hero slideshow
│   │   ├── MediaShowcase.tsx             # Media gallery showcase
│   │   ├── MediaShowcase.css             # Media showcase styles
│   │   ├── Navbar.tsx                    # Navigation bar
│   │   ├── Navbar.css                    # Navbar styles
│   │   ├── NavbarWrapper.tsx             # Navbar wrapper
│   │   ├── Notification.tsx              # Notification/toast component
│   │   ├── TestimonialsShowcase.tsx      # Testimonials carousel
│   │   ├── TestimonialsShowcase.css      # Testimonials styles
│   │   └── ...                           # More components
│   │
│   ├── models/                           # Mongoose Database Models
│   │   ├── User.ts                       # User schema & model
│   │   ├── Product.ts                    # Product schema & model
│   │   ├── Category.ts                   # Category schema & model
│   │   ├── Cart.ts                       # Shopping cart schema
│   │   ├── Order.ts                      # Order schema & model
│   │   ├── CustomOrder.ts                # Custom order schema
│   │   ├── CustomOrderPhoto.ts           # Custom order photo schema
│   │   ├── Workshop.ts                   # Workshop schema & model
│   │   ├── Registration.ts               # Workshop registration schema
│   │   ├── Event.ts                      # Event schema & model
│   │   ├── EventBooking.ts               # Event booking schema
│   │   ├── Gallery.ts                    # Gallery items schema
│   │   ├── Message.ts                    # Messages schema & model
│   │   ├── CorporateInquiry.ts           # Corporate inquiry schema
│   │   ├── UserReview.ts                 # Product review schema
│   │   ├── Testimonial.ts                # Testimonial schema & model
│   │   ├── Popup.ts                      # Promotional popup schema
│   │   ├── Wishlist.ts                   # Wishlist schema & model
│   │   ├── HomePageContent.ts            # Homepage content schema
│   │   ├── StaticData.ts                 # Static page content schema
│   │   └── index.ts                      # Model exports
│   │
│   ├── lib/                              # Utility Libraries & Configurations
│   │   ├── mongodb.ts                    # MongoDB connection & pooling
│   │   ├── auth.ts                       # NextAuth.js configuration
│   │   ├── cloudinary.ts                 # Cloudinary client setup
│   │   ├── email.ts                      # Email utility functions
│   │   ├── mailer.ts                     # Nodemailer SMTP setup
│   │   ├── invoice-pdf.ts                # PDF invoice generation
│   │   ├── gst-validation.ts             # GST validation utilities
│   │   └── ...                           # More utilities
│   │
│   ├── types/                            # TypeScript Type Definitions
│   │   ├── global-jsx.d.ts               # Global JSX types
│   │   └── ...                           # Custom type definitions
│   │
│   ├── constants/                        # Application Constants
│   │   ├── colors.ts                     # Color palette definitions
│   │   ├── workshops.ts                  # Workshop constants
│   │   └── ...                           # More constants
│   │
│   └── middleware.ts                     # Next.js Middleware (auth, redirects)
│
├── public/                               # Static Files
│   ├── constants/                        # Public constants
│   ├── images/                           # Static images & assets
│   └── icons/                            # Icon assets
│
├── .env.local                            # Environment variables (not in repo)
├── .env.example                          # Example environment variables
├── .gitignore                            # Git ignore rules
├── next.config.ts                        # Next.js configuration
├── tailwind.config.js                    # Tailwind CSS configuration
├── postcss.config.mjs                    # PostCSS configuration
├── tsconfig.json                         # TypeScript configuration
├── eslint.config.mjs                     # ESLint configuration
├── package.json                          # Project dependencies
├── package-lock.json                     # Dependency lock file
├── make-admin.js                         # Admin user creation utility
├── README.md                             # This file
└── LICENSE                               # Project license
```

---

## Database Models

### User Model
```typescript
{
  _id: ObjectId
  email: String (unique, required)
  name: String (required)
  phone: String
  password: String (hashed with bcryptjs)
  address: {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }
  role: 'user' | 'admin' (default: 'user')
  isVerified: Boolean (default: false)
  profileImage: String (URL from Cloudinary)
  createdAt: Date
  updatedAt: Date
}
```

### Product Model
```typescript
{
  _id: ObjectId
  name: String (required)
  description: String
  price: Number (required)
  originalPrice: Number (for discounts)
  category: ObjectId (ref: Category)
  images: [String] (Cloudinary URLs)
  inventory: Number
  sku: String (unique)
  gst: Number (GST percentage)
  rating: Number
  reviews: [ObjectId] (ref: UserReview)
  isFeatured: Boolean
  createdAt: Date
  updatedAt: Date
}
```

### Order Model
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  items: [{
    productId: ObjectId (ref: Product)
    quantity: Number
    price: Number
    name: String
  }]
  totalAmount: Number
  shippingCharge: Number
  discount: Number
  paymentStatus: 'pending' | 'completed' | 'failed'
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }
  paymentId: String (Razorpay)
  invoiceUrl: String
  createdAt: Date
  updatedAt: Date
}
```

### CustomOrder Model
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  title: String (required)
  description: String
  photos: [ObjectId] (ref: CustomOrderPhoto)
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  estimatedPrice: Number
  finalPrice: Number
  notes: String
  createdAt: Date
  updatedAt: Date
}
```

### Workshop Model
```typescript
{
  _id: ObjectId
  title: String (required)
  description: String
  date: Date
  time: String
  duration: Number (in minutes)
  maxParticipants: Number
  currentParticipants: Number
  price: Number
  location: String
  imageUrl: String (Cloudinary)
  instructor: String
  level: 'beginner' | 'intermediate' | 'advanced'
  materials: [String]
  createdAt: Date
  updatedAt: Date
}
```

### Additional Models
- **Category** - Product categories with hierarchy
- **Cart** - User shopping carts with item management
- **Gallery** - Photo gallery items with metadata
- **Message** - User messages and support communications
- **CorporateInquiry** - B2B inquiries with company details
- **UserReview** - Product reviews with ratings
- **Testimonial** - Customer testimonials with images
- **Popup** - Promotional popups with scheduling
- **Wishlist** - User wishlists with product references
- **Registration** - Workshop registrations with participant info
- **EventBooking** - Event bookings with attendee tracking
- **HomePageContent** - Homepage sections and content
- **StaticData** - Static page content and SEO metadata

---

## API Endpoints Summary

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Products & Categories
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/[id]` - Get product details
- `GET /api/products/search?q=query` - Search products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)
- `GET /api/categories` - Get all categories
- `GET /api/categories/[id]` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/[id]` - Update category (Admin)
- `DELETE /api/categories/[id]` - Delete category (Admin)

### Shopping & Orders
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `POST /api/cart/clear` - Clear entire cart
- `GET /api/orders` - Get user's orders
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/[id]` - Update order status (Admin)
- `GET /api/orders/[id]/invoice` - Download order invoice
- `DELETE /api/orders/[id]` - Cancel order

### Payments
- `POST /api/payments/create` - Create Razorpay payment order
- `POST /api/payments/verify` - Verify payment signature
- `GET /api/payments/[id]` - Get payment details
- `GET /api/payments?status=completed` - Get payments by status

### Workshops & Events
- `GET /api/workshop` - Get all workshops
- `GET /api/workshop/[id]` - Get workshop details
- `POST /api/workshop` - Create workshop (Admin)
- `PUT /api/workshop/[id]` - Update workshop (Admin)
- `DELETE /api/workshop/[id]` - Delete workshop (Admin)
- `POST /api/workshop/[id]/register` - Register for workshop
- `GET /api/events` - Get all events
- `GET /api/events/[id]` - Get event details
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/[id]` - Update event (Admin)
- `DELETE /api/events/[id]` - Delete event (Admin)
- `POST /api/events/[id]/book` - Book event

### Custom Orders
- `GET /api/custom-orders` - Get user's custom orders
- `POST /api/custom-orders` - Create custom order request
- `GET /api/custom-orders/[id]` - Get custom order details
- `PUT /api/custom-orders/[id]` - Update custom order (Admin)
- `DELETE /api/custom-orders/[id]` - Delete custom order
- `POST /api/custom-order-photos/upload` - Upload custom order photos
- `DELETE /api/custom-order-photos/[id]` - Delete photo

### Gallery & Media
- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/[id]` - Get gallery item details
- `POST /api/gallery` - Create gallery item (Admin)
- `PUT /api/gallery/[id]` - Update gallery item (Admin)
- `DELETE /api/gallery/[id]` - Delete gallery item (Admin)
- `POST /api/upload` - Upload file to Cloudinary

### Reviews & Testimonials
- `GET /api/reviews` - Get product reviews
- `POST /api/reviews` - Create product review
- `DELETE /api/reviews/[id]` - Delete review
- `PUT /api/reviews/[id]` - Update review (Admin)
- `GET /api/testimonials` - Get all testimonials
- `POST /api/testimonials` - Create testimonial
- `PUT /api/testimonials/[id]` - Update testimonial (Admin)
- `DELETE /api/testimonials/[id]` - Delete testimonial (Admin)

### User & Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/user/[id]` - Get user info by ID
- `POST /api/user/update` - Update user data
- `GET /api/user/orders` - Get user's order history
- `PUT /api/user/password` - Change password

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add product to wishlist
- `DELETE /api/wishlist/remove/[id]` - Remove product from wishlist

### Communication
- `POST /api/contact` - Submit contact form
- `GET /api/messages` - Get all messages (Admin)
- `POST /api/messages` - Send message
- `DELETE /api/messages/[id]` - Delete message (Admin)
- `POST /api/corporate-inquiry` - Submit corporate inquiry
- `GET /api/corporate-inquiry` - Get inquiries (Admin)
- `PUT /api/corporate-inquiry/[id]` - Update inquiry (Admin)

### Admin Management
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products
- `POST /api/admin/admins/create` - Create admin user
- `DELETE /api/admin/admins/[id]` - Delete admin user
- `PUT /api/admin/admins/[id]` - Update admin permissions

### Utilities
- `GET /api/health` - Health check endpoint
- `POST /api/popups` - Create popup (Admin)
- `GET /api/popups` - Get all popups
- `DELETE /api/popups/[id]` - Delete popup (Admin)

---

## Pages & Routes

### Public Pages
| Route | Purpose |
|-------|---------|
| `/` | Home page with hero, features, products showcase |
| `/about` | About Shivangi studio page |
| `/products` | Product listing and browsing |
| `/products/[id]` | Product detail page with reviews |
| `/gallery` | Photo gallery showcase |
| `/workshop` | Workshop listing and details |
| `/workshop/[id]` | Workshop detail with registration |
| `/events` | Events listing page |
| `/events/[id]` | Event detail with booking |
| `/testimonial` | Customer testimonials carousel |
| `/corporate` | Corporate inquiry form |
| `/custom-order` | Custom order request form |
| `/checkout` | Shopping cart and checkout |
| `/profile` | User profile (authenticated only) |
| `/auth/login` | User login page |
| `/auth/signup` | User registration page |
| `/studio` | Studio information page |

### Admin Pages
| Route | Purpose |
|-------|---------|
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Main dashboard with statistics |
| `/admin/products` | Product CRUD management |
| `/admin/categories` | Category management |
| `/admin/orders` | Order viewing and status management |
| `/admin/orders/[id]` | Order detail and invoice |
| `/admin/payments` | Payment tracking and reconciliation |
| `/admin/customers` | Customer list and management |
| `/admin/workshops` | Workshop CRUD operations |
| `/admin/workshop-registrations` | Registration tracking |
| `/admin/events` | Event management |
| `/admin/events/[id]/bookings` | Event booking list |
| `/admin/gallery` | Gallery management |
| `/admin/custom-orders` | Custom order tracking |
| `/admin/custom-order-photos` | Photo management |
| `/admin/corporate-inquiries` | Corporate inquiry tracking |
| `/admin/testimonials` | Testimonial management |
| `/admin/user-reviews` | Product review management |
| `/admin/popups` | Promotional popup manager |
| `/admin/static-data` | Static page content editor |
| `/admin/homepage` | Homepage section editor |
| `/admin/admins` | Admin user management |

---

## Admin Dashboard Features

### Dashboard Overview
- **Real-time Statistics** - Total sales, orders count, customer count, revenue charts
- **Recent Activities** - Latest orders, registrations, inquiries
- **Quick Actions** - Create product, view orders, manage users
- **Performance Metrics** - Sales trends, top products, customer retention

### Product Management
- **Create Products** - Add new products with images, pricing, GST
- **Edit Products** - Update details, pricing, inventory
- **Bulk Operations** - Manage multiple products, bulk pricing updates
- **Category Management** - Organize products into categories
- **Inventory Tracking** - Monitor stock levels

### Order Management
- **Order Listing** - View all orders with filters and sorting
- **Order Details** - View customer info, items, shipping address
- **Status Updates** - Change order status (pending→processing→shipped→delivered)
- **Invoice Generation** - Generate and download PDF invoices
- **Refund Management** - Process refunds and cancellations

### Payment Management
- **Payment Tracking** - View all Razorpay transactions
- **Payment Status** - Monitor completed, pending, failed payments
- **Reconciliation** - Match payments with orders
- **Revenue Reports** - Daily/monthly/yearly revenue analytics

### User Management
- **Customer List** - View all registered users
- **User Details** - Name, email, phone, address, orders
- **User Activity** - Order history, wishlist, reviews
- **Admin Creation** - Create new admin accounts with permissions
- **Role Management** - Assign/revoke admin privileges

### Workshop Management
- **Create Workshops** - Add new workshops with details
- **Edit Workshops** - Update timing, capacity, pricing
- **Registration Tracking** - View registered participants
- **Capacity Management** - Set max participants and current count
- **Email Notifications** - Send confirmation emails

### Event Management
- **Create Events** - Add new events with information
- **Event Details** - Edit time, location, capacity
- **Booking Tracking** - View event attendees
- **Booking Management** - Accept/reject bookings
- **Attendance** - Mark attendance and track participation

### Custom Order Management
- **Order Requests** - View custom order requests from customers
- **Photo Management** - View uploaded reference photos
- **Status Tracking** - Update order progress and status
- **Pricing** - Set estimated and final prices
- **Communication** - Internal notes and customer messages

### Gallery Management
- **Upload Photos** - Add new gallery images
- **Organize Gallery** - Manage photo collections
- **Delete Images** - Remove unwanted photos
- **Image Details** - Add titles and descriptions
- **Gallery Categories** - Organize by theme or project

### Content Management
- **Testimonials** - Manage customer testimonials display
- **Reviews** - View and manage product reviews
- **Popups** - Create promotional popups with scheduling
- **Static Pages** - Edit about, contact, terms pages
- **Homepage** - Edit hero sections, features, CTAs
- **SEO Data** - Manage meta titles and descriptions

### Communication
- **Messages** - View and respond to user messages
- **Contact Inquiries** - Manage contact form submissions
- **Corporate Inquiries** - Handle B2B inquiries
- **Email Templates** - Customize notification emails
- **Bulk Communication** - Send newsletters to customers

---

## Components Overview

### Layout Components
- **Navbar** - Navigation with logo, menu, search, cart, user menu
- **NavbarWrapper** - Authentication wrapper for navbar
- **Footer** - Footer with links, social, contact info
- **Layout** - Main page layout wrapper

### Hero & Landing
- **HeroPot** - Hero section with call-to-action
- **HeroSlideshow** - Auto-playing hero image slideshow
- **GsapSlider** - GSAP-animated product/image slider
- **FeaturesSection** - Features showcase with icons

### Product Display
- **ProductCard** - Product display card with image and price
- **ProductGrid** - Grid layout for products
- **ProductDetail** - Full product page with reviews
- **ReviewSection** - Product reviews and ratings
- **AddToCart** - Add to cart button with quantity

### Shopping & Checkout
- **CartSummary** - Cart items summary
- **CheckoutForm** - Checkout form with shipping
- **PaymentForm** - Payment information input
- **OrderConfirmation** - Order success page

### Testimonials & Media
- **TestimonialsShowcase** - Customer testimonials carousel
- **MediaShowcase** - Image gallery with lightbox
- **GalleryGrid** - Photo grid display
- **ChatComponent** - Chat widget for support

### Admin Components
- **DashboardCard** - Statistics card component
- **DataTable** - Reusable data table with sorting
- **FormBuilder** - Dynamic form component
- **ImageUpload** - File upload with preview
- **DatePicker** - Date selection component
- **Modal** - Reusable modal dialog
- **Pagination** - Pagination controls
- **Filters** - Advanced filtering panel

### Common Components
- **Button** - Reusable button variants
- **Input** - Text input with validation
- **Select** - Dropdown select component
- **Textarea** - Multi-line text input
- **Card** - Card container component
- **Badge** - Status badge component
- **Spinner** - Loading spinner animation
- **Alert** - Alert/notification component
- **Toast** - Toast notification system

---

## Scripts & Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000 (Local development)
yarn dev
pnpm dev

# Production Build
npm run build            # Build optimized production bundle
npm start                # Start production server
npm run build:analyze    # Analyze bundle size with visualization

# Code Quality
npm run lint             # Run ESLint checks
npm run lint:fix         # Fix linting issues automatically
npm test                 # Run test suite (if configured)

# Admin Utilities
node make-admin.js       # Create admin user from CLI
npm run seed-db          # Seed database with sample data (if available)

# Database
npm run db:migrate       # Run database migrations (if configured)
npm run db:backup        # Backup MongoDB database (if configured)
```

---

## Environment Configuration

### .env.local Setup
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/basho?retryWrites=true&w=majority

# NextAuth.js
NEXTAUTH_URL=http://bashoproject.vercel.app
NEXTAUTH_SECRET=your-secret-key-min-32-characters

# Cloudinary Image Service
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email Service (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@basho.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Admin Account
ADMIN_EMAIL=admin@basho.com
ADMIN_PASSWORD=secure-password-here

# API Configuration
NEXT_PUBLIC_API_URL=http://bashoproject.vercel.app
NODE_ENV=production
```

---

## Mobile Responsive Design

The platform is fully responsive and optimized for all device sizes:

### Breakpoints & Coverage
- **Mobile (320px - 640px)**: Full mobile optimization with touch-friendly UI
- **Tablet (641px - 1024px)**: Optimized tablet experience with adjusted layouts
- **Desktop (1025px - 1440px)**: Full-featured desktop interface
- **Large Screens (1441px+)**: Enhanced layout for ultra-wide displays

### Responsive Components
- **Navigation**: Mobile hamburger menu → Desktop full navbar
- **Product Grid**: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
- **Workshop Cards**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- **Hero Section**: Reduced height (45vh mobile → 60vh tablet → 60vh desktop)
- **Checkout Form**: Single column (mobile) → Two column (desktop)
- **Admin Dashboard**: Full sidebar (desktop) → Collapsible menu (tablet/mobile)
- **Forms**: Full-width (mobile) → Contained width (desktop)
- **Images**: Responsive with Cloudinary dynamic sizing
- **Videos**: Responsive containers with aspect ratio preservation

### CSS Framework Features
- **Tailwind CSS**: Mobile-first utility classes
- **Breakpoint System**: sm, md, lg, xl breakpoints
- **Responsive Typography**: Scales from 14px (mobile) to 32px+ (desktop)
- **Spacing**: Adaptive padding & margins
- **Flexbox & Grid**: Flexible layouts that adapt to screens

---

## Recent Updates (January 2026)

### Hero Slideshow Enhancements
- ✅ Added video support (MP4, WebM, OGG, MOV, MKV, AVI formats)
- ✅ 10-second slide transitions for smooth playback
- ✅ Reduced component size by 25-30% for better page layout
- ✅ Automatic media type detection

### Popup Management System
- ✅ Complete CRUD operations for popups (Create, Read, Update, Delete)
- ✅ **Edit Existing Popups** - Click "Edit" button to modify popup details
- ✅ Page-specific targeting - Popups only show on selected pages
- ✅ Schedule control with start/end dates
- ✅ Multiple frequency options (always, once per session, once per day)
- ✅ Trigger types (page load, delay, scroll)
- ✅ Rich content support (images, title, description, CTA)
- ✅ Image gallery with carousel navigation
- ✅ Debug logging for troubleshooting popup display
- ✅ Migration endpoint for fixing existing popups

### Workshop System Improvements
- ✅ Date picker for workshop registration
- ✅ Mandatory login requirement for registration
- ✅ Auto-populated email from session
- ✅ Formatted text display (multiline text as bullet points):
  - What You Will Learn section
  - Includes section
  - More Information section
- ✅ Fast payment flow (1-second Razorpay opening)

### Admin Panel Enhancements
- ✅ Image and video upload support for homepage hero slideshow
- ✅ FormData API for efficient multipart uploads
- ✅ Media preview with type detection
- ✅ Loading spinner during upload
- ✅ Popup edit functionality with form pre-population
- ✅ Validation messaging for required fields
- ✅ Migration endpoint for data consistency

### Homepage Management
- ✅ 7-slot hero slideshow with image/video support
- ✅ GSAP slider image management
- ✅ Features section image management
- ✅ Cloudinary integration for all media

### Mobile Responsiveness
- ✅ Full responsive design from 320px to 2560px+
- ✅ Touch-friendly UI elements
- ✅ Optimized form layouts for mobile
- ✅ Responsive hero section (45vh mobile, 60vh tablet)
- ✅ Mobile-optimized navigation

---

## Development Guide
````

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm/yarn/pnpm/bun
- MongoDB 4.4+ (local or Atlas cloud)
- Git
- VS Code (recommended)

### Initial Setup

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/basho.git
cd basho
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

4. **Setup MongoDB**
- Create MongoDB Atlas account or use local MongoDB
- Create database named `basho`
- Add connection string to MONGODB_URI

5. **Setup NextAuth**
- Generate secret: `openssl rand -base64 32`
- Add to NEXTAUTH_SECRET

6. **Setup Cloudinary**
- Create Cloudinary account at cloudinary.com
- Get Cloud Name, API Key, API Secret
- Add to environment variables

7. **Setup Razorpay**
- Create Razorpay account
- Get Key ID and Secret
- Add to environment variables

8. **Create Admin User**
```bash
node make-admin.js
```

9. **Start Development Server**
```bash
npm run dev
```

10. **Access Application**
- Live App: http://bashoproject.vercel.app
- Admin Panel: http://bashoproject.vercel.app/admin/login
- Local Dev: http://localhost:3000

### Development Best Practices
- Use TypeScript for type safety
- Follow ESLint rules: `npm run lint:fix`
- Use Tailwind CSS for styling
- Keep components modular and reusable
- Write comments for complex logic
- Test API endpoints with Postman/Thunder Client
- Use git branches for features

---

## Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Sign in to Vercel (vercel.com)
3. Import project from GitHub
4. Configure environment variables in Vercel dashboard
5. Deploy automatically

### Deploy to Other Platforms

**AWS:**
- Use Elastic Beanstalk or EC2
- Configure RDS for MongoDB or use Atlas
- Setup CloudFront for CDN

**DigitalOcean:**
- Create App Platform application
- Connect GitHub repository
- Add environment variables
- Deploy

**Docker Deployment:**
```bash
docker build -t basho .
docker run -p 3000:3000 --env-file .env.local basho
```

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Database backup created
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - builds successfully
- [ ] Test all critical features
- [ ] Security review completed
- [ ] HTTPS enabled
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring enabled

---

## Security

### Implemented Security Features
- **Password Hashing** - bcryptjs with salt rounds
- **Session Management** - Secure cookies with NextAuth.js
- **Authentication** - OAuth and JWT support
- **Authorization** - Role-based access control (RBAC)
- **Payment Security** - Razorpay PCI-DSS compliant
- **Image Security** - Cloudinary URL signing
- **Email Verification** - OTP and email confirmation
- **Environment Variables** - No secrets in code
- **HTTPS** - Required for production
- **CORS** - Configured for API access
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Server-side validation

---

## Performance Optimizations

- **Next.js Image Optimization** - Automatic WebP/AVIF conversion
- **Code Splitting** - Automatic route-based splitting
- **CSS-in-JS** - Tailwind CSS for minimal bundle
- **API Route Caching** - Server-side caching
- **Database Indexing** - Optimized MongoDB indexes
- **CDN Integration** - Cloudinary for image delivery
- **React Compiler** - Optimized component rendering

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 |
| Firefox | Latest 2 |
| Safari | Latest 2 |
| Edge | Latest 2 |
| Mobile Chrome | Latest |
| Mobile Safari | Latest |

---

## Support & Contact

For support or inquiries:
- Email: support@basho.com
- Phone: +91-XXXXXXXXXX
- Website: https://basho.com
- Social: @bashobshivangi (Instagram)

---

## License

Proprietary and confidential. All rights reserved © 2024 Basho by Shivangi.

---

## Future Enhancements

- [ ] Advanced analytics & BI dashboard
- [ ] Inventory management system
- [ ] Customer loyalty & rewards program
- [ ] AI-powered product recommendations
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (Socket.io)
- [ ] Advanced search with filters
- [ ] Video tutorials & guides
- [ ] Live chat support system
- [ ] Subscription products support
- [ ] Bulk order management
- [ ] Automated email campaigns
- [ ] Inventory alerts
- [ ] Vendor/seller portal

---

## Contributing

This is a private project. For collaboration:
1. Contact project maintainers
2. Submit feature requests via email
3. Report bugs with detailed information
4. Follow code style guidelines

---

**Last Updated**: January 17, 2026
**Version**: 1.0.0
**Status**: Production Ready

For the latest updates and documentation, visit the project repository.
