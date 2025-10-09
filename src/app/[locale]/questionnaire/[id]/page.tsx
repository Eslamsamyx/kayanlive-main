'use client';

import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { QuestionnaireFlow } from '@/components/questionnaire/QuestionnaireFlow';

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const questionnaireId = params.id as string;

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    const locale = params.locale as string || 'en';
    redirect(`/${locale}/login?callbackUrl=${encodeURIComponent(`/${locale}/questionnaire/${questionnaireId}`)}`);
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#2c2c2b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Render questionnaire for authenticated users
  return <QuestionnaireFlow questionnaireId={questionnaireId} />;
}
