const nodemailer = require("nodemailer");

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Hoặc SendGrid, Mailgun, v.v.
  auth: {
    user: process.env.EMAIL_USER, // Trong .env
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng
  },
});

// Hàm gửi email cho giảng viên
const sendTeacherCredentials = async ({ email, fullName, password }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Teacher Account Credentials",
      html: `
        <h2>Welcome, ${fullName}!</h2>
        <p>Your teacher account has been created successfully.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>For security, we recommend changing your password after logging in.</p>
        <p>Best regards,<br>Your Platform Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { sendTeacherCredentials };