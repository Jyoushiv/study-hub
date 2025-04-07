# Productivity Hub

A modern, full-featured productivity website with a Pomodoro timer, interactive flowchart editor, and timetable planner.

## Features

- **Pomodoro Timer**: Track your work sessions with a customizable timer featuring start, pause, and reset functionality
- **Flowchart Editor**: Visually plan projects using draggable and connectable blocks
- **Timetable Planner**: Organize your schedule with daily and weekly views and editable time slots
- **Color Scheme Customization**: Choose from multiple themes to personalize your experience
- **Responsive Design**: Works seamlessly on all devices from mobile to desktop

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/productivity-hub.git
cd productivity-hub
```

2. Install dependencies
```bash
pnpm install
```

3. Start the development server
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment on Vercel

This project is configured for easy deployment on Vercel. Follow these steps to deploy:

1. Push your code to a GitHub repository

2. Visit [Vercel](https://vercel.com) and sign in with your GitHub account

3. Click "New Project" and import your repository

4. Configure the project with these settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: pnpm build
   - Output Directory: .next

5. Click "Deploy" and wait for the build to complete

6. Once deployed, Vercel will provide you with a URL to access your application

### Alternative Deployment Method

You can also deploy directly from the command line:

1. Install the Vercel CLI
```bash
npm install -g vercel
```

2. Login to Vercel
```bash
vercel login
```

3. Deploy the project
```bash
vercel
```

4. Follow the prompts to complete the deployment

## Project Structure

```
productivity-hub/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   │   ├── flowchart/  # Flowchart editor components
│   │   ├── pomodoro/   # Pomodoro timer components
│   │   ├── theme/      # Theme provider and selector
│   │   └── timetable/  # Timetable planner components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utility functions
├── .gitignore          # Git ignore file
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── tsconfig.json       # TypeScript configuration
```

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS

## License

This project is licensed under the MIT License - see the LICENSE file for details.
