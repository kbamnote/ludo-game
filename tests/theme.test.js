/**
 * Guards the design-token contract.
 *
 * These are not busywork: the whole Phase 2 plan depends on the Stitch tokens
 * and the Tailwind mirror staying in agreement. If someone edits one and not
 * the other, Phase 2 screens drift from the design silently. This catches it.
 */
import { faction, role, surface } from '../src/theme/colors';
import { textStyles } from '../src/theme/typography';
import { spacing, radii } from '../src/theme/spacing';
import { compactNumber, percent, roomCode, winRate } from '../src/utils/format';

const tailwind = require('../tailwind.config.js');

describe('design tokens', () => {
  it('carries the four faction colours from the written design system', () => {
    expect(faction).toEqual({
      p1: '#00FF87',
      p2: '#00F0FF',
      p3: '#FF007A',
      p4: '#8B5CF6',
    });
  });

  it('uses the Stitch void canvas as the true base surface', () => {
    expect(surface.void).toBe('#0A0B10');
  });

  it('matches the Stitch Material role tokens', () => {
    expect(role.primaryContainer).toBe('#00ff87');
    expect(role.secondaryContainer).toBe('#00eefc');
    expect(role.onSurface).toBe('#e3e1e9');
  });

  it('defines all ten design-system type styles', () => {
    expect(Object.keys(textStyles)).toEqual([
      'display-hero',
      'headline-lg',
      'headline-md',
      'headline-sm',
      'body-lg',
      'body-md',
      'body-sm',
      'label-lg',
      'label-md',
      'label-sm',
    ]);
  });

  it('forces uppercase on the micro-label styles, per the case rule', () => {
    expect(textStyles['label-sm'].uppercase).toBe(true);
    expect(textStyles['label-md'].uppercase).toBe(true);
    expect(textStyles['body-md'].uppercase).toBeUndefined();
  });

  it('keeps spacing on the 4px base', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.margin).toBe(16);
    expect(spacing.gutter).toBe(12);
  });

  it('uses pill radius for interactive social mechanics', () => {
    expect(radii.full).toBe(9999);
  });
});

describe('theme / tailwind mirror', () => {
  const tw = tailwind.theme.extend;

  it('agrees with theme.js on the faction colours', () => {
    expect(tw.colors['faction-p1']).toBe(faction.p1);
    expect(tw.colors['faction-p2']).toBe(faction.p2);
    expect(tw.colors['faction-p3']).toBe(faction.p3);
    expect(tw.colors['faction-p4']).toBe(faction.p4);
  });

  it('agrees on the void canvas', () => {
    expect(tw.colors.void).toBe(surface.void);
  });

  it('exposes every type style as a Tailwind fontSize', () => {
    for (const name of Object.keys(textStyles)) {
      expect(tw.fontSize[name]).toBeDefined();
    }
  });

  it('exposes the named spacing tokens', () => {
    expect(tw.spacing.margin).toBe('1rem');
    expect(tw.spacing.gutter).toBe('0.75rem');
    expect(tw.spacing['space-xs']).toBe('0.25rem');
  });
});

describe('formatting', () => {
  it('compacts large counters the way the design shows them', () => {
    expect(compactNumber(48200)).toBe('48.2K');
    expect(compactNumber(1250)).toBe('1,250');
    expect(compactNumber(2418920)).toBe('2.4M');
    expect(compactNumber(1000000)).toBe('1M');
  });

  it('formats percentages, room codes and win rates', () => {
    expect(percent(0.684)).toBe('68.4%');
    expect(roomCode('7709')).toBe('#7709');
    expect(roomCode('#7709')).toBe('#7709');
    expect(winRate(281, 412)).toBe('68.2% WR');
    expect(winRate(0, 0)).toBe('0% WR');
  });
});
