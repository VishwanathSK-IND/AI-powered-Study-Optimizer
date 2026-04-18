

import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(initialMinutes = 25) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    if (!isRunning && secondsLeft > 0) {
      setIsRunning(true);
    }
  }, [isRunning, secondsLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((minutes = initialMinutes) => {
    setIsRunning(false);
    setSecondsLeft(minutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progress = 1 - secondsLeft / (initialMinutes * 60);

  return {
    display, progress, isRunning, totalElapsed,
    secondsLeft, start, pause, reset,
  };
}
