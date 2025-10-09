# Questionnaire System Implementation Guide

## ✅ Completed Implementation

### 1. Database Schema (✓ DONE)
**File:** `prisma/schema.prisma`

**Changes Made:**
- ✅ Added `CLIENT` role to `UserRole` enum
- ✅ Created `QuestionnaireSubmission` model with `userId` foreign key
- ✅ Created `SubmissionAnswer` model for storing answers
- ✅ Created `UploadedFile` model for file attachments
- ✅ Added relationship: `User.questionnaireSubmissions`
- ✅ Database synced with `prisma db push`

**Key Features:**
- User-submission relationship ensures each submission is linked to an authenticated user
- Supports draft and completed states
- Handles multiple answer types (text, JSON for complex structures)
- File upload tracking with metadata

### 2. Backend API (✓ DONE)
**File:** `src/server/api/routers/questionnaire.ts`

**Endpoints Created:**

#### Client Endpoints (Protected - Requires Authentication)
- ✅ `questionnaire.submit` - Submit completed questionnaire
- ✅ `questionnaire.saveDraft` - Auto-save draft with ownership verification
- ✅ `questionnaire.getMySubmissions` - Get user's own submissions only
- ✅ `questionnaire.getMySubmission` - Get single submission (ownership verified)

#### Admin Endpoints (Admin Only)
- ✅ `questionnaire.getAllSubmissions` - View all client submissions
- ✅ `questionnaire.getSubmission` - View any submission with client details
- ✅ `questionnaire.getStats` - Dashboard statistics

**Security Features:**
- ✅ All inputs sanitized to prevent XSS attacks
- ✅ User-scoped queries prevent data leakage
- ✅ Role-based access control (CLIENT vs ADMIN)
- ✅ Transaction-based submissions for data integrity

### 3. Sanitization Utilities (✓ DONE)
**File:** `src/server/utils/sanitization.ts`

**Functions:**
- ✅ `sanitizeText` - Remove HTML tags and dangerous characters
- ✅ `sanitizeEmail` - Validate and clean email addresses
- ✅ `sanitizePhone` - Clean phone numbers
- ✅ `sanitizeUrl` - Validate URLs (only http/https allowed)
- ✅ `sanitizeJson` - Recursively clean complex data structures
- ✅ `sanitizeFileMetadata` - Clean file metadata
- ✅ `sanitizeCompanyName` - Validate company names (2-100 chars)

### 4. Router Registration (✓ DONE)
**File:** `src/server/api/root.ts`

- ✅ Questionnaire router registered as `questionnaire: questionnaireRouter`
- ✅ TypeScript types automatically generated

### 5. Client Dashboard (✓ DONE)
**File:** `src/app/[locale]/dashboard/briefs/page.tsx`

**Features:**
- ✅ View all personal submissions
- ✅ Stats cards (Total, Completed, Drafts)
- ✅ Filter by completion status
- ✅ Beautiful card-based UI with metadata
- ✅ Link to create new brief
- ✅ Empty state with call-to-action
- ✅ Protected route with session check

### 6. Admin Dashboard (✓ DONE)
**File:** `src/app/admin/submissions/page.tsx`

**Features:**
- ✅ View all client submissions
- ✅ Statistics dashboard (4 metric cards)
- ✅ Filter tabs (All, Completed, Drafts)
- ✅ Comprehensive table with client details
- ✅ Shows submitter information
- ✅ Status badges
- ✅ Admin-only access

### 7. Questionnaire Questions Data (✓ DONE)
**File:** `src/data/questionnaires/project-brief.ts`

**Features:**
- ✅ Complete 47-question project brief questionnaire
- ✅ Organized into 18 logical sections
- ✅ All question types supported (text, select, checkbox, date, file upload, matrix, multi-field, signature, etc.)
- ✅ Identical to standalone questionnaire app
- ✅ TypeScript typed with proper interfaces

