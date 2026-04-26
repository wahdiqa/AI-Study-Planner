# AI Study Planner

A full-stack AI-powered study planner web application that helps students manage tasks and events using natural language commands through a chatbot assistant.

---

## Features

- AI chatbot assistant for natural language commands
- Create, update, delete, and manage tasks
- Add and manage events and deadlines
- Mark tasks as completed or pending
- Intelligent command understanding (add task, delete task, etc.)
- Real-time backend using Node.js and Express
- MongoDB database for persistent storage

---

## Tech Stack

**Frontend:**
- React
- Vite
- CSS

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)

**AI Integration:**
- Groq / LLaMA 3 

---

## Project Structure


StudyPlannerAI/
│
├── frontend/ # React + Vite frontend
│ ├── src/
│ ├── public/
│
├── backend/ # Node.js + Express backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── server.js
│
└── README.md


---

## Installation & Setup
bash
git clone https://github.com/your-username/ai-study-planner.git
cd ai-study-planner


2. Backend Setup
cd backend
npm install

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_api_key

Run backend:
npm run dev

3. Frontend Setup
cd frontend
npm install
npm run dev

AI Commands Examples
1.Add task complete math homework
2.Mark physics task as done
3.Delete my essay task
4.What tasks do I have


Built by wahdiqa

License:
This project is licensed under the MIT License.
