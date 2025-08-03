const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send password reset email
const sendPasswordResetEmail = async (email, resetUrl, username = 'User') => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sendgrid.net',
      subject: 'Reset Your Password - Divias Wicka Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="color: #333; margin-bottom: 10px;">Divias Wicka Shop</h1>
            <h2 style="color: #666; margin-bottom: 20px;">Password Reset Request</h2>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 10px; margin-top: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
              Hi ${username},
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your Divias Wicka Shop account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
              Or copy and paste this link into your browser:
            </p>
            
            <p style="color: #007bff; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `
    };

    const response = await sgMail.send(msg);
    console.log('Password reset email sent via SendGrid:', response[0].statusCode);
    return { success: true, messageId: response[0].headers['x-message-id'] };
    
  } catch (error) {
    console.error('Error sending password reset email via SendGrid:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, username) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sendgrid.net',
      subject: 'Welcome to Divias Wicka Shop!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="color: #333; margin-bottom: 10px;">Divias Wicka Shop</h1>
            <h2 style="color: #666; margin-bottom: 20px;">Welcome to Our Community!</h2>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 10px; margin-top: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
              Hi ${username || 'there'}!
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining Divias Wicka Shop! We're excited to have you as part of our community.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Start Shopping
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              You can now:
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.6;">
              <li>Browse our collection of candles and accessories</li>
              <li>Save your favorite items</li>
              <li>Track your orders</li>
              <li>Update your profile information</li>
            </ul>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Welcome to the family! 🕯️
            </p>
          </div>
        </div>
      `
    };

    const response = await sgMail.send(msg);
    console.log('Welcome email sent via SendGrid:', response[0].statusCode);
    return { success: true, messageId: response[0].headers['x-message-id'] };
    
  } catch (error) {
    console.error('Error sending welcome email via SendGrid:', error);
    throw new Error('Failed to send welcome email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
}; 