**Sections:**
1. Client Details (6 questions)
2. Event Details (6 questions)
3. Stand Details (11 questions)
4. Activations (3 questions)
5. Design Requirements - Concept (1 question)
6. Design Requirements - Development (1 question)
7. Design Requirements - Technical (1 question)
8. Space Management (2 questions)
9. Design Requirements - Other (1 question)
10. Branding Requirements (4 questions)
11. Look & Feel (2 questions)
12. Proposal and Budget (4 questions)
13. Other Requirements (1 question)
14. Notes (1 question)
15. Submission (1 question)
16. Digital Signature (1 question)
17. Review (1 question)

### 8. Questionnaire UI Components (✓ DONE)
**Location:** `src/components/questionnaire/`

**Core Components:**
- ✅ `types.ts` - TypeScript type definitions for all question types
- ✅ `QuestionnaireFlow.tsx` - Main orchestrator component with section-based navigation
- ✅ `QuestionCard.tsx` - Universal question renderer supporting all 30+ question types
- ✅ `WelcomeScreen.tsx` - Branded introduction screen
- ✅ `ThankYouScreen.tsx` - Completion screen with report generation
- ✅ `ProgressBar.tsx` - Animated progress indicator
- ✅ `NavigationButtons.tsx` - Previous/Next navigation with loading states
- ✅ `DateInput.tsx` - Custom date picker component
- ✅ `RangeSlider.tsx` - Interactive range slider
- ✅ `ValidationError.tsx` - Error display component

**Features:**
- ✅ All 30+ question types supported (text, textarea, select, checkbox, matrix, file upload, signature, drawing, etc.)
- ✅ Framer Motion animations for smooth transitions
- ✅ Section-based navigation with progress tracking
- ✅ Real-time answer validation
- ✅ Keyboard shortcuts (Enter to advance)
- ✅ Responsive design
- ✅ Dark theme matching Kayan Live branding
- ✅ File upload with drag-and-drop
- ✅ Canvas-based drawing and signature capture
- ✅ Matrix grids for complex data entry

### 9. Protected Questionnaire Route (✓ DONE)
**File:** `src/app/[locale]/questionnaire/[id]/page.tsx`

**Features:**
- ✅ Authentication check with NextAuth
- ✅ Automatic redirect to login for unauthenticated users
- ✅ Callback URL preservation for post-login redirect
- ✅ Loading state during auth check
- ✅ Renders QuestionnaireFlow for authenticated users
- ✅ Internationalization support via locale parameter

**Usage:**
- Navigate to `/{locale}/questionnaire/project-brief`
- User must be logged in
- Questionnaire data loaded from `project-brief.ts`
- Answers submitted via tRPC to database

---

## 🚧 Remaining Implementation Tasks

### 1. Submission Detail Pages (HIGH PRIORITY)

**Client Detail Page**
- **Path:** `src/app/[locale]/dashboard/briefs/[id]/page.tsx`
- **Requirements:**
  - Display all answers organized by section
  - Show uploaded files with download links
  - Display submission metadata
  - Show submission timeline (created, updated, submitted dates)
  - Add "Edit Draft" button for incomplete submissions
  - Add export to PDF functionality

**Admin Detail Page**
- **Path:** `src/app/admin/submissions/[id]/page.tsx`
- **Requirements:**
  - Same as client view but with additional:
  - Client information panel (name, email, account details)
  - Internal notes section (admin-only)
  - Status update controls
  - Export options (PDF, CSV)

**Example Structure:**
```tsx
'use client';

import { api } from '@/trpc/client';
import { useParams } from 'next/navigation';

export default function SubmissionDetailPage() {
  const params = useParams();
  const { data, isLoading } = api.questionnaire.getMySubmission.useQuery({
    id: params.id as string,
  });

  // Render submission details...
}
```

### 2. Questionnaire Form Component (HIGH PRIORITY)

