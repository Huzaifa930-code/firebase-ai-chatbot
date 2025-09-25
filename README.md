# 🤖 AI Chatbot with Firebase Integration

A modern, responsive AI chatbot application built with React and Firebase, featuring real-time chat, user authentication, and persistent chat history.

## ✨ Features

- **🔐 Authentication**
  - Email/Password registration and login
  - Anonymous guest mode
  - Firebase Authentication integration
  - Secure session management

- **💬 Chat Functionality**
  - Real-time AI responses
  - Multiple AI personalities (Friendly, Professional, Technical, Creative)
  - Chat history persistence
  - Message timestamps
  - Task detection and extraction

- **🎨 User Interface**
  - Beautiful glassmorphism design
  - Dark/Light theme toggle
  - Fully responsive (mobile & desktop)
  - Modern animations and transitions
  - Intuitive sidebar navigation

- **☁️ Cloud Integration**
  - Firebase Firestore for chat storage
  - Real-time data synchronization
  - Automatic backups
  - Guest mode with localStorage fallback

## 🚀 Live Demo

**🌐 [View Live Application](https://ai-chatbot-app-d4743.web.app)**

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Icons**: Lucide React
- **AI Integration**: OpenAI API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Huzaifa930-code/firebase-ai-chatbot.git
   cd firebase-ai-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password
   - Enable Firestore Database
   - Enable Hosting (optional)
   - Copy your config values to `.env`

## 🎯 Usage

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deploy to Firebase
```bash
npm run build
firebase deploy
```

### Lint Code
```bash
npm run lint
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Chatbot.jsx          # Main chat interface
│   └── ChatLogin.jsx        # Authentication component
├── config/
│   └── firebase.js          # Firebase configuration
├── services/
│   └── firestoreService.js  # Database operations
├── utils/
│   └── aiService.js         # AI response handling
├── App.jsx                  # Main application component
└── main.jsx                 # Application entry point
```

## 🔧 Configuration

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication → Email/Password
4. Enable Firestore Database
5. Copy configuration to `.env` file

### AI Integration
The chatbot includes built-in AI response generation with multiple personality modes:
- **Friendly**: Casual and approachable responses
- **Professional**: Business-oriented communication
- **Technical**: Detailed technical explanations
- **Creative**: Imaginative and artistic responses

## 🚀 Deployment

### Firebase Hosting
```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Other Platforms
The built files in `/dist` can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Huzaifa**
- GitHub: [@Huzaifa930-code](https://github.com/Huzaifa930-code)
- Project: [firebase-ai-chatbot](https://github.com/Huzaifa930-code/firebase-ai-chatbot)

## 🙏 Acknowledgments

- Firebase for authentication and database services
- React and Vite for the development framework
- Tailwind CSS for styling
- Lucide React for beautiful icons
- OpenAI for AI integration capabilities

---

⭐ **If you found this project helpful, please give it a star!**
