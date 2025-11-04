import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMilestoneProgress(milestoneId: string) {
  // Get all tasks for this milestone
  const tasks = await prisma.task.findMany({
    where: { milestoneId },
    select: { status: true },
  });

  console.log(`Milestone ${milestoneId}: ${tasks.length} tasks found`);
  console.log('Task statuses:', tasks.map(t => t.status));

  if (tasks.length === 0) {
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { progress: 0 },
    });
    console.log('No tasks, set progress to 0');
    return;
  }

  // Count completed and approved tasks
  const completedCount = tasks.filter(
    (task) => task.status === TaskStatus.COMPLETED || task.status === TaskStatus.APPROVED
  ).length;

  console.log(`Completed/Approved tasks: ${completedCount}`);

  // Calculate progress percentage
  const progress = Math.round((completedCount / tasks.length) * 100);
  console.log(`Calculated progress: ${progress}%`);

  // Update milestone progress
  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { progress },
  });

  console.log(`✅ Updated milestone progress to ${progress}%\n`);
}

async function main() {
  console.log('🔄 Fixing milestone progress...\n');

  // Get all milestones
  const milestones = await prisma.milestone.findMany({
    select: { id: true, name: true, progress: true },
  });

  console.log(`Found ${milestones.length} milestones\n`);

  for (const milestone of milestones) {
    console.log(`Processing: ${milestone.name} (current progress: ${milestone.progress}%)`);
    await updateMilestoneProgress(milestone.id);
  }

  console.log('🎉 All milestone progress updated!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
