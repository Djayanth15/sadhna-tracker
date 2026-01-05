# Sadna Tracker

A comprehensive Body & Soul wellness tracking application built with Next.js, Prisma, and PostgreSQL.

## Features

- 🎯 **Goal Setting**: Set weekly targets for lectures, reading, and study/work hours
- 📊 **Daily Tracking**: Track daily spiritual (MP attendance, Japa) and physical wellness metrics
- 📈 **Weekly Summaries**: Automatic weekly score calculation with detailed breakdowns
- 👥 **Admin Dashboard**: View all users' progress and weekly summaries
- 🌓 **Dark Mode**: Built-in theme toggle
- 📱 **Responsive Design**: Mobile-first responsive UI

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Better-Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/sadna-tracker.git
cd sadna-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sadna_tracker"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

The app uses the following main models:

- **User**: User accounts with authentication
- **WeeklyGoals**: User's weekly targets
- **DailyScore**: Daily wellness tracking entries
- **WeeklySummary**: Calculated weekly summaries

## Scoring System

### Soul Score (out of 440 points per week)

- MP Attendance: 20 pts (by 4:30 AM), 5 pts (4:30-4:35 AM)
- Japa Completion: 20 pts (by 9 AM), 10 pts (by 12 PM)
- Lectures: Up to 100 pts based on weekly goal completion
- Reading: Up to 60 pts based on weekly goal completion

### Body Score (out of 595 points per week)

- Sleep Time: 20 pts (by 9:15 PM), 10 pts (by 10 PM)
- Wake Time: 20 pts (by 3:40 AM), 10 pts (by 4:15 AM)
- Rest: 20 pts (<30 min), 10 pts (<60 min)
- Study/Work: Up to 140 pts based on weekly goal completion
- Same Day Entry: 5 pts bonus

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