**Files to Copy from `questionnaire` app:**
- `QuestionnaireFlow.tsx` - Main form flow
- `QuestionCard.tsx` - Individual question renderer
- `WelcomeScreen.tsx` - Introduction screen
- `ThankYouScreen.tsx` - Completion screen
- `ProgressBar.tsx` - Progress indicator
- `DateInput.tsx` - Date picker
- `RangeSlider.tsx` - Slider input
- `NavigationButtons.tsx` - Next/Previous buttons
- `ValidationError.tsx` - Error display
- `useFormPersistence.ts` - Auto-save hook
- `validation-schemas.ts` - Zod validation
- `types.ts` - TypeScript types

**Destination:** `src/components/questionnaire/`

**Adaptations Needed:**
- Update import paths
- Integrate with kayanlive-main's tRPC client
- Add internationalization support (next-intl)
- Update styling to match app theme

### 3. Questionnaire Questions Data

**Create:** `src/data/questionnaires/project-brief.ts`

```typescript
export const projectBriefQuestions = [
  {
    id: 1,
    section: 'Client Details',
    type: 'text',
    question: 'Company Name',
    required: true,
  },
  {
    id: 2,
    section: 'Client Details',
    type: 'email',
    question: 'Contact Email',
    required: true,
  },
  // ... add all questions
];
```

### 4. Protected Questionnaire Route

**File:** `src/app/[locale]/questionnaire/[id]/page.tsx`

```tsx
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import QuestionnaireFlow from '@/components/questionnaire/QuestionnaireFlow';
import { api } from '@/trpc/client';

export default function QuestionnairePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const submitMutation = api.questionnaire.submit.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/briefs/${data.submissionId}`);
    },
  });

  if (status === 'unauthenticated') {
    redirect('/login?callbackUrl=/questionnaire/' + params.id);
  }

  return (
    <QuestionnaireFlow
      questionnaireId={params.id}
      questions={projectBriefQuestions} // Import from data file
      onSubmit={(data) => submitMutation.mutate(data)}
    />
  );
}
```

### 5. Navigation Links

**Update:** `src/components/Navigation.tsx` or main navigation component

Add links for:
- Client users: "My Briefs" → `/dashboard/briefs`
- Admin users: "Submissions" → `/admin/submissions`

### 6. Type Definitions

**Create:** `src/types/questionnaire.ts`

```typescript
export interface Question {
  id: number;
  section: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea' | 'date' | 'file';
  question: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select/checkbox
  validation?: any; // Zod schema
}

export interface SubmissionData {
  questionnaireId: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  industry?: string;
  answers: Answer[];
  uploadedFiles?: FileUpload[];
  isComplete: boolean;
}

