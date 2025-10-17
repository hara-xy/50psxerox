// Simple Node.js proxy for Telegram file uploads
// Run with: node telegram-proxy.js
// Then access via: http://localhost:3001/sendDocument

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

const TELEGRAM_BOT_TOKEN = "7918152804:AAEfqKOSPdTW26F1OpWBhn3onVP3pk-6Jgs";
const TELEGRAM_CHAT_ID = "-4795407436";

app.use(express.json());
app.use(express.static('.'));

// Serve the print service route
app.use('/print', express.static(path.join(__dirname, 'print')));

// Endpoint to send document to Telegram
app.post('/sendDocument', upload.single('document'), async (req, res) => {
    try {
        console.log('Received file:', req.file);
        console.log('Received fields:', req.body);
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Create form data for Telegram API
        const form = new FormData();
        form.append('chat_id', req.body.chat_id || TELEGRAM_CHAT_ID);
        form.append('document', fs.createReadStream(req.file.path));
        
        if (req.body.caption) {
            form.append('caption', req.body.caption);
        }
        
        // Send to Telegram API
        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
            form,
            {
                headers: {
                    ...form.getHeaders()
                }
            }
        );
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error sending document:', error.message);
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Telegram proxy server running on port ${PORT}`);
    console.log(`Main site: http://localhost:3000/`);
    console.log(`Print service: http://localhost:3000/print`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});