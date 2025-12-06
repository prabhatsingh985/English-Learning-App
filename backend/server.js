const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Vocabulary = require('./models/Vocabulary');
const Topic = require('./models/Topic');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/EnglishApp')
.then(() => console.log('Connected to MongoDB EnglishApp'))
.catch(err => console.error('MongoDB connection error:', err));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'secret_key_change_me';
    const token = jwt.sign({ userId: user._id, username: user.username }, secret, { expiresIn: '24h' });

    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Vocabulary Routes ---
app.get('/api/vocabulary', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me');
    const vocab = await Vocabulary.find({ userId: decoded.userId }).sort({ createdAt: -1 });
    res.json(vocab);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/vocabulary', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me');
    const { word, meaning } = req.body;

    const newVocab = new Vocabulary({ userId: decoded.userId, word, meaning });
    await newVocab.save();

    res.status(201).json(newVocab);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/vocabulary/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me');
    await Vocabulary.findOneAndDelete({ _id: req.params.id, userId: decoded.userId });

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Topic Routes & Seeding ---
const seedTopics = async () => {
  const count = await Topic.countDocuments();
  if (count === 0) {
    const starterTopics = [
      { text: "What's the most interesting place you've ever visited?", category: "Travel" },
      { text: "Do you prefer reading books or watching movies? Why?", category: "Hobbies" },
      { text: "What is a skill you'd love to learn in the future?", category: "Self-Improvement" },
      { text: "If you could meet any historical figure, who would it be?", category: "History" },
      { text: "What's your favorite way to relax after a long day?", category: "Lifestyle" },
      { text: "Do you think AI will change the world for better or worse?", category: "Tech" },
      { text: "What's the best piece of advice you've ever received?", category: "Life" },
      { text: "If you could live anywhere in the world, where would it be?", category: "Travel" },
      { text: "What is your earliest childhood memory?", category: "Personal" },
      { text: "Do you believe in aliens? Why or why not?", category: "Fun" }
    ];
    await Topic.insertMany(starterTopics);
    console.log("Seeded initial topics");
  }
};
seedTopics();

app.get('/api/topics/random', async (req, res) => {
  try {
    const count = await Topic.countDocuments();
    const random = Math.floor(Math.random() * count);
    const topic = await Topic.findOne().skip(random);
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- AI Routes ---
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // User requested specifically "models/gemini-2.0-flash"
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

        // Gemini history must start with a user message. 
        // Filter out any leading model messages (like the initial welcome greeting).
        let validHistory = history ? history.map(h => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
        })) : [];

        while (validHistory.length > 0 && validHistory[0].role !== 'user') {
            validHistory.shift();
        }

        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 150,
            },
        });

        // Simple retry logic for 429 errors
        let retries = 3;
        let responseText = "";
        
        while (retries > 0) {
            try {
                const result = await chat.sendMessage(message);
                const response = await result.response;
                responseText = response.text();
                break; // Success
            } catch (error) {
                if (error.message.includes("429") || error.status === 429 || error.status === 503) {
                    console.log(`Rate limit/Overloaded. Retries left: ${retries - 1}`);
                    retries--;
                    if (retries === 0) {
                         return res.status(429).json({ message: "System busy. Please try again in a minute." });
                    }
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    throw error;
                }
            }
        }
        
        res.json({ text: responseText });
    } catch (error) {
        console.error("AI Server Error:", error);
        // Send the actual error message to the frontend
        res.status(500).json({ message: error.message || 'AI processing error' });
    }
});

