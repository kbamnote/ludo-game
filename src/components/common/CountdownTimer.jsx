/**
 * CountdownTimer — tabular countdown used by the Home tournament card, the
 * store flash deals, the leaderboard season banner and the in-match turn timer.
 *
 * Ticks on a single interval and formats to the requested shape. Tabular
 * figures are mandatory here: without them the digits change width as they
 * count and the whole row jitters once per second.
 *
 * `onComplete` fires once, when the clock reaches zero.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Text } from './Text';
import { role } from '../../theme/colors';

function pad(n) {
  return String(n).padStart(2, '0');
}

export function formatDuration(totalSeconds, format = 'hms') {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  switch (format) {
    case 'clock': // 06:12:44
      return `${pad(Math.floor(s / 3600))}:${pad(minutes)}:${pad(seconds)}`;
    case 'compact': // 11D 4H
      return days > 0 ? `${days}D ${hours}H` : `${hours}H ${pad(minutes)}M`;
    case 'short': // 1d 14h left
      return days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`;
    case 'seconds': // 08
      return pad(s);
    case 'hms': // 03h 41m 58s
    default:
      return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
}

export function useCountdown(seconds, { running = true, onComplete } = {}) {
  const [remaining, setRemaining] = useState(seconds);

  // React's documented "adjust state when a prop changes" pattern. Doing this
  // during render rather than in an effect avoids the extra commit — and the
  // cascading re-render that `setState` inside an effect would cause.
  const [prevSeconds, setPrevSeconds] = useState(seconds);
  if (seconds !== prevSeconds) {
    setPrevSeconds(seconds);
    setRemaining(seconds);
  }

  const completed = useRef(false);
  // Wall-clock deadline, so backgrounding the app does not freeze the clock.
  // Date.now() is impure, so it is only ever read inside an effect or a
  // timer callback — never during render.
  const deadline = useRef(null);

  useEffect(() => {
    deadline.current = Date.now() + seconds * 1000;
    completed.current = false;

    if (!running) return undefined;

    const tick = () => {
      const left = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !completed.current) {
        completed.current = true;
        onComplete?.();
      }
    };

    const id = setInterval(tick, 1000);
    // Resync on foreground: intervals do not run reliably while backgrounded,
    // so without this the displayed value would be stale on return.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') tick();
    });

    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [seconds, running, onComplete]);

  return remaining;
}

export function CountdownTimer({
  seconds,
  format = 'hms',
  variant = 'label-md',
  color = role.onSurface,
  running = true,
  onComplete,
  style,
}) {
  const remaining = useCountdown(seconds, { running, onComplete });

  return (
    <Text variant={variant} color={color} numeric style={style}>
      {formatDuration(remaining, format)}
    </Text>
  );
}

export default CountdownTimer;
