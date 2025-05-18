require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors())
app.use(express.json());

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";
const token = process.env.GITHUB_TOKEN;

if (!token) {
    throw new Error("GITHUB_TOKEN is not set in the .env file");
}

app.post('/generate-response', async (req, res) => {
    const user_message = req.body.message || "";

    if (!user_message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: "You are a latin to hungarian translator. only write what is asked, nothing else. if only one word is given, provide the dictionary form of this word using abbreviations and including its meaning. if a phrase/sentence is given, write the translation."
                    },
                    {
                        role: "user",
                        content: user_message
                    }
                ],
                temperature: 1.0,
                top_p: 1.0
            })
        });

        const data = await response.json();

        const ai_response = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
            ? data.choices[0].message.content
            : (data.error && data.error.message ? data.error.message : "No response from AI");

        res.json({ response: ai_response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

if (require.main === module) {
    app.listen(5000, () => {
        console.log('Server running on port 5000');
    });
}
