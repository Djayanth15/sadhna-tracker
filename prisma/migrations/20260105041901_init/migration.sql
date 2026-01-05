-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maxHoursLectures" DOUBLE PRECISION NOT NULL,
    "maxHoursReading" DOUBLE PRECISION NOT NULL,
    "maxHoursStudyWork" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_score" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mpAttendanceTime" TIMESTAMP(3),
    "mpAttendanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "japaCompletionTime" TIMESTAMP(3),
    "japaCompletionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lectureMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "readingMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sleepTime" TIMESTAMP(3),
    "sleepScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wakeTime" TIMESTAMP(3),
    "wakeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "studyWorkMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "restMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "restScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "filledSameDay" BOOLEAN NOT NULL DEFAULT false,
    "sameDayScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailySoulScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyBodyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_summary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "totalMpJapaScore" DOUBLE PRECISION NOT NULL,
    "lectureEffectiveScore" DOUBLE PRECISION NOT NULL,
    "readingEffectiveScore" DOUBLE PRECISION NOT NULL,
    "totalSoulScore" DOUBLE PRECISION NOT NULL,
    "totalDailyBodyScore" DOUBLE PRECISION NOT NULL,
    "studyWorkEffectiveScore" DOUBLE PRECISION NOT NULL,
    "totalBodyScore" DOUBLE PRECISION NOT NULL,
    "overallAverage" DOUBLE PRECISION NOT NULL,
    "daysRecorded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_goals_userId_key" ON "weekly_goals"("userId");

-- CreateIndex
CREATE INDEX "daily_score_userId_idx" ON "daily_score"("userId");

-- CreateIndex
CREATE INDEX "daily_score_date_idx" ON "daily_score"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_score_userId_date_key" ON "daily_score"("userId", "date");

-- CreateIndex
CREATE INDEX "weekly_summary_userId_idx" ON "weekly_summary"("userId");

-- CreateIndex
CREATE INDEX "weekly_summary_weekStart_idx" ON "weekly_summary"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_summary_userId_weekStart_key" ON "weekly_summary"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_score" ADD CONSTRAINT "daily_score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_summary" ADD CONSTRAINT "weekly_summary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
