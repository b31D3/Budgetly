import { useEffect, useState } from "react";

const MaintenanceMode = () => {
  const launchDate = new Date("2026-01-15T00:00:00");
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date();
    const difference = launchDate.getTime() - now.getTime();

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Reload the page when countdown reaches zero
      if (!newTimeLeft) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // If launch date has passed, return null (don't show maintenance mode)
  if (!timeLeft) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Budgetly
          </h1>
        </div>

        {/* Message */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            We're Launching Soon! 🚀
          </h2>
          <p className="text-gray-400 text-lg">
            Our website is currently under final preparations. We'll be live on{" "}
            <span className="text-primary font-semibold">January 15, 2026</span>
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-gray-700">
            <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
              {timeLeft.days}
            </div>
            <div className="text-gray-400 text-sm md:text-base">Days</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-gray-700">
            <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
              {timeLeft.hours}
            </div>
            <div className="text-gray-400 text-sm md:text-base">Hours</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-gray-700">
            <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
              {timeLeft.minutes}
            </div>
            <div className="text-gray-400 text-sm md:text-base">Minutes</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-gray-700">
            <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
              {timeLeft.seconds}
            </div>
            <div className="text-gray-400 text-sm md:text-base">Seconds</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-3">
            What to Expect
          </h3>
          <ul className="text-gray-400 space-y-2">
            <li>💰 Smart Budget Planning</li>
            <li>📊 Semester-by-Semester Cash Flow Analysis</li>
            <li>🎯 Scenario Simulations</li>
            <li>📈 Financial Insights & Analytics</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>Have questions? Contact us at{" "}
            <a
              href="mailto:beidemariamshumet@gmail.com"
              className="text-primary hover:underline"
            >
              beidemariamshumet@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
