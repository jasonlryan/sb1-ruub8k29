# Cursor Rules for HomeTruth Business Model Project

## Tech Stack & Architecture

- Frontend: React + TypeScript + Vite
- Database: Supabase (PostgreSQL)
- State Management: React useState/useEffect
- Styling: Tailwind CSS
- Icons: Lucide React
- UI Components: HeadlessUI

## Data Flow

- ✅ ALL data is managed by Supabase
- ✅ Data mutations happen through Supabase client
- ✅ Local state syncs with Supabase
- ✅ Changes are persisted via handleSync function

## DO

- Modify data display/sorting in components
- Handle data transformations client-side
- Use existing Supabase queries
- Work with existing state management patterns
- Follow established TypeScript types
- Maintain existing UI patterns

## DON'T

- Add hardcoded data in components
- Create new database tables
- Change database schema
- Modify data persistence patterns
- Add new environment variables
- Change authentication flow

## Component Patterns

- Tables use shared Table component
- Sections follow standard layout
- Numbers use toLocaleString for formatting
- Currency shown with £ symbol
- Percentages shown with % symbol
- Edit handlers follow standard pattern

## State Management

- State lives at App.tsx level
- Props passed down to sections
- Updates flow back up via callbacks
- Supabase sync happens in handleSync

## Error Handling

- Try/catch blocks around Supabase calls
- Error state managed at App level
- User feedback via alerts
- Console logging for debugging

## Authentication

- Managed by Supabase auth
- User context available globally
- Required for all data operations

5. After suggesting any code changes, the assistant will:

   - Check the linter status
   - Report back with:
     - Which errors/warnings were fixed
     - Which errors/warnings remain
     - Any new errors/warnings introduced

   The assistant will format this report like:

   ```
   Linter status after change:
   ✓ Fixed: [list of fixed errors]
   ⚠ Remaining: [list of remaining errors]
   ✕ New: [list of new errors introduced]
   ```

   The assistant will not proceed with additional changes until confirming the linter status of its previous suggestion.
