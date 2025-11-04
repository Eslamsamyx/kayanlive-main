import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ApprovalsTab } from '@/components/approvals/ApprovalsTab';

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pending Approvals</h1>
        <p className="text-[#b2b2b2]">
          Review and approve milestones that are ready for your feedback
        </p>
      </div>

      <ApprovalsTab />
    </div>
  );
}
