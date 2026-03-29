import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Badge } from './Badge';
import { Club } from '../types';
import { colors, fontSize, fontWeight, spacing } from '../lib/theme';

interface ClubCardProps {
  club: Club;
  onPress?: () => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onPress }) => {
  const handleCall = () => {
    if (club.phone) {
      Linking.openURL(`tel:${club.phone.replace(/\s/g, '')}`);
    }
  };

  return (
    <Card onPress={onPress} variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="tennisball" size={24} color={colors.green} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {club.name}
          </Text>
          <Badge
            label={`${club.courts_count} terrain${club.courts_count > 1 ? 's' : ''}`}
            variant="green"
            size="sm"
          />
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.grayText} />
          <Text style={styles.detailText} numberOfLines={2}>
            {club.address}
          </Text>
        </View>

        {club.phone && (
          <TouchableOpacity onPress={handleCall} style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={colors.green} />
            <Text style={[styles.detailText, styles.phoneText]}>
              {club.phone}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {club.description && (
        <Text style={styles.description} numberOfLines={2}>
          {club.description}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.black,
    flex: 1,
  },
  details: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.grayText,
    flex: 1,
    lineHeight: 20,
  },
  phoneText: {
    color: colors.green,
    fontWeight: fontWeight.medium,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.grayMedium,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
