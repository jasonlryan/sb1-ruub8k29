# HomeTruth Business Model

A SaaS application for modeling business financials and metrics.

## Architecture

- Frontend: React + TypeScript + Vite
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Styling: Tailwind CSS

## Authentication & Authorization

### User Types

- Admin: Full system access
- Organization Owner: Full access to org data
- Organization Member: Access based on role

### Organizations

- Multi-tenant structure
- Each user belongs to one or more organizations
- Data is isolated by organization

### Roles & Permissions

- Owner: Can manage org settings and members
- Admin: Can manage data and invite members
- Member: Can view and edit assigned data

## Data Models

### Auth Models

```typescript
interface UserProfile {
  id: string;
  role: "admin" | "user";
  company_name: string;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

interface TeamMember {
  user_id: string;
  org_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}
```

### Business Models

[List key business models here]

## Getting Started

1. Environment Setup

```bash
# Required environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

2. Installation

```bash
npm install
npm run dev
```
