const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app); // Creating an HTTP server for Express
const io = socketIo(server, { // Initializing socket.io for real-time communication
  cors: {
    origin: "http://localhost:3000", // Allowing CORS for the front-end (running on port 3000)
    methods: ["GET", "POST"]
  }
});

// Update CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allowing requests from localhost:3000
  credentials: true // Allowing credentials (cookies, etc.)
}));
app.use(express.json()); // Middleware to parse JSON requests

// MongoDB connection
mongoose.connect('mongodb+srv://supriyadhal50:n6Ef2fti2ezb99f0@cluster0.pgn4a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/SHC') // Connecting to MongoDB database "chatapp"
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Mongoose models
// User model for storing user information
const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
  status: { type: String, default: 'offline' } // User status (online/offline)
});

// Message model for storing messages
const Message = mongoose.model('Message', {
  sender: String, // Sender ID
  receiver: String, // Receiver ID
  content: String, // Message content
  timestamp: Date, // Timestamp of the message
  chatRoomId: String // Associated chat room ID for the conversation
});

// User registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email }); // Check if the user already exists by email
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save(); // Save new user to the database
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }); // Find the user by email
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password); // Check if the password is correct
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Generate JWT token for authentication
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    user.status = 'online'; // Set user status to 'online'
    await user.save(); // Update user status in database
    io.emit('userStatusChange', { userId: user._id, status: 'online' }); // Emit event to notify all clients of status change
    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Endpoint to get list of users with their status
app.get('/users', async (_req, res) => {
  try {
    const users = await User.find({}, 'username status'); // Fetch all users' usernames and statuses
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Endpoint to fetch messages for a specific chat room
app.get('/messages/:chatRoomId', async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const messages = await Message.find({ chatRoomId }).sort('timestamp'); // Fetch messages sorted by timestamp
    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// WebSocket (Socket.IO) connection handler
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle user joining a chat room
  socket.on('join', async (userId) => {
    socket.join(userId); // Join socket to a room identified by userId
    const user = await User.findById(userId); // Find user by ID
    if (user) {
      user.status = 'online'; // Update user status to 'online'
      await user.save(); // Save updated status
      io.emit('userStatusChange', { userId, status: 'online' }); // Notify all clients of status change
    }
  });

  // Handle sending a message
  socket.on('sendMessage', async ({ senderId, senderName, receiverId, content, chatRoomId }) => {
    try {
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        timestamp: new Date(), // Set current timestamp
        chatRoomId
      });
      await message.save(); // Save the message to the database
      // Emit message to both sender and receiver
      io.to(senderId).to(receiverId).emit('newMessage', { ...message.toObject(), senderName });
    } catch (error) {
      console.error('Send message error:', error);
    }
  });

  // Handle user disconnecting
  socket.on('disconnect', async () => {
    console.log('Client disconnected');
    const userId = Object.keys(socket.rooms)[1]; // Assuming the second room is the user's ID
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.status = 'offline'; // Set user status to 'offline'
        await user.save(); // Save updated status
        io.emit('userStatusChange', { userId, status: 'offline' }); // Notify all clients of status change
      }
    }
  });
});



//deployment
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});







// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the HTTP server on specified port
