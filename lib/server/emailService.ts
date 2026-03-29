import nodemailer, { Transporter } from 'nodemailer';

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER as string, 
    pass: process.env.EMAIL_PASS as string,
  }
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(email: string, otp: string): Promise<boolean> {

  const mailOptions = {
    from: `"Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification OTP',
    text: `Your OTP for email verification is: ${otp}`,
    html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  tempPassword: string
): Promise<boolean> {
  const mailOptions = {
    from: `"ReimbursePro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Temporary Password - ReimbursePro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hello ${name},</h2>
        <p style="color: #666;">An admin has generated a temporary password for your account. Please use the credentials below to sign in and create a new password.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0; color: #333;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0; color: #333;"><strong>Temporary Password:</strong> <code style="background-color: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-weight: bold;">${tempPassword}</code></p>
        </div>
        
        <p style="color: #666;">
          <strong>Important:</strong> This temporary password will expire in 24 hours. Please change it immediately after signing in.
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this password reset, please contact your administrator immediately.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
