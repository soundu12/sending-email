require('dotenv').config();
const nodemailer = require('nodemailer');

const primaryTransporter = nodemailer.createTransport({
    service: process.env.PRIMARY_EMAIL_SERVICE,
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    auth: {
        user: process.env.PRIMARY_EMAIL_USER,
        pass: process.env.PRIMARY_EMAIL_PASS,
    },
});

const backupTransporter = nodemailer.createTransport({
    service: process.env.BACKUP_EMAIL_SERVICE,
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BACKUP_EMAIL_USER,
        pass: process.env.BACKUP_EMAIL_PASS
    }
});

let primaryFailureCount = 0;
const MAX_RETRIES = 3;

async function sendEmail(mailOptions, useBackup = false) {
    const transporter = useBackup ? backupTransporter : primaryTransporter;
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully using ${useBackup ? 'backup' : 'primary'} transporter`);
        primaryFailureCount = 0; // Reset failure count on success
        return 200
    } catch (error) {
        console.error(`Error sending email with ${useBackup ? 'backup' : 'primary'} transporter:`, error.message);

        if (!useBackup) {
            primaryFailureCount++;
            if (primaryFailureCount == MAX_RETRIES) {
                console.log('Switching to backup transporter...');
                await sendEmail(mailOptions, true);
            } else {
                console.log(`Retrying with primary transporter (${primaryFailureCount}/${MAX_RETRIES})...`);
                await sendEmail(mailOptions, false);
            }
        } else {
            console.log('Backup transporter failed.');
        }
    }
}

module.exports = { sendEmail };