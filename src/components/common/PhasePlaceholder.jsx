/**
 * PhasePlaceholder — an honest "not built yet" panel.
 *
 * Phase 1 builds the foundation, not screen content. Rather than ship
 * half-designed screens that look like finished work, each route states plainly
 * what it will become, which Stitch screen it maps to, and which assets it
 * will use.
 *
 * Every one of these is deleted during Phase 2.
 */
import { View, ScrollView } from 'react-native';
import { Text } from './Text';
import { Icon } from '../icons/Icon';
import { GlassSurface } from './GlassSurface';
import { StatPill } from './StatPill';
import { faction, role, surface } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

export function PhasePlaceholder({ screen, stitchScreen, components = [], assets = [], note }) {
  return (
    <ScrollView
      contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <GlassSurface over="void" style={{ padding: spacing.md, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.lg,
              backgroundColor: surface.containerHigh,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="view_in_ar" size={20} color={faction.p1} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="headline-sm" color={role.primary}>
              {screen}
            </Text>
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              Built in Phase 2
            </Text>
          </View>
        </View>

        {stitchScreen ? (
          <StatPill label={stitchScreen} icon="palette" color={faction.p2} tinted />
        ) : null}

        {note ? (
          <Text variant="body-sm" color={role.onSurfaceVariant}>
            {note}
          </Text>
        ) : null}
      </GlassSurface>

      {components.length > 0 ? (
        <GlassSurface style={{ padding: spacing.md, gap: spacing.sm }}>
          <Text variant="label-md" color={role.onSurfaceVariant}>
            Components to build
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {components.map((c) => (
              <StatPill key={c} label={c} size="sm" color={role.onSurface} />
            ))}
          </View>
        </GlassSurface>
      ) : null}

      {assets.length > 0 ? (
        <GlassSurface style={{ padding: spacing.md, gap: spacing.sm }}>
          <Text variant="label-md" color={role.onSurfaceVariant}>
            Stitch assets available
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {assets.map((a) => (
              <StatPill key={a} label={a} size="sm" color={faction.p1} tinted />
            ))}
          </View>
        </GlassSurface>
      ) : null}
    </ScrollView>
  );
}

export default PhasePlaceholder;
