import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, MessageSquare, Trash2, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { getAIResponse, detectCodeBlock, detectTask, extractTask } from '../utils/aiService';
import { saveChat, getUserChats, updateChat, deleteChat as deleteFirestoreChat } from '../services/firestoreService';
import { auth } from '../config/firebase';

const Chatbot = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personality, setPersonality] = useState('friendly');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const gradient = isDarkMode
    ? 'from-gray-900 via-black to-gray-800'
    : 'from-gray-200 via-gray-100 to-gray-300';

  useEffect(() => {
    const loadChatHistory = async () => {
      if (auth.currentUser && user !== 'guest') {
        try {
          const chats = await getUserChats(auth.currentUser.uid);
          setChatHistory(chats);
        } catch (error) {
          console.error('Error loading chat history:', error);
          // Fallback to localStorage for guest users or if Firestore fails
          const savedHistory = localStorage.getItem(`chatbot_history_${user}`);
          if (savedHistory) {
            setChatHistory(JSON.parse(savedHistory));
          }
        }
      } else {
        // Guest users use localStorage
        const savedHistory = localStorage.getItem(`chatbot_history_${user}`);
        if (savedHistory) {
          setChatHistory(JSON.parse(savedHistory));
        }
      }
    };

    loadChatHistory();
  }, [user]);

  useEffect(() => {
    // For guest users, still use localStorage
    if (user === 'guest' && chatHistory.length > 0) {
      localStorage.setItem(`chatbot_history_${user}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, user]);

  useEffect(() => {
    const saveChatData = async () => {
      if (messages.length > 0) {
        const chatData = {
          id: currentChatId || Date.now(),
          messages,
          personality,
          timestamp: new Date().toISOString(),
        };

        // Save to Firestore for authenticated users
        if (auth.currentUser && user !== 'guest') {
          try {
            if (currentChatId && chatHistory.find(chat => chat.id === currentChatId)) {
              // Update existing chat
              await updateChat(currentChatId, {
                messages,
                personality,
                timestamp: chatData.timestamp
              });
            } else {
              // Save new chat
              const firestoreChatId = await saveChat(auth.currentUser.uid, {
                messages,
                personality,
                timestamp: chatData.timestamp
              });
              chatData.id = firestoreChatId;
              setCurrentChatId(firestoreChatId);
            }
          } catch (error) {
            console.error('Error saving chat to Firestore:', error);
          }
        }

        // Update local state
        setChatHistory((prev) => {
          const existingIndex = prev.findIndex((chat) => chat.id === chatData.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = chatData;
            return updated;
          }
          return [chatData, ...prev];
        });

        if (!currentChatId) {
          setCurrentChatId(chatData.id);
        }
      }
    };

    saveChatData();
  }, [messages, personality, currentChatId, user, chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      hasCode: detectCodeBlock(inputMessage),
      hasTask: detectTask(inputMessage),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    setTimeout(async () => {
      const aiResponseText = await getAIResponse(currentInput, personality, messages);

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      if (userMessage.hasTask) {
        const task = extractTask(currentInput);
        if (task) {
          aiMessage.extractedTask = task;
        }
      }

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleLoadChat = (chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setPersonality(chat.personality);
      setCurrentChatId(chat.id);
    }
  };

  const handleDeleteChat = async (chatId) => {
    // Delete from Firestore for authenticated users
    if (auth.currentUser && user !== 'guest') {
      try {
        await deleteFirestoreChat(chatId);
      } catch (error) {
        console.error('Error deleting chat from Firestore:', error);
      }
    }

    // Update local state
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} transition-all duration-500`}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>AI Chatbot</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-800/20 text-gray-800 hover:bg-gray-800/30'} transition-all duration-200 backdrop-blur-sm`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-800/20 text-gray-800 hover:bg-gray-800/30'} transition-all duration-200 backdrop-blur-sm`}
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)] lg:h-auto lg:min-h-screen">
        {/* Sidebar - Mobile: overlay, Desktop: fixed */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative top-16 lg:top-0 bottom-0 left-0 z-50 w-80 lg:w-72
          backdrop-blur-xl bg-white/10 border-r border-white/20
          transition-transform duration-300 ease-in-out
          flex flex-col
          ${isSidebarOpen ? 'lg:rounded-none rounded-r-3xl' : 'lg:rounded-3xl lg:m-4 lg:shadow-2xl lg:border'}
        `}>
          {/* Desktop Header in Sidebar */}
          <div className="hidden lg:block p-4 border-b border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>AI Chatbot</h2>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="p-4 pt-6 lg:pt-0 flex-1 overflow-hidden flex flex-col">
          <button
            onClick={handleNewChat}
            className={`w-full px-4 py-3 rounded-xl ${isDarkMode ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-800/20 text-gray-800 hover:bg-gray-800/30'} transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2 mb-4`}
          >
            <MessageSquare className="w-5 h-5" />
            New Chat
          </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-semibold mb-2 px-2`}>Chat History</h3>
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                  currentChatId === chat.id
                    ? isDarkMode ? 'bg-white/25 backdrop-blur-sm' : 'bg-gray-800/25 backdrop-blur-sm'
                    : isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-800/10 hover:bg-gray-800/20'
                }`}
                onClick={() => handleLoadChat(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm truncate`}>
                    {chat.messages[0]?.text || 'New Chat'}
                  </p>
                  <p className={`${isDarkMode ? 'text-white/60' : 'text-gray-600'} text-xs mt-1`}>
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                  className={`ml-2 p-1 rounded-lg ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-gray-800/20'} opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <Trash2 className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
                </button>
              </div>
            ))}
            </div>

            {/* User Info & Logout - Mobile/Desktop */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                  {user === 'guest' ? 'Guest' : user}
                </span>
                <button
                  onClick={onLogout}
                  className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-800/20 text-gray-800 hover:bg-gray-800/30'} transition-all duration-200 backdrop-blur-sm flex items-center gap-2 text-sm`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col lg:m-4 lg:mr-4 lg:backdrop-blur-xl lg:bg-white/10 lg:rounded-3xl lg:shadow-2xl lg:border lg:border-white/20">
          {/* Desktop Header */}
          <div className="hidden lg:block p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                <Sparkles className="w-8 h-8" />
                AI Chatbot
              </h1>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                  {user === 'guest' ? 'Guest' : user}
                </span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-800/20 text-gray-800 hover:bg-gray-800/30'} transition-all duration-200 backdrop-blur-sm`}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={onLogout}
                  className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-800/20 text-gray-800 hover:bg-gray-800/30'} transition-all duration-200 backdrop-blur-sm flex items-center gap-2`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-xl ${isDarkMode ? 'bg-white/20 text-white' : 'bg-gray-800/20 text-gray-800'} backdrop-blur-sm focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-white/50' : 'focus:ring-gray-800/50'}`}
                style={{ color: isDarkMode ? 'white' : '#1f2937' }}
              >
                <option value="friendly" style={{ background: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? 'white' : '#1f2937' }}>Friendly</option>
                <option value="professional" style={{ background: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? 'white' : '#1f2937' }}>Professional</option>
                <option value="technical" style={{ background: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? 'white' : '#1f2937' }}>Technical</option>
                <option value="creative" style={{ background: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? 'white' : '#1f2937' }}>Creative</option>
              </select>
            </div>
          </div>

          {/* Mobile Personality Selector */}
          <div className="lg:hidden p-4 border-b border-white/20 backdrop-blur-xl bg-white/5">
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl ${isDarkMode ? 'bg-white/20 text-white' : 'bg-gray-800/20 text-gray-800'} backdrop-blur-sm focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-white/50' : 'focus:ring-gray-800/50'} text-sm`}
              style={{ color: isDarkMode ? 'white' : '#1f2937' }}
            >
              <option value="friendly" style={{ background: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? 'white' : '#1f2937' }}>Friendly Assistant</option>
              <option value="professional" style={{ background: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? 'white' : '#1f2937' }}>Professional Assistant</option>
              <option value="technical" style={{ background: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? 'white' : '#1f2937' }}>Technical Assistant</option>
              <option value="creative" style={{ background: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? 'white' : '#1f2937' }}>Creative Assistant</option>
            </select>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 min-h-0">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className={`text-center ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                  <Sparkles className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg lg:text-xl">Start a conversation!</p>
                  <p className="text-sm lg:text-base mt-2">I can help with programming, tasks, and more.</p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-3 lg:p-4 ${
                    message.sender === 'user'
                      ? isDarkMode ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-gray-800/20 text-gray-800 backdrop-blur-sm'
                      : isDarkMode ? 'bg-white/25 text-white backdrop-blur-sm' : 'bg-gray-800/25 text-gray-800 backdrop-blur-sm'
                  }`}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap">{message.text}</p>
                  {message.extractedTask && (
                    <div className={`mt-3 p-2 rounded-lg ${isDarkMode ? 'bg-white/20' : 'bg-gray-800/20'}`}>
                      <p className="text-xs font-semibold">Task Detected:</p>
                      <p className="text-sm mt-1">{message.extractedTask}</p>
                    </div>
                  )}
                  <span className="text-xs opacity-70 mt-2 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {message.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className={`${isDarkMode ? 'bg-white/25 text-white' : 'bg-gray-800/25 text-gray-800'} backdrop-blur-sm rounded-2xl p-4`}>
                  <div className="flex gap-1">
                    <span className={`w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-gray-800'} rounded-full animate-bounce`}></span>
                    <span className={`w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-gray-800'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></span>
                    <span className={`w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-gray-800'} rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={`p-6 border-t ${isDarkMode ? 'border-white/20' : 'border-gray-800/20'}`}>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 px-6 py-4 rounded-2xl ${isDarkMode ? 'bg-white/20 text-white placeholder-white/60' : 'bg-gray-800/20 text-gray-800 placeholder-gray-600'} backdrop-blur-sm focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-white/50' : 'focus:ring-gray-800/50'}`}
              />
              <button
                type="submit"
                className={`px-6 py-4 rounded-2xl ${isDarkMode ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-800/20 text-gray-800 hover:bg-gray-800/30'} transition-all duration-200 backdrop-blur-sm flex items-center gap-2`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;