require('dotenv').config()

const express = require('express')
const { sendEmail } = require('../Assignmentsth/services/email')
const app = express()
app.use(express.json())

const PORT = 3045

app.post('/api/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    const emailOptions = {
        from: process.env.SENDER_MAID_ID,
        to,
        subject,
        text
    };
    try {
        await sendEmail(emailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
    }
})

app.listen(PORT, () => {
    console.log('server is running on port', PORT)
})