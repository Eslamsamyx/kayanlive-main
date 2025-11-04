import { PrismaClient, NotificationType, type Task, type Milestone, type User, type TaskStatus } from '@prisma/client';

export class NotificationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create notification for task assignment
   */
  async createTaskAssignedNotification(
    userId: string,
    task: Task & { project: { id: string; name: string } },
    assignedBy: User
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assigned',
        message: `${assignedBy.name || assignedBy.email} assigned you to task: ${task.name}`,
        projectId: task.project.id,
        taskId: task.id,
        data: {
          taskName: task.name,
          projectName: task.project.name,
          assignedBy: assignedBy.name || assignedBy.email,
        },
      },
    });
  }

  /**
   * Create notification for task status change
   */
  async createTaskStatusChangeNotification(
    task: Task & { assignees: User[]; project: { id: string; name: string } },
    oldStatus: TaskStatus,
    newStatus: TaskStatus,
    changedBy: User
  ) {
    // Notify all assignees except the one who made the change
    const notifications = task.assignees
      .filter((assignee) => assignee.id !== changedBy.id)
      .map((assignee) =>
        this.prisma.notification.create({
          data: {
            userId: assignee.id,
            type: NotificationType.TASK_STATUS_CHANGED,
            title: 'Task Status Updated',
            message: `${changedBy.name || changedBy.email} changed task "${task.name}" from ${oldStatus} to ${newStatus}`,
            projectId: task.project.id,
            taskId: task.id,
            data: {
              taskName: task.name,
              oldStatus,
              newStatus,
              changedBy: changedBy.name || changedBy.email,
            },
          },
        })
      );

    return Promise.all(notifications);
  }

  /**
   * Create notification for task comment
   */
  async createTaskCommentNotification(
    task: Task & { assignees: User[]; project: { id: string } },
    comment: string,
    commentedBy: User
  ) {
    // Notify all assignees except the commenter
    const notifications = task.assignees
      .filter((assignee) => assignee.id !== commentedBy.id)
      .map((assignee) =>
        this.prisma.notification.create({
          data: {
            userId: assignee.id,
            type: NotificationType.TASK_COMMENT_ADDED,
            title: 'New Comment on Task',
            message: `${commentedBy.name || commentedBy.email} commented on "${task.name}"`,
            projectId: task.project.id,
            taskId: task.id,
            data: {
              taskName: task.name,
              comment: comment.substring(0, 100),
              commentedBy: commentedBy.name || commentedBy.email,
            },
          },
        })
      );

    return Promise.all(notifications);
  }

  /**
   * Create notification for milestone approval
   */
  async createMilestoneApprovedNotification(
    milestone: Milestone & { project: { id: string; name: string; createdBy: string } },
    approvedBy: User
  ) {
    return this.prisma.notification.create({
      data: {
        userId: milestone.project.createdBy,
        type: NotificationType.MILESTONE_APPROVED,
        title: 'Milestone Approved',
        message: `${approvedBy.name || approvedBy.email} approved milestone: ${milestone.name}`,
        projectId: milestone.project.id,
        milestoneId: milestone.id,
        data: {
          milestoneName: milestone.name,
          approvedBy: approvedBy.name || approvedBy.email,
        },
      },
    });
  }

  /**
   * Create notification for milestone sign-off
   */
  async createMilestoneSignedOffNotification(
    milestone: Milestone & { project: { id: string; name: string } },
    signedOffBy: User,
    clientUserId: string
  ) {
    return this.prisma.notification.create({
      data: {
        userId: clientUserId,
        type: NotificationType.MILESTONE_SIGNED_OFF,
        title: 'Milestone Ready for Review',
        message: `${signedOffBy.name || signedOffBy.email} has signed off on milestone: ${milestone.name}. Please review.`,
        projectId: milestone.project.id,
        milestoneId: milestone.id,
        data: {
          milestoneName: milestone.name,
          signedOffBy: signedOffBy.name || signedOffBy.email,
        },
      },
    });
  }

  /**
   * Create notification for meeting
   */
  async createMeetingNotification(
    userIds: string[],
    meeting: { id: string; title: string; startTime: Date },
    projectId: string | null,
    type: 'SCHEDULED' | 'UPDATED'
  ) {
    const notificationType =
      type === 'SCHEDULED'
        ? NotificationType.MEETING_SCHEDULED
        : NotificationType.MEETING_UPDATED;

    const notifications = userIds.map((userId) =>
      this.prisma.notification.create({
        data: {
          userId,
          type: notificationType,
          title: type === 'SCHEDULED' ? 'Meeting Scheduled' : 'Meeting Updated',
          message: `Meeting "${meeting.title}" ${type === 'SCHEDULED' ? 'scheduled' : 'updated'} for ${meeting.startTime.toLocaleString()}`,
          projectId,
          meetingId: meeting.id,
          data: {
            meetingTitle: meeting.title,
            startTime: meeting.startTime.toISOString(),
          },
        },
      })
    );

    return Promise.all(notifications);
  }

  /**
   * Create notification for asset download request
   */
  async createDownloadRequestNotification(
    adminUserIds: string[],
    request: {
      id: string;
      user: { name: string | null; email: string };
      asset: { name: string; id: string };
    },
    type: 'REQUESTED' | 'APPROVED' | 'REJECTED'
  ) {
    let notificationType: NotificationType;
    let title: string;
    let message: string;

    switch (type) {
      case 'REQUESTED':
        notificationType = NotificationType.ASSET_DOWNLOAD_REQUESTED;
        title = 'Download Request Received';
        message = `${request.user.name || request.user.email} requested to download "${request.asset.name}"`;
        break;
      case 'APPROVED':
        notificationType = NotificationType.ASSET_DOWNLOAD_APPROVED;
        title = 'Download Request Approved';
        message = `Your download request for "${request.asset.name}" has been approved`;
        break;
      case 'REJECTED':
        notificationType = NotificationType.ASSET_DOWNLOAD_REJECTED;
        title = 'Download Request Rejected';
        message = `Your download request for "${request.asset.name}" has been rejected`;
        break;
    }

    const notifications = adminUserIds.map((userId) =>
      this.prisma.notification.create({
        data: {
          userId,
          type: notificationType,
          title,
          message,
          data: {
            requestId: request.id,
            assetName: request.asset.name,
            assetId: request.asset.id,
          },
        },
      })
    );

    return Promise.all(notifications);
  }
}
