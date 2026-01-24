import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

// Gmail SMTP configuration for AWS deployment
// Note: Gmail requires App Password, not regular password
const gmailUser = config.email.user;
const gmailAppPassword = config.email.pass;
const gmailFrom = config.email.from || 'noreply@gmail.com';

// Create Gmail transporter using App Password
const gmailTransporter = gmailUser && gmailAppPassword ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailAppPassword
  }
}) : null;

/**
 * Send email via Gmail
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML body
 */
const sendViaGmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"CollegeAnon" <${gmailFrom}>`,
    to: to,
    subject: subject,
    html: html
  };

  return await gmailTransporter.sendMail(mailOptions);
};

/**
 * Send verification email using Gmail
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${config.frontendUrl}/verify-email/${token}`;
  
  // Use Gmail if configured
  if (gmailTransporter) {
    await sendViaGmail(
      email,
      'Verify Your CollegeAnon Account',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to CollegeAnon!</h2>
          <p>Thank you for registering. Please verify your email address to activate your account.</p>
          <p style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #4F46E5;">${verificationUrl}</a>
          </p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This verification link will expire in 24 hours.<br>
            If you didn't register for CollegeAnon, please ignore this email.
          </p>
        </div>
      `
    );
    console.log(`Verification email sent via Gmail to ${email}`);
    return;
  }
  
  console.warn('Gmail not configured. Skipping email send.');
  return { messageId: null };
};

/**
 * Send password reset email using Gmail
 * @param {string} email - Recipient email
 * @param {string} token - Reset password token
 */
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;
  
  // Use Gmail if configured
  if (gmailTransporter) {
    await sendViaGmail(
      email,
      'Reset Your CollegeAnon Password',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to create a new password.</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
          </p>
          <p style="color: #DC2626; font-size: 14px; margin-top: 20px;">
            <strong>Security Note:</strong> If you didn't request this password reset, 
            please ignore this email and your password will remain unchanged.
          </p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This reset link will expire in 1 hour.
          </p>
        </div>
      `
    );
    console.log(`Password reset email sent via Gmail to ${email}`);
    return;
  }
  
  console.warn('Gmail not configured. Skipping email send.');
  return { messageId: null };
};

/**
 * Send post moderation notification email
 * @param {string} email - Recipient email
 * @param {string} postTitle - Title of the post
 * @param {string} status - 'pending' or 'approved' or 'rejected'
 * @param {string} reason - Optional reason for rejection
 */
export const sendPostModerationEmail = async (email, postTitle, status, reason = '') => {
  let subject, statusText, statusColor, description;

  if (status === 'pending') {
    subject = 'Your Post is Pending Admin Approval';
    statusText = 'Pending Approval';
    statusColor = '#F59E0B'; // Amber
    description = `Your post "<strong>${postTitle}</strong>" has been submitted and is waiting for admin approval. It will be visible on the feed once an admin reviews and approves it.`;
  } else if (status === 'approved') {
    subject = 'Your Post Has Been Approved';
    statusText = 'Approved';
    statusColor = '#10B981'; // Green
    description = `Great news! Your post "<strong>${postTitle}</strong>" has been approved by our admin team and is now visible on the feed.`;
  } else if (status === 'rejected') {
    subject = 'Your Post Has Been Rejected';
    statusText = 'Rejected';
    statusColor = '#EF4444'; // Red
    description = `Your post "<strong>${postTitle}</strong>" has been reviewed and unfortunately did not meet our community guidelines.`;
    if (reason) {
      reason = `<p style="margin-top: 15px; padding: 10px; background-color: #FEE2E2; border-radius: 6px; color: #B91C1C;"><strong>Reason:</strong> ${reason}</p>`;
    }
  }

  // Use Gmail if configured
  if (gmailTransporter) {
    await sendViaGmail(
      email,
      subject,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Post Moderation Update</h2>
          <div style="background-color: ${statusColor}15; border: 1px solid ${statusColor}; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: ${statusColor}; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
              ${statusText}
            </p>
            <p style="color: #374151; margin: 0;">${description}</p>
            ${reason || ''}
          </div>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            If you have any questions about this decision, please contact our support team.
          </p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
            This is an automated message from CollegeAnon.<br>
            Please do not reply directly to this email.
          </p>
        </div>
      `
    );
    console.log(`Post moderation email (${status}) sent via Gmail to ${email}`);
    return;
  }

  console.warn('Gmail not configured. Skipping email send.');
  return { messageId: null };
};

/**
 * Send payment confirmation email to admin
 * @param {Object} params - Payment details
 * @param {string} params.to - Admin email
 * @param {string} params.userName - User's display name
 * @param {string} params.userEmail - User's email
 * @param {string} params.userAnonId - User's anon ID
 * @param {string} params.userCollege - User's college
 * @param {string} params.planId - Plan ID
 * @param {string} params.planName - Plan name
 * @param {string} params.amount - Payment amount
 * @param {string} params.screenshotUrl - Payment screenshot URL
 */
export const sendPaymentConfirmationEmail = async ({ to, userName, userEmail, userAnonId, userCollege, planId, planName, amount, screenshotUrl }) => {
  // Use Gmail if configured
  if (gmailTransporter) {
    await sendViaGmail(
      to,
      `New Premium Payment Submission - ${userName} (${planName})`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Premium Payment Submission</h2>
          
          <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1F2937;">User Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 5px 0;"><strong>Anon ID:</strong> ${userAnonId}</p>
            <p style="margin: 5px 0;"><strong>College:</strong> ${userCollege || 'Not specified'}</p>
          </div>
          
          <div style="background-color: #D1FAE5; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #10B981;">
            <h3 style="margin: 0 0 15px 0; color: #065F46;">Plan Details</h3>
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount}</p>
            <p style="margin: 5px 0;"><strong>Plan ID:</strong> ${planId}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p style="margin-bottom: 10px;"><strong>Payment Screenshot:</strong></p>
            <a href="${screenshotUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              View Payment Screenshot
            </a>
          </div>
          
          <div style="background-color: #FEF3C7; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #F59E0B;">
            <p style="margin: 0; color: #92400E;">
              <strong>Action Required:</strong> Please review this payment and grant premium access to the user if the payment is verified.
            </p>
          </div>
          
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
            This is an automated message from CollegeAnon.<br>
            Please do not reply directly to this email.
          </p>
        </div>
      `
    );
    console.log(`Payment confirmation email sent via Gmail to ${to}`);
    return;
  }

  console.warn('Gmail not configured. Skipping email send.');
  return { messageId: null };
};

