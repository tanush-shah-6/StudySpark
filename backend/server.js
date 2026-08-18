const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const StudyRoom = require('./models/StudyRoom');
const studyRoomSocket = require('./sockets/studyRoomSocket');
const authenticate = require('./middleware/authenticate');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
});

const studyRoomRoutes = require('./routes/studyRoomRoutes')(io);

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in the .env file');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

function extractJsonFromResponse(str) {
    try {
        const jsonRegex = /\[\s*{[\s\S]*}\s*\]/;
        const match = str.match(jsonRegex);
        if (match) return match[0];

        let cleanedStr = str.replace(/```(json)?/g, '').trim();
        cleanedStr = cleanedStr.replace(/\n(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ' ');
        cleanedStr = cleanedStr.replace(/,\s*([}\]])/g, '$1');
        return cleanedStr;
    } catch (error) {
        console.error('Error extracting JSON:', error);
        return str;
    }
}

async function generateFlashcardQuestions(topic, numQuestions) {
    const prompt = `Generate ${numQuestions} flashcard-style questions with answers on the topic of "${topic}". 
    Each flashcard should include:
    - A "question" field with the question text
    - An "answer" field with the correct answer as a string
    Return ONLY a valid JSON array of objects with no additional text or markdown formatting.`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        const extractedJson = extractJsonFromResponse(responseText);

        let flashcardData;
        try {
            flashcardData = JSON.parse(extractedJson);
            if (!Array.isArray(flashcardData)) flashcardData = [flashcardData];
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            throw new Error('Failed to parse the generated flashcard data');
        }

        // Return the parsed flashcards in-memory without saving to MongoDB
        return flashcardData.map((card) => ({
            topic,
            question: card.question,
            answer: card.answer,
        }));
    } catch (error) {
        console.error('Error generating flashcards:', error);
        throw error;
    }
}

async function generateQuizQuestions(topic, numQuestions) {
    const prompt = `Generate ${numQuestions} quiz questions on the topic of "${topic}". 
    Each question should include:
    - A "question" field with the question text
    - An "options" field with an array of four answer choices
    - An "answer" field with the correct answer as a string
    Return ONLY a valid JSON array of objects with no additional text or markdown formatting.`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        const extractedJson = extractJsonFromResponse(responseText);

        let quizData;
        try {
            quizData = JSON.parse(extractedJson);
            if (!Array.isArray(quizData)) quizData = [quizData];
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            throw new Error('Failed to parse the generated quiz data');
        }

        // Return the parsed quiz questions in-memory without saving to MongoDB
        return quizData.map((question) => ({
            topic,
            question: question.question,
            options: question.options,
            answer: question.answer,
        }));
    } catch (error) {
        console.error('Error generating quiz:', error);
        throw error;
    }
}

// AI generation routes - protected with authenticate middleware
app.post('/api/generate-flashcard', authenticate, async (req, res) => {
    const { topic, numQuestions } = req.body;

    if (!topic || !numQuestions) {
        return res.status(400).json({ error: 'Topic and number of questions are required.' });
    }

    try {
        const flashcardQuestions = await generateFlashcardQuestions(topic, numQuestions);
        res.status(200).json({ flashcards: flashcardQuestions });
    } catch (error) {
        console.error('Flashcard generation error:', error);
        res.status(500).json({ error: 'Failed to generate flashcards.', details: error.message });
    }
});

app.post('/api/generate-quiz', authenticate, async (req, res) => {
    const { topic, numQuestions } = req.body;

    if (!topic || !numQuestions) {
        return res.status(400).json({ error: 'Topic and number of questions are required.' });
    }

    try {
        const quizQuestions = await generateQuizQuestions(topic, numQuestions);
        res.status(200).json({ quiz: quizQuestions });
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz.', details: error.message });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/user/profile', authenticate, (req, res) => {
    res.json({ user: { id: req.user._id, username: req.user.username } });
});

studyRoomSocket(io);

app.use('/api/studyrooms', studyRoomRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
