require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' folder (compiled CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the root directory (HTML, JS, images)
app.use(express.static(path.join(__dirname)));

// =============================================
// DATABASE INTEGRATION
// =============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Define Schema for Messages
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: 'Portfolio Contact' },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// =============================================
// POST /send-email  — Contact Form Handler
// =============================================
app.post('/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
    }

    // Check credentials are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('❌ Gmail credentials not set in .env file');
        return res.status(500).json({ success: false, error: 'Email service not configured.' });
    }

    // Create Nodemailer transporter using Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,   // Gmail App Password (not your real password)
        },
    });

    const mailOptions = {
        from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,          // Sends to YOUR inbox
        replyTo: email,                       // Reply goes to the client's email
        subject: `📩 [Portfolio] ${subject || 'New Message'} — from ${name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">📩 New Portfolio Message</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; font-weight: bold; color: #475569; width: 100px;">Name:</td>
                            <td style="padding: 10px 0; color: #0f172a;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Email:</td>
                            <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Subject:</td>
                            <td style="padding: 10px 0; color: #0f172a;">${subject || 'No subject'}</td>
                        </tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <h3 style="color: #475569; margin-top: 0;">Message:</h3>
                    <p style="color: #0f172a; line-height: 1.8; background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">${message.replace(/\n/g, '<br>')}</p>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
                        💡 Hit <strong>Reply</strong> in your email client to respond directly to ${name}.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        // 1. Save to Database first
        const newMessage = new Message({ name, email, subject, message });
        await newMessage.save();
        console.log(`✅ Message saved to database from: ${email} (${name})`);

        // 2. Try to send email
        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent from: ${email} (${name})`);
        } catch (emailErr) {
            console.error('❌ Email sending failed, but message is in DB:', emailErr.message);
            // We can still return success to the user so they know we got it, 
            // even if the email notification to the admin failed. 
        }

        res.json({ success: true, message: 'Message received successfully!' });

    } catch (dbErr) {
        console.error('❌ Database save failed:', dbErr.message);
        res.status(500).json({ success: false, error: 'Database error. Please try WhatsApp.' });
    }
});

// =============================================
// PAGE ROUTES
// =============================================

// Main route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Portfolio page
app.get('/portfolio', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'portfolio.html'));
});

// About page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'about.html'));
});

// Pricing page
app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'pricing.html'));
});

// Contact page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'contact.html'));
});

// Start the server (Only in local environment, Vercel will use the exported app)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server is running at http://localhost:${PORT}`);
        console.log(`📁 Serving files from: ${__dirname}`);
        console.log(`📧 Gmail: ${process.env.GMAIL_USER || '⚠️  Not set — add GMAIL_USER to .env'}`);
    });
}

// Export for Vercel
module.exports = app;
