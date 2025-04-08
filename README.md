# Daily Grind ☕

> *Brewing better tickets, one sprint at a time*

DailyGrind is an open-source ticket tracking system designed specifically for Scrum teams who want a lightweight, intuitive solution that actually follows agile principles. Unlike overly complex enterprise tools, DailyGrind focuses on what matters: helping teams collaborate effectively while maintaining agile best practices.

![DailyGrind Banner](assets/dailygrind-banner.png)

## ✨ Features (planned)

- **Backlog Brewing** - Intuitive product backlog management with drag-and-drop prioritization
- **Sprint Espresso** - Streamlined sprint planning and execution
- **Story Cups** - Flexible user story management with customizable fields
- **Burndown Beans** - Real-time burndown and velocity charts
- **Retro Roast** - Built-in tools for effective sprint retrospectives
- **Daily Pour-over** - Simplified daily standup facilitation
- **Team Blend** - Customizable team views and workload management
- **Caffeinated API** - Comprehensive API for integration with your existing tools
- **Fresh Filters** - Advanced search and filtering capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js (>=14.0.0)
- npm or yarn package manager
- Firebase account and project
- Firebase CLI (`npm install -g firebase-tools`)
- Valid Firebase configuration (see FIREBASE-SETUP.md for details)

### Installation

```bash
# Clone the repository
git clone https://github.com/risadams/dailygrind.git

# Navigate to project directory
cd dailygrind

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start
