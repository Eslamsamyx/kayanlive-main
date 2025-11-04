import { SESClient, SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { createTransport } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

// SES Client Configuration
const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Default sender email
const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@kayanlive.com';
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Kayan Live';

// Create nodemailer transport using SES
const transporter = createTransport({
  SES: { ses: sesClient, aws: { SendRawEmailCommand } },
} as any);

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Render email template with data
 */
const renderTemplate = (
  template: string,
  data: Record<string, any>
): string => {
  let rendered = template;
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value));
  });
  return rendered;
};

/**
 * Get email template by name
 */
export const getEmailTemplate = (
  templateName: string,
  data: Record<string, any>
): EmailTemplate => {
  const templates: Record<string, EmailTemplate> = {
    // Welcome email
    welcome: {
      subject: 'Welcome to Kayan Live - {{userName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Kayan Live!</h1>
          <p>Hi {{userName}},</p>
          <p>Thank you for joining Kayan Live. We're excited to have you on board!</p>
          <p>Your account has been successfully created.</p>
          <a href="{{dashboardUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Kayan Live Team</p>
        </div>
      `,
      text: 'Welcome to Kayan Live!\n\nHi {{userName}},\n\nThank you for joining Kayan Live. We\'re excited to have you on board!\n\nYour account has been successfully created.\n\nGo to Dashboard: {{dashboardUrl}}\n\nBest regards,\nThe Kayan Live Team',
    },

    // Project invitation (legacy)
    'project-invitation': {
      subject: 'You\'ve been invited to join {{projectName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Project Invitation</h1>
          <p>Hi {{userName}},</p>
          <p>{{inviterName}} has invited you to join the project:</p>
          <h2 style="color: #007bff;">{{projectName}}</h2>
          <p>{{projectDescription}}</p>
          <a href="{{projectUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Project</a>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Kayan Live Team</p>
        </div>
      `,
      text: 'Project Invitation\n\nHi {{userName}},\n\n{{inviterName}} has invited you to join the project:\n\n{{projectName}}\n\n{{projectDescription}}\n\nView Project: {{projectUrl}}\n\nBest regards,\nThe Kayan Live Team',
    },

    // Invitation system (token-based)
    invitation: {
      subject: 'You\'ve been invited to join {{projectName}} at {{companyName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Project Invitation</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              <strong>{{inviterName}}</strong> has invited you to collaborate on a project at <strong>{{companyName}}</strong>.
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 22px;">{{projectName}}</h2>
              <p style="color: #666; margin: 0; line-height: 1.6;">{{projectDescription}}</p>
              <p style="margin: 15px 0 5px 0; color: #888; font-size: 14px;">
                <strong>Your role:</strong> <span style="display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">{{role}}</span>
              </p>
            </div>

            {{#if hasMessage}}
            <div style="background: #fffbf0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0; font-style: italic;">"{{message}}"</p>
            </div>
            {{/if}}

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{acceptUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">Accept Invitation</a>
            </div>

            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
              This invitation will expire in <strong>{{expiresInHours}} hours</strong>.
            </p>

            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>Note:</strong> You must be logged in with the email address this invitation was sent to in order to accept it.
                If you don't have an account yet, you'll be able to create one.
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2025 Kayan Live. All rights reserved.</p>
          </div>
        </div>
      `,
      text: 'Project Invitation\n\n{{inviterName}} has invited you to collaborate on a project at {{companyName}}.\n\nProject: {{projectName}}\n{{projectDescription}}\n\nYour role: {{role}}\n\n{{#if hasMessage}}Message from {{inviterName}}:\n"{{message}}"{{/if}}\n\nAccept Invitation: {{acceptUrl}}\n\nThis invitation will expire in {{expiresInHours}} hours.\n\nNote: You must be logged in with the email address this invitation was sent to in order to accept it.\n\nBest regards,\nThe Kayan Live Team',
    },

    // Task assignment
    'task-assignment': {
      subject: 'New Task Assigned: {{taskName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Task Assignment</h1>
          <p>Hi {{userName}},</p>
          <p>You have been assigned a new task:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0; color: #007bff;">{{taskName}}</h3>
            <p style="margin: 10px 0 0 0;">{{taskDescription}}</p>
            <p style="margin: 10px 0 0 0; color: #666;"><strong>Due Date:</strong> {{dueDate}}</p>
            <p style="margin: 10px 0 0 0; color: #666;"><strong>Priority:</strong> {{priority}}</p>
          </div>
          <a href="{{taskUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Task</a>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Kayan Live Team</p>
        </div>
      `,
      text: 'New Task Assignment\n\nHi {{userName}},\n\nYou have been assigned a new task:\n\n{{taskName}}\n\n{{taskDescription}}\n\nDue Date: {{dueDate}}\nPriority: {{priority}}\n\nView Task: {{taskUrl}}\n\nBest regards,\nThe Kayan Live Team',
    },

    // Asset share notification
    'asset-shared': {
      subject: '{{sharerName}} shared an asset with you',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Asset Shared</h1>
          <p>Hi,</p>
          <p>{{sharerName}} has shared an asset with you:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0; color: #007bff;">{{assetName}}</h3>
            {{#if message}}
            <p style="margin: 10px 0 0 0; font-style: italic;">"{{message}}"</p>
            {{/if}}
          </div>
          {{#if password}}
          <p><strong>Password:</strong> {{password}}</p>
          {{/if}}
          {{#if expiresAt}}
          <p style="color: #666;"><em>This link expires on {{expiresAt}}</em></p>
          {{/if}}
          <a href="{{shareUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Asset</a>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Kayan Live Team</p>
        </div>
      `,
      text: 'Asset Shared\n\nHi,\n\n{{sharerName}} has shared an asset with you:\n\n{{assetName}}\n\n{{#if message}}"{{message}}"{{/if}}\n\n{{#if password}}Password: {{password}}{{/if}}\n\n{{#if expiresAt}}This link expires on {{expiresAt}}{{/if}}\n\nView Asset: {{shareUrl}}\n\nBest regards,\nThe Kayan Live Team',
    },

    // Lead notification
    'lead-created': {
      subject: 'New Lead: {{leadName}} from {{exhibitionName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Lead Created</h1>
          <p>Hi {{userName}},</p>
          <p>A new lead has been created from {{exhibitionName}}:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0; color: #007bff;">{{leadName}}</h3>
            <p style="margin: 10px 0 0 0;"><strong>Contact:</strong> {{contactName}}</p>
            <p style="margin: 5px 0 0 0;"><strong>Email:</strong> {{contactEmail}}</p>
            <p style="margin: 5px 0 0 0;"><strong>Quality Score:</strong> {{qualityScore}}/100</p>
            {{#if specialRequirements}}
            <p style="margin: 10px 0 0 0;"><strong>Requirements:</strong> {{specialRequirements}}</p>
            {{/if}}
          </div>
          <a href="{{leadUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Lead</a>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Kayan Live Team</p>
        </div>
      `,
      text: 'New Lead Created\n\nHi {{userName}},\n\nA new lead has been created from {{exhibitionName}}:\n\n{{leadName}}\n\nContact: {{contactName}}\nEmail: {{contactEmail}}\nQuality Score: {{qualityScore}}/100\n\n{{#if specialRequirements}}Requirements: {{specialRequirements}}{{/if}}\n\nView Lead: {{leadUrl}}\n\nBest regards,\nThe Kayan Live Team',
    },

    // Meeting reminder
    'meeting-reminder': {
      subject: 'Meeting Reminder: {{meetingTitle}} - {{startTime}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Meeting Reminder</h1>
          <p>Hi {{userName}},</p>
          <p>This is a reminder for your upcoming meeting:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0; color: #007bff;">{{meetingTitle}}</h3>
            <p style="margin: 10px 0 0 0;"><strong>Time:</strong> {{startTime}} - {{endTime}}</p>
            <p style="margin: 5px 0 0 0;"><strong>Location:</strong> {{location}}</p>
            {{#if meetingLink}}
            <p style="margin: 5px 0 0 0;"><strong>Join:</strong> <a href="{{meetingLink}}">{{meetingLink}}</a></p>
            {{/if}}
            {{#if agenda}}
            <p style="margin: 10px 0 0 0;"><strong>Agenda:</strong> {{agenda}}</p>
            {{/if}}
          </div>
          <a href="{{meetingUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Meeting Details</a>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Kayan Live Team</p>
        </div>
      `,
      text: 'Meeting Reminder\n\nHi {{userName}},\n\nThis is a reminder for your upcoming meeting:\n\n{{meetingTitle}}\n\nTime: {{startTime}} - {{endTime}}\nLocation: {{location}}\n\n{{#if meetingLink}}Join: {{meetingLink}}{{/if}}\n\n{{#if agenda}}Agenda: {{agenda}}{{/if}}\n\nView Meeting Details: {{meetingUrl}}\n\nBest regards,\nThe Kayan Live Team',
    },

    // Password reset
    'password-reset': {
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset</h1>
          <p>Hi {{userName}},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="{{resetUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666;">This link will expire in {{expiryHours}} hours.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Kayan Live Team</p>
        </div>
      `,
      text: 'Password Reset\n\nHi {{userName}},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n{{resetUrl}}\n\nThis link will expire in {{expiryHours}} hours.\n\nIf you didn\'t request this, please ignore this email.\n\nBest regards,\nThe Kayan Live Team',
    },

    // Milestone submitted for review
    'milestone-submitted': {
      subject: 'Milestone Ready for Review: {{milestoneName}} - {{projectName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #7afdd6 0%, #6ee8c5 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #2c2c2b; margin: 0; font-size: 28px;">Milestone Ready for Your Review</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi {{clientName}},
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Great news! The team has completed a milestone on your project and it's ready for your review.
            </p>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7afdd6;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 22px;">{{milestoneName}}</h2>
              <p style="color: #666; margin: 0 0 15px 0; line-height: 1.6;">{{projectName}}</p>
              <div style="background: #e8f9f4; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0; color: #2c2c2b;"><strong>Progress:</strong> {{progress}}% Complete</p>
                <p style="margin: 10px 0 0 0; color: #2c2c2b;"><strong>Deliverables:</strong> {{deliverableCount}} items</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{reviewUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #7afdd6 0%, #6ee8c5 100%); color: #2c2c2b; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">Review Milestone</a>
            </div>

            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>What's Next?</strong> Please review the delivered work and let us know if everything meets your expectations or if you'd like any changes.
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2025 Kayan Live. All rights reserved.</p>
          </div>
        </div>
      `,
      text: 'Milestone Ready for Your Review\n\nHi {{clientName}},\n\nGreat news! The team has completed a milestone on your project and it\'s ready for your review.\n\nMilestone: {{milestoneName}}\nProject: {{projectName}}\nProgress: {{progress}}% Complete\nDeliverables: {{deliverableCount}} items\n\nReview Milestone: {{reviewUrl}}\n\nWhat\'s Next? Please review the delivered work and let us know if everything meets your expectations or if you\'d like any changes.\n\nBest regards,\nThe Kayan Live Team',
    },

    // Milestone approved
    'milestone-approved': {
      subject: 'Milestone Approved: {{milestoneName}} ✓',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✓ Milestone Approved!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi {{clientName}},
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Thank you for approving the milestone! We're excited to move forward with your project.
            </p>

            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4ade80;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 22px;">{{milestoneName}}</h2>
              <p style="color: #666; margin: 0; line-height: 1.6;">Status: <strong style="color: #22c55e;">Approved</strong></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{projectUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #7afdd6 0%, #6ee8c5 100%); color: #2c2c2b; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">View Project</a>
            </div>

            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>What's Next?</strong> Our team is now working on the next phase of your project. You'll be notified when the next milestone is ready for review.
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2025 Kayan Live. All rights reserved.</p>
          </div>
        </div>
      `,
      text: 'Milestone Approved!\n\nHi {{clientName}},\n\nThank you for approving the milestone! We\'re excited to move forward with your project.\n\nMilestone: {{milestoneName}}\nStatus: Approved\n\nView Project: {{projectUrl}}\n\nWhat\'s Next? Our team is now working on the next phase of your project. You\'ll be notified when the next milestone is ready for review.\n\nBest regards,\nThe Kayan Live Team',
    },

    // Milestone needs revision
    'milestone-revision': {
      subject: 'Revision Request Received: {{milestoneName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Revision Request Received</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi {{clientName}},
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Thank you for your feedback! We've received your revision request and our team will work on the updates right away.
            </p>

            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fb923c;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 22px;">{{milestoneName}}</h2>
              <p style="color: #666; margin: 0 0 15px 0;">Status: <strong style="color: #f97316;">Revision Requested</strong></p>
              <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0; color: #666; font-size: 14px;"><strong>Your Feedback:</strong></p>
                <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6; font-style: italic;">"{{feedback}}"</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{projectUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #7afdd6 0%, #6ee8c5 100%); color: #2c2c2b; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">View Project</a>
            </div>

            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>What's Next?</strong> Our team will address your feedback and resubmit the milestone for your review. You'll receive a notification once the updates are ready.
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2025 Kayan Live. All rights reserved.</p>
          </div>
        </div>
      `,
      text: 'Revision Request Received\n\nHi {{clientName}},\n\nThank you for your feedback! We\'ve received your revision request and our team will work on the updates right away.\n\nMilestone: {{milestoneName}}\nStatus: Revision Requested\n\nYour Feedback:\n"{{feedback}}"\n\nView Project: {{projectUrl}}\n\nWhat\'s Next? Our team will address your feedback and resubmit the milestone for your review. You\'ll receive a notification once the updates are ready.\n\nBest regards,\nThe Kayan Live Team',
    },

    // New deliverable uploaded
    'deliverable-uploaded': {
      subject: 'New Deliverable: {{assetName}} - {{projectName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📦 New Deliverable Available</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi {{clientName}},
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              A new deliverable has been uploaded to your project!
            </p>

            <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a78bfa;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 22px;">{{assetName}}</h2>
              <p style="color: #666; margin: 0 0 15px 0;">Project: {{projectName}}</p>
              <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0; color: #666;"><strong>Type:</strong> {{assetType}}</p>
                <p style="margin: 10px 0 0 0; color: #666;"><strong>Size:</strong> {{fileSize}}</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{assetUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #7afdd6 0%, #6ee8c5 100%); color: #2c2c2b; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-right: 10px;">View Deliverable</a>
            </div>

            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>Need Changes?</strong> You can leave comments and feedback directly on the asset page.
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2025 Kayan Live. All rights reserved.</p>
          </div>
        </div>
      `,
      text: 'New Deliverable Available\n\nHi {{clientName}},\n\nA new deliverable has been uploaded to your project!\n\nAsset: {{assetName}}\nProject: {{projectName}}\nType: {{assetType}}\nSize: {{fileSize}}\n\nView Deliverable: {{assetUrl}}\n\nNeed Changes? You can leave comments and feedback directly on the asset page.\n\nBest regards,\nThe Kayan Live Team',
    },

    // Project status update
    'project-status-update': {
      subject: 'Project Update: {{projectName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Project Progress Update</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi {{clientName}},
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Here's an update on your project progress:
            </p>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 22px;">{{projectName}}</h2>
              <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0; color: #666;"><strong>Overall Progress:</strong> {{overallProgress}}%</p>
                <p style="margin: 10px 0 0 0; color: #666;"><strong>Completed Milestones:</strong> {{completedMilestones}}/{{totalMilestones}}</p>
                <p style="margin: 10px 0 0 0; color: #666;"><strong>Status:</strong> {{status}}</p>
              </div>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;"><strong>Recent Updates:</strong></p>
              <p style="color: #666; margin: 0; line-height: 1.6;">{{updateMessage}}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{projectUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #7afdd6 0%, #6ee8c5 100%); color: #2c2c2b; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">View Full Details</a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2025 Kayan Live. All rights reserved.</p>
          </div>
        </div>
      `,
      text: 'Project Progress Update\n\nHi {{clientName}},\n\nHere\'s an update on your project progress:\n\nProject: {{projectName}}\nOverall Progress: {{overallProgress}}%\nCompleted Milestones: {{completedMilestones}}/{{totalMilestones}}\nStatus: {{status}}\n\nRecent Updates:\n{{updateMessage}}\n\nView Full Details: {{projectUrl}}\n\nBest regards,\nThe Kayan Live Team',
    },

    // Generic notification
    notification: {
      subject: '{{subject}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">{{title}}</h1>
          <p>Hi {{userName}},</p>
          <div style="margin: 20px 0;">
            {{body}}
          </div>
          {{#if actionUrl}}
          <a href="{{actionUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">{{actionText}}</a>
          {{/if}}
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Kayan Live Team</p>
        </div>
      `,
      text: '{{title}}\n\nHi {{userName}},\n\n{{body}}\n\n{{#if actionUrl}}{{actionText}}: {{actionUrl}}{{/if}}\n\nBest regards,\nThe Kayan Live Team',
    },
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  return {
    subject: renderTemplate(template.subject, data),
    html: renderTemplate(template.html, data),
    text: renderTemplate(template.text, data),
  };
};

// =============================================================================
// SEND EMAIL FUNCTIONS
// =============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send email using AWS SES via nodemailer
 */
export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const {
    to,
    subject,
    html,
    text,
    from = DEFAULT_FROM,
    fromName = DEFAULT_FROM_NAME,
    replyTo,
    cc,
    bcc,
    attachments,
  } = options;

  try {
    const mailOptions: Mail.Options = {
      from: fromName ? `"${fromName}" <${from}>` : from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      replyTo,
      cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Send email using template
 */
export interface SendTemplateEmailOptions {
  to: string | string[];
  template: string;
  data: Record<string, any>;
  from?: string;
  fromName?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export const sendTemplateEmail = async (
  options: SendTemplateEmailOptions
): Promise<void> => {
  const { template: templateName, data, ...emailOptions } = options;

  const template = getEmailTemplate(templateName, data);

  await sendEmail({
    ...emailOptions,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

/**
 * Send bulk emails (rate limited)
 */
export const sendBulkEmails = async (
  emails: SendEmailOptions[],
  delayMs = 100 // Delay between emails to respect SES rate limits
): Promise<{ sent: number; failed: number; errors: Error[] }> => {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as Error[],
  };

  for (const email of emails) {
    try {
      await sendEmail(email);
      results.sent++;

      // Add delay to respect SES rate limits (default 14 emails/sec)
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.failed++;
      results.errors.push(error as Error);
      console.error('Failed to send bulk email:', error);
    }
  }

  return results;
};

/**
 * Verify email address with SES
 */
export const verifyEmailAddress = async (email: string): Promise<void> => {
  // Note: This is for SES sandbox mode. In production, verify domain instead.
  try {
    const command = new SendEmailCommand({
      Source: DEFAULT_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Verify your email address',
        },
        Body: {
          Text: {
            Data: 'Please verify your email address to receive emails from Kayan Live.',
          },
        },
      },
    });

    await sesClient.send(command);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

// =============================================================================
// EMAIL VALIDATION
// =============================================================================

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate multiple email addresses
 */
export const validateEmails = (
  emails: string[]
): { valid: string[]; invalid: string[] } => {
  const valid: string[] = [];
  const invalid: string[] = [];

  emails.forEach((email) => {
    if (isValidEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  });

  return { valid, invalid };
};

// =============================================================================
// TESTING & DEVELOPMENT
// =============================================================================

/**
 * Send test email (for development)
 */
export const sendTestEmail = async (to: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Test Email from Kayan Live',
    html: '<h1>Test Email</h1><p>This is a test email from Kayan Live.</p>',
    text: 'Test Email\n\nThis is a test email from Kayan Live.',
  });
};
