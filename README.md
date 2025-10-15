# VizCoach

VizCoach is an innovative classroom orchestration toolkit for visualization education that aims to revolutionize how we teach and learn data visualization. This NSF-funded project empowers educators with the tools to effectively teach data visualization theories and design principles, addressing the critical need for software tools that help students learn visualization design theories and principles in modern data-driven decision-making processes.

## Project Description

VizCoach is a comprehensive educational platform designed to address two significant issues in visualization education:

1. **The need for software tools that help students learn visualization design theories and principles**
2. **The lack of understanding of how classroom orchestration can improve visualization education**

The platform enables instructors to create and moderate visualization-related classroom activities, providing real-time feedback to students while offering immediate feedback on student submissions. This promotes active learning and helps prepare students for the workforce by developing essential data analysis and visualization skills.

## Getting Started

### Prerequisites

Before running VizCoach, ensure you have the following installed on your system:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Go** (version 1.19 or higher) - for PocketBase backend
- **Git** - for cloning the repository

### Installation and Setup

Follow these step-by-step instructions to get VizCoach running on your computer:

#### 1. Clone the Repository

```bash
git clone https://github.com/svl-at-asu/viz-coach.git
cd viz-coach
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Set Up the Backend (PocketBase)

Navigate to the PocketBase directory and set up the backend:

**For Windows:**
```cmd
cd pocketbase
chmod +x *.sh
./install.sh
```

**For Mac/Linux:**
```bash
cd pocketbase
chmod +x *.sh
./install.sh
```

#### 4. Start the Development Servers

**Terminal 1 - Start PocketBase Backend:**
```bash
cd pocketbase
./dev.sh
```

**Terminal 2 - Start React Frontend:**
```bash
npm start
```

#### 5. Access the Application

- **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser
- **PocketBase Admin**: Open [http://localhost:8090/_/](http://localhost:8090/_/) in your browser

#### 6. Configure PocketBase

1. Set the application name to `VizCoach` in the PocketBase admin panel
2. Follow the detailed setup instructions in `pocketbase/README.md` to configure:
   - User authentication and roles
   - Database collections (groups, activities, units, submissions, comments)
   - SMTP settings for email functionality

## Features

VizCoach provides a comprehensive set of features for visualization education:

### For Educators (Teachers)
- **Activity Management**: Create, schedule, and manage visualization activities
- **Group Management**: Organize students into groups by semester, year, and course
- **Unit Creation**: Design structured learning units with datasets and descriptions
- **Real-time Monitoring**: Track student progress and submissions in real-time
- **Feedback System**: Provide immediate feedback and comments on student work
- **Student Management**: Import students via CSV and manage user accounts
- **Reference Materials**: Upload and share reference images and materials

### For Students
- **Interactive Visualization Builder**: Create visualizations using Vega-Lite with an intuitive interface
- **JSON Editor**: Direct JSON editing for advanced users with syntax validation
- **Dataset Exploration**: Browse and analyze provided datasets through interactive tables
- **Real-time Feedback**: Receive immediate feedback on visualization submissions
- **Help System**: Raise hand for assistance and receive teacher support
- **Progress Tracking**: Monitor submission status and save work in progress
- **Comment System**: Engage in discussions with teachers and peers

### Core Functionality
- **Vega-Lite Integration**: Built-in support for creating and editing Vega-Lite visualizations
- **Multi-dataset Support**: Work with multiple CSV datasets simultaneously
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Collaboration**: Live updates and feedback system
- **Role-based Access Control**: Secure authentication and authorization
- **Data Visualization Tools**: Comprehensive toolkit for creating effective visualizations

## Technology Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 4.9.4** - Type-safe JavaScript development
- **Material-UI (MUI) 5.16.0** - Modern React component library
- **React Router 6.23.1** - Client-side routing
- **Vega-Lite 5.17.0** - Grammar of graphics for data visualization
- **D3.js 7.9.0** - Data visualization library
- **Monaco Editor** - Code editor for JSON editing
- **TipTap** - Rich text editor for content creation

### Backend
- **PocketBase 0.26.1** - Backend-as-a-Service with Go
- **Go 1.19+** - Backend runtime
- **SQLite** - Embedded database
- **RESTful API** - REST API for data operations

## References

### Tools, Frameworks, and Libraries
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Material-UI](https://mui.com/) - React component library implementing Material Design
- [Vega-Lite](https://vega.github.io/vega-lite/) - Grammar of graphics for data visualization
- [D3.js](https://d3js.org/) - Data-driven document manipulation
- [PocketBase](https://pocketbase.io/) - Backend-as-a-Service with Go
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor for the web
- [TipTap](https://tiptap.dev/) - Headless rich text editor


## Support

For technical support or questions about VizCoach, please refer to the documentation in the `pocketbase/README.md` file or contact the development team.
