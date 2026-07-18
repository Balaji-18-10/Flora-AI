# 🌿 Flora AI – Your Smart Plant Companion

## Overview

**Flora AI** is an AI-powered web application that transforms plant care into an interactive and intelligent experience. By combining AI-powered plant analysis, conversational AI, voice interaction, and personalized recommendations, Flora AI helps users monitor plant health and maintain healthier plants with ease.

Users simply upload a plant image, and the application analyzes its health, identifies potential issues, and brings the plant to life as a virtual AI companion capable of natural conversations.

---

# ✨ Key Features

* 🌱 AI-powered plant species identification
* 🩺 Plant health and disease analysis
* 💬 Interactive AI plant personality chatbot
* 🎙️ Voice-enabled conversations
* 🌍 Multi-language support
* 📷 Plant image upload and management
* 📊 Plant health history tracking
* 💧 Personalized watering recommendations
* ☀️ Sunlight and fertilizer suggestions
* 🪴 Plant collection dashboard
* 🔐 Secure Firebase Authentication
* ☁️ Cloud image storage with Firebase Storage
* 📱 Fully responsive modern UI

---

# 🚀 How It Works

1. Sign in to Flora AI.
2. Add a new plant by uploading its image.
3. AI analyzes the plant and detects:

   * Plant species
   * Health condition
   * Disease symptoms
   * Water stress
   * Nutrient deficiencies
4. The plant is transformed into an interactive AI companion.
5. Chat with your plant using text or voice.
6. Receive personalized care recommendations.
7. Track your plant's health history over time.

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Framer Motion
* Lucide React

## Backend

* Node.js
* Express.js

## Database

* Firebase Firestore

## Authentication

* Firebase Authentication

## Storage

* Firebase Storage

## AI

* Gemini Vision (Image Analysis)
* Gemini (Conversational AI)

## Voice

* Web Speech API
* Text-to-Speech

---

# 🏗️ System Architecture

User → React Frontend → Express Backend → AI Services → Firebase

The application uses Firebase for authentication, database storage, and image storage while AI services perform plant analysis and generate intelligent conversational responses.

---

# 📂 Project Structure

```text
flora-ai/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── firebase/
│   │   ├── hooks/
│   │   ├── assets/
│   │   └── utils/
│   └── public/
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
├── README.md
└── package.json
```

---

# 🔒 Security

* Secure user authentication with Firebase Authentication.
* User data is isolated per account.
* Images are securely stored in Firebase Storage.
* Firestore security rules protect user data.
* Input validation and error handling throughout the application.

---

# 💡 Future Enhancements

* AI-powered plant growth prediction
* Smart watering reminders
* Weather-based care recommendations
* AR-based plant visualization
* Community forum for plant enthusiasts
* IoT sensor integration
* Smart garden monitoring
* Plant marketplace integration

---

# 🎯 Problem Statement

Many plant owners struggle to identify plant diseases and provide the right care due to limited knowledge and the lack of personalized guidance. Existing solutions often provide static information without interactive assistance.

---

# ✅ Solution

Flora AI uses AI to analyze plant images, detect health conditions, and transform plants into interactive AI companions capable of natural conversations. The platform delivers personalized care recommendations, voice interaction, and health tracking, making plant care simple, engaging, and accessible.

---

# 🌍 Target Users

* Home gardeners
* Indoor plant owners
* Plant enthusiasts
* Beginners in gardening
* Schools and educational institutions
* Nurseries and plant shops

---

# 👨‍💻 Team

Developed with ❤️ for the **OpenSwarm Hackathon**.

---

# 📄 License

This project is intended for educational, research, and hackathon purposes.
