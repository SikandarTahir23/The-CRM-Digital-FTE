import { useState, useEffect, useRef } from 'react';

interface UseCounterOptions {
  duration?: number;
  delay?: number;
  startOnMount?: boolean;
}

export function useCounter(
  end: number,
  { duration = 1500, delay = 0, startOnMount = true }: UseCounterOptions = {}
) {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(startOnMount);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isRunning) return;

    const timeout = setTimeout(() => {
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [end, duration, delay, isRunning]);

  const start = () => setIsRunning(true);
  const reset = () => {
    setCount(0);
    setIsRunning(false);
  };

  return { count, start, reset, isRunning };
}
