/**
 * Smoke tests for the Phase 1 primitives.
 *
 * Deliberately shallow — this is not an attempt at coverage. The point is to
 * prove the React Native testing path works end to end (jest-expo preset,
 * Babel/JSX transform, the chained Reanimated resolver, the native-module mocks
 * in tests/setup.js) so Phase 2 can write real screen tests without first
 * debugging the harness.
 *
 * The assertions that do matter are the design-system contracts: the uppercase
 * case rule, and Icon failing loudly on an unknown glyph rather than silently
 * rendering a blank box.
 *
 * NOTE: React Native Testing Library 14 made `render()` ASYNC for React 19
 * concurrent rendering — it returns a Promise, so every call must be awaited.
 * A forgotten `await` shows up as "getByRole is not a function", which is a
 * thoroughly misleading error; hence this note.
 */
import { render } from '@testing-library/react-native';

import { Text } from '../../src/components/common/Text';
import { StatPill, CurrencyChip } from '../../src/components/common/StatPill';
import { Icon } from '../../src/components/icons/Icon';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { formatDuration } from '../../src/components/common/CountdownTimer';
import { faction } from '../../src/theme/colors';

/** Flattens the style prop, which may be a nested array. */
function flatStyle(node) {
  const s = node.props.style;
  if (!Array.isArray(s)) return s ?? {};
  return Object.assign({}, ...s.flat(Infinity).filter(Boolean));
}

describe('Text', () => {
  it('renders its children', async () => {
    const { getByText } = await render(<Text variant="headline-lg">Ludo After Dark</Text>);
    expect(getByText('Ludo After Dark')).toBeTruthy();
  });

  it('applies the design-system uppercase rule to micro-labels', async () => {
    const { getByText } = await render(<Text variant="label-sm">your turn</Text>);
    expect(flatStyle(getByText('your turn')).textTransform).toBe('uppercase');
  });

  it('does not uppercase body text', async () => {
    const { getByText } = await render(<Text variant="body-md">Reinventing Ludo</Text>);
    expect(flatStyle(getByText('Reinventing Ludo')).textTransform).toBeUndefined();
  });

  it('rejects a variant that is not in the design system', async () => {
    await expect(render(<Text variant="made-up">x</Text>)).rejects.toThrow(
      /not a design-system style/
    );
  });
});

describe('Icon', () => {
  it('renders a bundled glyph', async () => {
    const { toJSON } = await render(<Icon name="casino" size={24} color={faction.p1} />);
    expect(toJSON()).toBeTruthy();
  });

  it('throws on a glyph that is not in the subset, rather than rendering blank', async () => {
    await expect(render(<Icon name="definitely_not_a_glyph" />)).rejects.toThrow(
      /not in the bundled subset/
    );
  });
});

describe('StatPill / CurrencyChip', () => {
  it('renders a label', async () => {
    const { getByText } = await render(<StatPill label="HOST" />);
    expect(getByText('HOST')).toBeTruthy();
  });

  it('renders a currency amount', async () => {
    const { getByText } = await render(<CurrencyChip kind="gems" amount="1,250" />);
    expect(getByText('1,250')).toBeTruthy();
  });
});

describe('ProgressBar', () => {
  it('exposes accessible progress', async () => {
    const { getByRole } = await render(<ProgressBar progress={0.69} />);
    expect(getByRole('progressbar').props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 69,
    });
  });

  it('clamps out-of-range values', async () => {
    const { getByRole } = await render(<ProgressBar progress={2.5} />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
  });
});

describe('formatDuration', () => {
  it('matches the formats the Stitch screens display', () => {
    expect(formatDuration(13318, 'hms')).toBe('03h 41m 58s');
    expect(formatDuration(22364, 'clock')).toBe('06:12:44');
    expect(formatDuration(963000, 'compact')).toBe('11D 3H');
    expect(formatDuration(8, 'seconds')).toBe('08');
  });

  it('never goes negative', () => {
    expect(formatDuration(-50, 'clock')).toBe('00:00:00');
  });
});
