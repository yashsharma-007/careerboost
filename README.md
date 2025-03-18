# Edu Platform 🚀

## Overview
Edu Platform is a one-stop solution for students, providing career-building tools such as job search, resume building, portfolio showcase, courses, networking, roadmaps, coding contests, and interview preparation. Built with **React.js** for the frontend and **Supabase** as the backend, it ensures a seamless user experience.

## Features 🌟
- **User Authentication** (Signup/Login via Supabase)
- **Profile Management** (Create & Edit Profile)
- **Resume Builder** (Generate & Download Resumes)
- **Portfolio Showcase** (Display Projects & Achievements)
- **Explore Jobs** (Search, Filter & Apply)
- **Course Enrollment** (Learn & Track Progress)
- **Chat Community** (Real-time Messaging)
- **Networking & Connections** (Build Professional Network)
- **Daily Task Manager** (Track Goals & Productivity)
- **Coding Contests** (Compete & Rank)
- **Interview Preparation** (Practice & Learn)

## Tech Stack 🛠️
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL
- **Realtime Chat:** Supabase Realtime
- **State Management:** Context API

## Installation & Setup 🔧
### Prerequisites
- **Node.js** (v16+)
- **npm** or **yarn**

### Steps to Run Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/YOUR_USERNAME/edu-platform.git
   cd edu-platform
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Setup Supabase:
   - Create a Supabase project
   - Copy `.env.example` to `.env` and add your Supabase credentials:
     ```env
     REACT_APP_SUPABASE_URL=your_supabase_url
     REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
4. Start the development server:
   ```sh
   npm start
   ```

## Folder Structure 📂
```
📦 edu-platform
 ┣ 📂 src
 ┃ ┣ 📂 components  # Reusable UI Components
 ┃ ┣ 📂 pages       # Page Components (Home, Login, Profile, etc.)
 ┃ ┣ 📂 services    # API Calls & Supabase Setup
 ┃ ┣ 📂 utils       # Helper Functions
 ┃ ┗ 📂 assets      # Images & Icons
 ┣ 📜 package.json  # Dependencies
 ┣ 📜 .env.example  # Environment Variables Template
 ┣ 📜 README.md     # Project Documentation
```

## Contributing 🤝
Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch (`feature-branch`)
3. Commit your changes
4. Push and open a pull request

## License 📜
This project is licensed under the **MIT License**.

## Contact & Support 📩
For queries or collaboration, reach out via [GitHub Issues](https://github.com/YOUR_USERNAME/edu-platform/issues).

---
Made with ❤️ by Edu Platform Team 🚀