// --- Socket.io Logic ---
let connectedUsers = {}; // socketId -> { id, username, interests }
let onlineUsers = {}; // username -> socketId (For direct calling lookup)
let matchingQueue = [];
let activeCalls = {}; // socketId -> partnerSocketId

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Register User (for Direct Calls)
  socket.on("register_user", (username) => {
      if (!username) return;
      const normalizedUsername = username.toLowerCase();
      onlineUsers[normalizedUsername] = socket.id;
      console.log(`Registered ${normalizedUsername} (${username}) for direct calls.`);
  });

  // 2. Direct Call Request
  socket.on("call_user", ({ targetUsername, callerUsername }) => {
      console.log(`Call request from ${callerUsername} to ${targetUsername}`);
      console.log("Current Online Users:", Object.keys(onlineUsers));
      
      const normalizedTarget = targetUsername.toLowerCase();
      const targetSocketId = onlineUsers[normalizedTarget];
      
      if (!targetSocketId) {
          console.log(`Target ${normalizedTarget} not found.`);
          socket.emit("call_error", { message: `User '${targetUsername}' is offline or not found.` });
          return;
      }

      if (activeCalls[targetSocketId] || matchingQueue.find(u => u.id === targetSocketId)) {
          socket.emit("call_error", { message: "User is currently busy." });
          return;
      }

      // Send Signal to Ring
      io.to(targetSocketId).emit("incoming_call", { 
          callerUsername, 
          callerSocketId: socket.id 
      });
  });

  // 3. Answer Call
  socket.on("answer_call", ({ callerSocketId, accepted }) => {
     if (!accepted) {
         io.to(callerSocketId).emit("call_rejected");
         return;
     }

     // If accepted, treat it like a match found
     // Partner A = Caller (callerSocketId)
     // Partner B = Receiver (socket.id)
     
     // Register active call
     activeCalls[socket.id] = callerSocketId;
     activeCalls[callerSocketId] = socket.id;

     // Get usernames (might need to fetch if not strictly in data, but we passed them)
     // Ideally we store username in socket object or connectedUsers
     // For now, allow frontend to pass context or retrieve from our registry if possible.
     // To keep it simple, we assume frontend handles the 'match_found' event payloads correctly.
     // But wait, 'match_found' expects specific structure. 
     // Let's ensure strict sync.
     
     io.to(callerSocketId).emit("match_found", { 
        partnerId: socket.id, 
        partnerUsername: "Partner", // Simplified or need lookup
        initiator: true 
     });
     
     io.to(socket.id).emit("match_found", { 
        partnerId: callerSocketId, 
        partnerUsername: "Partner", 
        initiator: false 
     });
  });


  socket.on("join_queue", (data) => {
    // data should ensure it has username
    const user = { id: socket.id, ...data };
    console.log(`User joined queue: ${user.username} (${socket.id})`);
    
    connectedUsers[socket.id] = user;
    onlineUsers[user.username] = socket.id; // Also register here just in case

    if (matchingQueue.length > 0) {
      const partner = matchingQueue.shift();
      
      if (partner.id === socket.id) {
          matchingQueue.push(user);
          return;
      }

      console.log(`Matching ${user.username} with ${partner.username}`);

      // Register active call
      activeCalls[socket.id] = partner.id;
      activeCalls[partner.id] = socket.id;

      // Send match data WITH usernames
      io.to(socket.id).emit("match_found", { 
        partnerId: partner.id, 
        partnerUsername: partner.username,
        initiator: true 
      });
      io.to(partner.id).emit("match_found", { 
        partnerId: socket.id, 
        partnerUsername: user.username,
        initiator: false 
      });

    } else {
      matchingQueue.push(user);
    }
  });

  socket.on("signal", (data) => {
    const { target, signal } = data;
    io.to(target).emit("signal", { sender: socket.id, signal });
  });

  socket.on("end_call", () => {
    const partnerId = activeCalls[socket.id];
    if (partnerId) {
      io.to(partnerId).emit("call_ended");
      delete activeCalls[partnerId];
    }
    delete activeCalls[socket.id];
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Notify partner if in call
    const partnerId = activeCalls[socket.id];
    if (partnerId) {
      io.to(partnerId).emit("call_ended");
      delete activeCalls[partnerId];
    }
    delete activeCalls[socket.id];

    // Cleanup Maps
    const user = connectedUsers[socket.id];
    if (user) {
        delete onlineUsers[user.username];
        delete connectedUsers[socket.id];
    }
    
    // Also scan onlineUsers for this socketId just in case (if registered via register_user but not join_queue)
    for (const [uname, sid] of Object.entries(onlineUsers)) {
        if (sid === socket.id) {
            delete onlineUsers[uname];
            break;
        }
    }

    matchingQueue = matchingQueue.filter((u) => u.id !== socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
