'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Calendar,
  Target,
  TrendingUp,
  Sparkles,
  Heart,
  BookOpen,
} from 'lucide-react';

const quotes = [
  {
    text: 'If we are serious about spiritual life, we should chant a prescribed number of rounds daily and regularly follow the regulative principles.',
    author: 'Srila Prabhupada',
    book: 'The Science of Self-Realization',
  },
  {
    text: "Sadhana is not just a ritual; it's an expression of love and gratitude to the Divine.",
    author: 'HH Radhanath Swami Maharaj',
  },
  {
    text: 'The real taste of bhakti comes through regulated spiritual practice. Without sadhana, there is no advancement.',
    author: 'Srila Prabhupada',
  },
  {
    text: 'The quality of our spiritual life depends upon the quality of our sadhana.',
    author: 'HH Radhanath Swami Maharaj',
  },
  {
    text: 'Chanting is the greatest benediction for humanity. It cleanses the heart and awakens dormant love for Krishna.',
    author: 'Srila Prabhupada',
    book: 'Teachings of Lord Caitanya',
  },
  {
    text: 'Spiritual life means developing our relationship with Krishna through systematic practice and discipline.',
    author: 'HH Bhakti Charu Swami Maharaj',
  },
  {
    text: 'Real spiritual progress means we are becoming more humble, more compassionate, and more eager to serve.',
    author: 'HH Radhanath Swami Maharaj',
  },
  {
    text: "Rising early for mangala-arati is a spiritual warrior's first victory of the day.",
    author: 'HH Bhakti Tirtha Swami Maharaj',
  },
  {
    text: 'By daily hearing and chanting about Krishna, one is enabled to conquer the mad elephant of the mind.',
    author: 'Srila Prabhupada',
    book: 'Srimad-Bhagavatam',
  },
  {
    text: 'Through consistent spiritual practice, we can transform our consciousness and awaken our eternal nature.',
    author: 'HH Radhanath Swami Maharaj',
  },
];

export default function HomePage() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 10000);

    return () => {
      clearTimeout(visibilityTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950'>
      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

        {/* Floating Elements - Mobile Optimized */}
        <div className='absolute top-10 left-5 sm:top-20 sm:left-10 w-40 h-40 sm:w-72 sm:h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob'></div>
        <div className='absolute top-20 right-5 sm:top-40 sm:right-10 w-40 h-40 sm:w-72 sm:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000'></div>
        <div className='absolute -bottom-8 left-10 sm:left-20 w-40 h-40 sm:w-72 sm:h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000'></div>

        {/* Main Content */}
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-32'>
          {/* Header */}
          <div
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            <div className='inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full'>
              <Sparkles className='w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400' />
              <span className='text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-300'>
                Track Your Spiritual Journey
              </span>
            </div>

            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight px-4'>
              Sadhna Tracker
            </h1>

            <p className='text-base sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4'>
              Transform your spiritual practice with mindful tracking of your
              daily sadhana
            </p>

            {/* CTA Buttons - Mobile Optimized */}
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 mb-12 sm:mb-16'>
              <Link href='/sign-up' className='w-full sm:w-auto'>
                <Button
                  size='lg'
                  className='group w-full sm:w-auto relative px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
                >
                  Get Started Free
                  <ArrowRight className='ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform' />
                </Button>
              </Link>

              <Link href='/sign-in' className='w-full sm:w-auto'>
                <Button
                  size='lg'
                  variant='outline'
                  className='w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Quote Carousel - Mobile Optimized */}
          <Card className='max-w-4xl mx-auto mb-12 sm:mb-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-0'>
            <CardContent className='p-6 sm:p-8 md:p-12'>
              <div className='relative min-h-[160px] sm:min-h-[140px] flex items-center justify-center'>
                <div
                  key={currentQuote}
                  className='animate-fade-in text-center px-2'
                >
                  <div className='mb-4 sm:mb-6'>
                    <Heart className='w-8 h-8 sm:w-10 sm:h-10 mx-auto text-orange-500 dark:text-orange-400 mb-3 sm:mb-4' />
                  </div>
                  <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-200 italic mb-3 sm:mb-4 leading-relaxed'>
                    &ldquo;{quotes[currentQuote].text}&rdquo;
                  </p>
                  <p className='text-sm sm:text-base text-orange-600 dark:text-orange-400 font-semibold mb-1'>
                    &mdash; {quotes[currentQuote].author}
                  </p>
                  {quotes[currentQuote].book && (
                    <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1'>
                      <BookOpen className='w-3 h-3 sm:w-4 sm:h-4' />
                      {quotes[currentQuote].book}
                    </p>
                  )}
                </div>
              </div>

              {/* Quote Indicators */}
              <div className='flex flex-wrap justify-center gap-2 mt-4 sm:mt-6'>
                {quotes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuote(index)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      index === currentQuote
                        ? 'w-6 sm:w-8 bg-orange-600 dark:bg-orange-400'
                        : 'w-1.5 sm:w-2 bg-gray-300 dark:bg-gray-600 hover:bg-orange-400'
                    }`}
                    aria-label={`Go to quote ${index + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Grid - Mobile Optimized */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4'>
            <Card className='group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0'>
              <CardContent className='p-6 sm:p-8 text-center'>
                <div className='inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-4 group-hover:scale-110 transition-transform'>
                  <Calendar className='w-7 h-7 sm:w-8 sm:h-8' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2'>
                  Daily Tracking
                </h3>
                <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300'>
                  Track your MP attendance, japa rounds, reading, and more every
                  day
                </p>
              </CardContent>
            </Card>

            <Card className='group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0'>
              <CardContent className='p-6 sm:p-8 text-center'>
                <div className='inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-white mb-4 group-hover:scale-110 transition-transform'>
                  <Target className='w-7 h-7 sm:w-8 sm:h-8' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2'>
                  Set Goals
                </h3>
                <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300'>
                  Define your weekly spiritual and personal development targets
                </p>
              </CardContent>
            </Card>

            <Card className='group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 sm:col-span-2 md:col-span-1'>
              <CardContent className='p-6 sm:p-8 text-center'>
                <div className='inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white mb-4 group-hover:scale-110 transition-transform'>
                  <TrendingUp className='w-7 h-7 sm:w-8 sm:h-8' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2'>
                  Track Progress
                </h3>
                <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300'>
                  View weekly summaries and monitor your spiritual growth over
                  time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom CTA - Mobile Optimized */}
      <div className='relative py-12 sm:py-20 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4'>
            Begin Your Journey Today
          </h2>
          <p className='text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-4'>
            Join devotees worldwide in cultivating a consistent and meaningful
            spiritual practice
          </p>
          <Link href='/sign-up' className='inline-block w-full sm:w-auto px-4'>
            <Button
              size='lg'
              className='w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
            >
              Start Tracking Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer - Mobile Optimized */}
      <div className='border-t border-gray-200 dark:border-gray-700 py-6 sm:py-8 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
            Hare Krishna! May your spiritual journey be filled with devotion and
            dedication.
          </p>
          <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2'>
            &ldquo;Chant Hare Krishna and be happy!&rdquo; &mdash; Srila
            Prabhupada
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(
            circle,
            rgba(0, 0, 0, 0.1) 1px,
            transparent 1px
          );
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
