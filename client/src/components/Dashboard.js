import axios from 'axios';
import { differenceInMinutes, format } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

// Import Heroicons
import { CheckCircleIcon, CogIcon, MenuIcon, PaperAirplaneIcon, PencilIcon, SearchIcon, TrashIcon, UserIcon, XCircleIcon } from '@heroicons/react/solid';

function Dashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState('bg-blue-100');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const generateChatRoomId = useCallback((userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  }, []);

  const filteredUsers = (users || []).filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/users');
        setUsers(response.data.filter((u) => u._id !== user.userId));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join', user.userId);

    newSocket.on('newMessage', (message) => {
      if (message.sender === user.userId || message.receiver === user.userId) {
        setMessages((prevMessages) => [...prevMessages, message]);
        if (message.sender !== user.userId) {
          toast.info(`New message from ${message.senderName}`);
        }
      }
    });

    newSocket.on('messageUpdated', (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    newSocket.on('messageDeleted', (deletedMessageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== deletedMessageId)
      );
    });

    newSocket.on('userStatusChange', ({ userId, status }) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userId ? { ...u, status } : u
        )
      );
    });

    return () => newSocket.close();
  }, [user.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserSelect = async (selectedUser) => {
    setSelectedUser(selectedUser);
    setShowSidebar(false);
    setIsLoading(true);
    const chatRoomId = generateChatRoomId(user.userId, selectedUser._id);
    try {
      const response = await axios.get(`http://localhost:5000/messages/${chatRoomId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      const chatRoomId = generateChatRoomId(user.userId, selectedUser._id);
      socket.emit('sendMessage', {
        senderId: user.userId,
        senderName: user.username,
        receiverId: selectedUser._id,
        content: newMessage,
        chatRoomId,
      });
      setNewMessage('');
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
  };

  const handleUpdateMessage = () => {
    if (editingMessage && newMessage.trim()) {
      socket.emit('updateMessage', {
        messageId: editingMessage._id,
        content: newMessage,
      });
      setEditingMessage(null);
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (messageId) => {
    socket.emit('deleteMessage', messageId);
  };

  const isMessageEditable = (message) => {
    return message.sender === user.userId && differenceInMinutes(new Date(), new Date(message.timestamp)) < 3;
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSettingsModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  const handleProfileRedirect = () => {
    navigate('/profile');
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : selectedColor} transition-all duration-500 ease-in-out overflow-hidden`}>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          }
        }
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes floatUpDown {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes rotateIn {
          from {
            transform: rotate(-10deg);
            opacity: 0;
          }
          to {
            transform: rotate(0);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        .animate-pulseGlow {
          animation: pulseGlow 2s infinite;
        }
        .animate-slideInFromLeft {
          animation: slideInFromLeft 0.3s ease-out;
        }
        .animate-slideInFromRight {
          animation: slideInFromRight 0.3s ease-out;
        }
        .animate-floatUpDown {
          animation: floatUpDown 1s ease-in-out infinite;
        }
        .animate-rotateIn {
          animation: rotateIn 0.5s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .animate-gradientShift {
          background: linear-gradient(270deg, #3b82f6, #10b981, #3b82f6);
          background-size: 200% 200%;
          animation: gradientShift 5s ease infinite;
        }
        .animate-typing {
          overflow: hidden;
          white-space: nowrap;
          animation: typing 3s steps(40, end);
        }
        .hover-lift {
          transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .gradient-text {
          background-image: linear-gradient(45deg, #4CAF50, #2196F3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @media (max-width: 640px) {
          .responsive-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 100%;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
          }
          .responsive-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 ease-in-out scale-95 hover:scale-100 animate-scaleIn">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Settings</h2>
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Choose Theme Color</h3>
              <div className="flex space-x-4 mt-4">
                {['blue', 'green', 'silver', 'yellow', 'sky', 'orange'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(`bg-${color}-100`)}
                    className={`w-10 h-10 rounded-full bg-${color}-100 hover:ring-4 hover:ring-${color}-300 transition-all duration-300 ease-in-out transform hover:scale-110 animate-rotateIn`}
                    style={{ animationDelay: `${['blue', 'green', 'silver', 'yellow', 'sky', 'orange'].indexOf(color) * 0.1}s` }}
                  ></button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleProfileRedirect}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 ease-in-out transform hover:scale-105 animate-fadeInUp"
              >
                View Profile
              </button>
            </div>
            <button
              onClick={toggleSettingsModal}
              className="mt-4 text-red-500 hover:text-red-600 transition-colors duration-300 ease-in-out animate-fadeInUp"
              style={{ animationDelay: '0.2s' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4 flex justify-between items-center transition-all duration-500 ease-in-out glassmorphism animate-fadeInUp animate-gradientShift`}>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} animate-pulse gradient-text animate-typing`}>
          Welcome, {user.username}! to TalkMate 🗣️💬
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'
              } transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-rotateIn`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={toggleSettingsModal}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
              } transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-rotateIn`}
            style={{ animationDelay: '0.1s' }}
          >
            <CogIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden relative">
        <div
          className={`w-full md:w-1/4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-r overflow-y-auto transition-all duration-500 ease-in-out transform ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } absolute md:relative z-10 h-full animate-slideInFromLeft responsive-sidebar ${showSidebar ? 'open' : ''}`}
        >
          <h3 className={`text-xl font-semibold p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b sticky top-0 bg-opacity-90 backdrop-filter backdrop-blur-lg z-10`}>Users</h3>
          <div className="relative mx-4 mt-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${darkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-800 border-gray-200'
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out animate-scaleIn`}
            />
            <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
          </div>
          <ul className="space-y-2 p-4">
            {isLoading ? (
              Array(5).fill().map((_, index) => (
                <li key={index} className="animate-pulse flex space-x-4 p-3">
                  <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </li>
              ))
            ) : (
              filteredUsers.map((u, index) => (
                <li
                  key={u._id}
                  onClick={() => handleUserSelect(u)}
                  className={`p-3 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg rounded-lg flex items-center justify-between ${selectedUser && selectedUser._id === u._id
                      ? darkMode
                        ? 'bg-gray-700 shadow-lg animate-pulseGlow'
                        : 'bg-blue-100 shadow-md animate-pulseGlow'
                      : ''
                    } animate-slideInFromLeft hover-lift`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                      <UserIcon className="h-6 w-6 text-gray-500" />
                    </div>
                    <span className="font-medium">{u.username}</span>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}>
                    {u.status === 'online' ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className={`w-full md:w-3/4 flex flex-col transition-all duration-500 ease-in-out transform ${showSidebar ? 'translate-x-full md:translate-x-0' : 'translate-x-0'
          }`}>
          {selectedUser ? (
            <>
              <h3 className={`text-xl font-semibold p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border-b transition-all duration-300 ease-in-out flex justify-between items-center sticky top-0 bg-opacity-90 backdrop-filter backdrop-blur-lg z-10 animate-fadeInUp`}>
                <span>Chat with {selectedUser.username}</span>
                <button
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-rotateIn"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </h3>
              <div className={`flex-grow overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'
                } transition-all duration-300 ease-in-out`}>
                {isLoading ? (
                  Array(5).fill().map((_, index) => (
                    <div key={index} className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
                        } animate-shimmer`}>
                        <div className="h-4 bg-gray-400 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === user.userId ? 'justify-end' : 'justify-start'} ${message.sender === user.userId ? 'animate-slideInFromRight' : 'animate-slideInFromLeft'
                        }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${message.sender === user.userId
                            ? darkMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-500 text-white'
                            : darkMode
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-300 text-gray-800'
                          } transition-all duration-300 ease-in-out transform hover:scale-105 relative group`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {format(new Date(message.timestamp), 'MMM d, yyyy HH:mm')}
                        </p>
                        {isMessageEditable(message) && (
                          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => handleEditMessage(message)}
                              className="text-white bg-blue-500 rounded-full p-1 hover:bg-blue-600 transition-colors duration-300"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              className="text-white bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors duration-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={editingMessage ? handleUpdateMessage : handleSendMessage}
                className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border-t transition-all duration-300 ease-in-out glassmorphism animate-fadeInUp`}
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                    className={`flex-grow p-2 ${darkMode
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-white text-gray-800 border-gray-300'
                      } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out animate-scaleIn`}
                  />
                  <button
                    type="submit"
                    className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                      } text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center animate-scaleIn hover:animate-bounce`}
                  >
                    <PaperAirplaneIcon className="h-5 w-5 mr-2 transform rotate-90" />
                    {editingMessage ? 'Update' : 'Send'}
                  </button>
                  {editingMessage && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMessage(null);
                        setNewMessage('');
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center animate-scaleIn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <div className={`w-full flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-500'
              } transition-all duration-300 ease-in-out h-full animate-fadeInUp`}>
              <div className="text-center space-y-4">
                <p className="text-2xl font-semibold animate-floatUpDown animate-typing">
                  Select a user to start chatting
                </p>
                <div className="animate-bounce mt-4">
                  <svg className="w-6 h-6 mx-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="md:hidden p-3 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-rotateIn"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

