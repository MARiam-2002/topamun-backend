import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email configuration missing, skipping email send');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    const emailInfo = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Topamun Platform" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
      attachments,
    });

    console.log('✅ Email sent successfully:', emailInfo.messageId);
    return emailInfo.accepted.length >= 1;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Log specific error types for debugging
    if (error.code === 'EAUTH') {
      console.error('   - Authentication failed. Check EMAIL and EMAIL_PASSWORD');
    } else if (error.code === 'ECONNECTION') {
      console.error('   - Connection failed. Check internet connection');
    } else if (error.code === 'EMESSAGE') {
      console.error('   - Message format error. Check email content');
    }
    
    return false;
  }
};
