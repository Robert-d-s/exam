import { useEffect, useState, useRef } from "react";

const TimeTracker = () => {
  const [startTime, setStartTime] = useState<number>(0); // in milliseconds
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in milliseconds
  const [pauseOffset, setPauseOffset] = useState<number>(0); // in milliseconds
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setStartTime(Date.now() - pauseOffset); // If resuming, adjust start time based on pause offset
    } else {
      setPauseOffset(elapsedTime); // If pausing, store the elapsed time as pause offset
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, startTime]);

  return (
    <div>
      <button onClick={toggleTimer}>{isRunning ? "Stop" : "Start"}</button>
      <div>
        Elapsed Time: {new Date(elapsedTime).toISOString().substr(11, 8)}
      </div>
    </div>
  );
};

export default TimeTracker;
