import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const RedFlagAlert = () => {
  const [alert, setAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/anomaly-alert');
        const data = await response.json();
        if (data.success && data.alert) {
          setAlert(data.alert);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Alert check failed", error);
      }
    };

    // Har 10 seconds mein naye alerts check karega
    checkAlerts();
    const intervalId = setInterval(checkAlerts, 10000); 
    return () => clearInterval(intervalId);
  }, []);

  if (!alert || !isVisible) return null;

  return (
    <div className="bg-red-500 text-white px-4 py-3 shadow-lg flex items-center justify-between animate-pulse-slow">
      <div className="flex items-center gap-3">
        <AlertTriangle className="animate-bounce" size={24} />
        <div>
          <h4 className="font-bold text-sm tracking-wide">
            🚨 CRITICAL ANOMALY DETECTED: {alert.department.toUpperCase()} DEPARTMENT
          </h4>
          <p className="text-xs mt-0.5 text-red-100">{alert.alertMessage}</p>
        </div>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-red-200 hover:text-white transition-colors p-1"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default RedFlagAlert;