import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${config.frontendUrl}/verify-email/${token}`;
  
  const mailOptions = {
    from: `"CollegeAnon" <${config.email.from}>`,
    to: email,
    subject: 'Verify Your CollegeAnon Account',
    html: `
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset password token
 */
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"CollegeAnon" <${config.email.from}>`,
    to: email,
    subject: 'Reset Your CollegeAnon Password',
    html: `
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
  } catch (error) {
    console.error('Email server configuration error:', error);
    throw error;
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  verifyEmailConfig,
};

