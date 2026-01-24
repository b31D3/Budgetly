import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      const analyticsInstance = await analytics;
      if (analyticsInstance) {
        logEvent(analyticsInstance, "page_view", {
          page_path: location.pathname,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    };

    trackPageView();
  }, [location]);

  return null;
};

export default AnalyticsTracker;
