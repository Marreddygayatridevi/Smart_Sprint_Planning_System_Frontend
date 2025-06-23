# Smart Sprint Planning System - Frontend

A modern, responsive React-based frontend for the Smart Sprint Planning System that helps agile development teams manage sprints, track progress, and optimize project delivery.

## 🚀 Features

- **🔐 Authentication System** - Secure login and signup functionality
- **📊 Kanban Dashboard** - Visual sprint management with drag-and-drop interface
- **🎫 Ticket Management** - Create, edit, and track development tickets
- **📈 Analytics & Reports** - Generate comprehensive sprint reports
- **⚠️ Risk Analysis** - Identify and manage project risks
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router DOM
- **Icons:** Lucide React

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** (version 8.0 or higher)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Marreddygayatridevi/Smart_Sprint_Planning_System_Frontend.git
cd Smart_Sprint_Planning_System_Frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
touch .env
```

Add the following environment variables:
```env
JWT_SECRET_KEY=ab6f----------------
JIRA_API_TOKEN=AT----------------
JIRA_URL=https/----------
JIRA_EMAIL= your jira account attached mail
```

### 4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`


## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AdminteamManagement.jsx
│   ├── KanbanColumn.jsx
│   ├── Navbar.jsx
│   ├── TicketCard.jsx
│   └── TicketModal.jsx
├── pages/              # Page components
│   ├── AssignTickets.jsx
│   ├── Home.jsx
│   ├── KanbanDashboard.jsx
│   ├── Login.jsx
│   ├── ReportGeneration.jsx
│   ├── RiskAnalysis.jsx
│   └── Signup.jsx
├── api/                # API configuration
│   └── axios.js
├── routes/             # Route definitions
│   └── index.jsx
├── assets/             # Static assets
└── App.jsx             # Main application component
```

## 🌐 API Integration

This frontend connects to the Smart Sprint Planning System backend. Make sure the backend server is running on the configured API base URL.

### API Endpoints Used:
- `/auth/login` - User authentication
- `/auth/signup` - User registration
- `/tickets` - Ticket CRUD operations
- `/teams` - Get team details
- `/reports` - Report generation
- `/risks` - Risk analysis

## 🎨 UI/UX Features

- **Modern Design** - Clean, intuitive interface built with Tailwind CSS
- **Dark/Light Mode** - Automatic theme detection
- **Responsive Layout** - Mobile-first design approach
- **Interactive Elements** - Smooth animations and transitions
- **Accessibility** - WCAG 2.1 compliant components

## 🔧 Configuration

### Vite Configuration
The project uses Vite for fast development and building. Configuration can be found in `vite.config.js`.

### Tailwind Configuration
Tailwind CSS configuration is located in `src/tailwind.config.js`.


## 👥 Authors

- **Gayatri Devi Marreddy** - *Initial work* - [Marreddygayatridevi](https://github.com/Marreddygayatridevi)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- All contributors who helped with this project
