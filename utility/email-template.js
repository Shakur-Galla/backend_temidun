//utility/email-template.js
export const generateEmailTemplate = ({ fullName, accessCode, signUpUrl }) => `
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <tr>
            <td align="center" style="padding-bottom: 20px;">
                <h2 style="color: #333;">Welcome to Temidun</h2>
                <p style="color: #555;">Stay Connected. Stay Accountable.</p>
            </td>
        </tr>
        <tr>
            <td>
                <p style="color: #333; font-size: 16px;">Hello,</p>
                <p style="color: #333; font-size: 16px;">
                    <strong>${fullName}</strong> has invited you to join <strong>Temidun</strong>, a daily activity accountability platform.
                </p>
                <p style="color: #333; font-size: 16px;">Invitation code expires after 1 hour</p>
                <p style="color: #333; font-size: 16px;">Please use the invitation code below to sign up:</p>
                <h3 style="color: #4CAF50; text-align: center; font-size: 24px; letter-spacing: 2px;">${accessCode}</h3>
                <p style="color: #333; font-size: 16px;">Click the button below to get started:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${signUpUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">Join Temidun</a>
                </div>
                <p style="color: #999; font-size: 14px;">If you did not expect this email, you can safely ignore it.</p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 20px; font-size: 12px; color: #aaa;">
                Temidun • Stay Connected. Stay Accountable.
            </td>
        </tr>
    </table>
</body>
`;


export const reportSubmittedTemplate = ({ reporterName, submissionDate }) => `
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; padding: 40px 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-top: 50px; margin-bottom: 50px;">
        <tr>
            <td align="center" style="padding-bottom: 30px;">
                <h2 style="color: #333; margin: 0; font-size: 24px;">New Report Submitted</h2>
                <p style="color: #555; margin: 5px 0 0 0; font-size: 14px;">Temidun • Stay Connected. Stay Accountable.</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 0;">
                <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">Hello,</p>
                <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">
                    <strong>${reporterName}</strong> has submitted a new daily activity report on <strong>${submissionDate}</strong>.
                </p>
                <p style="color: #333; font-size: 16px; margin: 0 0 30px 0;">Please log in to your dashboard to review the report.</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="/" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">Go to Dashboard</a>
                </div>
                <p style="color: #999; font-size: 14px; margin: 30px 0 0 0;">If you did not expect this email, you can safely ignore it.</p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px; font-size: 12px; color: #aaa;">
                Temidun • Stay Connected. Stay Accountable.
            </td>
        </tr>
    </table>
</body>
`;

export const forgotPasswordTemplate = ({ fullName, resetUrl }) => `
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" 
        style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <tr>
            <td align="center" style="padding-bottom: 20px;">
                <h2 style="color: #333;">Reset Your Password</h2>
                <p style="color: #555;">Temidun • Stay Connected. Stay Accountable.</p>
            </td>
        </tr>
        <tr>
            <td>
                <p style="color: #333; font-size: 16px;">Hello ${fullName},</p>
                <p style="color: #333; font-size: 16px;">
                    We received a request to reset your password for your <strong>Temidun</strong> account.
                </p>
                <p style="color: #333; font-size: 16px;">
                    Click the button below to reset your password. This link will expire in 15 minutes.
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p style="color: #333; font-size: 16px;">
                    If you did not request this, you can safely ignore this email.
                </p>
                <p style="color: #333; font-size: 16px;">Thank you for using Temidun!</p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 20px; font-size: 12px; color: #aaa;">
                Temidun • Stay Connected. Stay Accountable.
            </td>
        </tr>
    </table>
</body>
`;
