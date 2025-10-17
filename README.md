# 50PS Xerox Pro

A modern printing and government services website built with React and Vite.

## Features

- Responsive design with Tailwind CSS
- Print service ordering system
- Telegram integration for order notifications
- Routing between main site and print service

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd 50psxerox
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

### Running the Telegram Proxy Server

```bash
npm start
```

The proxy server will be available at `http://localhost:3000`.

## Project Structure

```
50psxerox/
├── components/
│   ├── Home.jsx          # Main landing page
│   └── PrintService.jsx  # Print service ordering page
├── print/
│   ├── TelegramService.js # Telegram integration
│   └── index.html         # Legacy print service page
├── App.jsx               # Main App component
├── main.jsx              # React entry point
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
└── package.json          # Project dependencies and scripts
```

## Technologies Used

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Router](https://reactrouter.com/) - Declarative routing for React
- [Express](https://expressjs.com/) - Web framework for Node.js
- [Telegram Bot API](https://core.telegram.org/bots/api) - Telegram bot integration

## License

This project is licensed under the MIT License.