// ... more types
```

### 7. File Upload Handling

**Create:** `src/app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Handle file upload to cloud storage (AWS S3 / Cloudinary / local)
  // Return file URL and metadata
}
```

### 8. Testing

**Create test files:**
- `src/__tests__/api/questionnaire.test.ts` - API endpoint tests
- `src/__tests__/components/QuestionnaireFlow.test.tsx` - Component tests

**Test cases:**
- ✓ User can only view their own submissions
- ✓ Admin can view all submissions
- ✓ Draft saving works correctly
- ✓ Form validation prevents invalid submissions
- ✓ File uploads are properly sanitized

---

## 📋 Implementation Checklist

### Backend (COMPLETED ✅)
- [x] Add CLIENT role to UserRole enum
- [x] Create QuestionnaireSubmission model
- [x] Create SubmissionAnswer model
- [x] Create UploadedFile model
- [x] Add user relationship to submissions
- [x] Create sanitization utilities
- [x] Create questionnaire tRPC router
- [x] Implement submit endpoint
- [x] Implement saveDraft endpoint
- [x] Implement getMySubmissions endpoint
- [x] Implement getAllSubmissions endpoint (admin)
- [x] Implement getStats endpoint (admin)
- [x] Register router in API root
- [x] Sync database schema

### Frontend (MOSTLY COMPLETED ✅)
- [x] Create client dashboard page
- [x] Create admin dashboard page
- [x] Copy questionnaire form components (all 10 components)
- [x] Create protected questionnaire route
- [x] Create QuestionnaireFlow orchestrator component
- [ ] Create submission detail pages (client & admin)
- [ ] Add navigation links
- [ ] Create file upload API route
- [ ] Add PDF export functionality

### Data & Configuration (COMPLETED ✅)
- [x] Create questionnaire questions data file (47 questions, 18 sections)
- [x] Create TypeScript type definitions
- [ ] Update navigation menus

### Testing & Documentation
- [ ] Write API tests
- [ ] Write component tests
- [ ] Update user documentation

---

## 🚀 Quick Start Guide

### For Clients (After Full Implementation)
1. Client logs in at `/login`
2. Navigate to "My Briefs" or go to `/dashboard/briefs`
3. Click "New Brief" button
4. Fill out questionnaire at `/questionnaire/project-brief`
5. Answers auto-save as drafts
6. Submit when complete
7. View submission at `/dashboard/briefs/[id]`

### For Admins
1. Admin logs in
2. Navigate to `/admin/submissions`
3. View statistics dashboard
4. Filter submissions (All / Completed / Drafts)
5. Click "View Details" on any submission
6. Review client responses at `/admin/submissions/[id]`
7. Export to PDF if needed

---

## 🔐 Security Features Implemented

1. **Authentication Required**
   - All questionnaire operations require valid session
   - Unauthenticated users redirected to login

2. **User Scoping**
   - Clients can ONLY access their own submissions
   - Database queries filtered by `userId`
   - Prevents horizontal privilege escalation

3. **Role-Based Access Control**
   - Admin-only endpoints use `adminProcedure`
   - Automatic 403 Forbidden for non-admin access

4. **Input Sanitization**
   - All text inputs stripped of HTML/scripts
   - Email validation
   - URL validation (only http/https)
   - File metadata sanitization

5. **Database Transactions**
   - Submissions use transactions for atomicity
   - Prevents partial/corrupted data

---

## 📊 Database Indexes

The following indexes have been added for performance:

```prisma
@@index([userId, isComplete])  // Fast user submissions lookup
@@index([questionnaireId])     // Filter by questionnaire type
@@index([createdAt])           // Sort by date
@@index([questionId])          // Answer lookups
@@index([section])             // Section-based queries
@@index([submissionId])        // File lookups
```

---

## 🔄 Next Steps

1. **Immediate Priority:**
   - Copy questionnaire form components from `questionnaire` app
   - Create submission detail pages
   - Add file upload handler

2. **Short Term:**
   - Create questionnaire questions data
   - Add navigation menu items
   - Implement PDF export

3. **Long Term:**
   - Add email notifications for new submissions
   - Add admin notes/comments feature
   - Implement submission analytics
   - Add questionnaire templates

---

## 📝 Migration Notes

This implementation merges the questionnaire functionality from the standalone `questionnaire` app into `kayanlive-main` with the following improvements:

1. **User Authentication:** Now links submissions to authenticated users
2. **Role-Based Access:** Separates client and admin views
3. **Better Security:** Enhanced input sanitization
4. **Improved UX:** Dashboard-based navigation
5. **Statistics:** Admin analytics dashboard

---

## 🛠️ Development Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Sync database with schema (development only)
npx prisma db push

# View database in Prisma Studio
npx prisma studio

# Run development server
npm run dev

# Run tests
npm run test
```

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify database schema is synced
4. Ensure user has correct role (CLIENT or ADMIN)
5. Check tRPC network requests in browser DevTools

---

**Status:** Backend complete ✅ | Dashboards complete ✅ | Questionnaire form complete ✅ | Detail pages pending 🚧

**Last Updated:** 2025-01-08
