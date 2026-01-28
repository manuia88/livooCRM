# PropiedadesMX - Premium Real Estate Platform

A high-fidelity, luxury real estate platform designed for the Mexican market. Built with Next.js 15, Tailwind CSS, Supabase, and Leaflet.

## Features

- **Premium UX/UI**: "Luxury" aesthetic with deep navy/gold palette and smooth animations.
- **Interactive Maps**: Client-side Leaflet integration for listings and property details.
- **Advanced Search**: Real-time filtering (ready for expansion) and responsive grid layouts.
- **Property Details**: QuintoAndar-style image gallery, sticky sidebar, and mobile-optimized action bar.
- **Backend Ready**: Fully integrated with Supabase (Auth + Database).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (Comp.), Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Maps**: React-Leaflet / OpenStreetMap

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase Project

### 2. Installation

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. Copy the SQL from `supabase/schema.sql`.
2. Run it in your Supabase SQL Editor to create tables (Properties, Agents, Features) and Policies.

### 5. Seeding Data

To populate the database with the "Premium" mock dataset:

1. Run the development server:
   ```bash
   npm run dev
   ```
2. Visit `http://localhost:3000/api/seed` in your browser.
3. You should see `{"success": true ...}`.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `/src/app`: Routes and Pages (Server Components by default).
- `/src/components`: UI Components (Buttons, Cards, Maps).
- `/src/services`: Data fetching logic (Supabase).
- `/src/types`: TypeScript interfaces.
- `/supabase`: SQL schemas.
