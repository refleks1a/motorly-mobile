import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Calendar, ChevronRight, Newspaper } from 'lucide-react-native';

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  category: string;
  url?: string;
  onPress?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  excerpt,
  imageUrl,
  date,
  category,
  onPress,
}) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Newspaper size={36} color={Colors.onSurfaceVariant} strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={Colors.onSurfaceVariant} strokeWidth={2} />
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={2}>
          {excerpt}
        </Text>
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>Read more</Text>
          <ChevronRight size={16} color={Colors.primary} strokeWidth={2} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerLow,
    marginRight: Spacing.lg,
    width: 320, // fixed width for horizontal sliding
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceContainerLow,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  categoryText: {
    color: Colors.onPrimary,
    fontSize: Typography.labelSm,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontBody,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: Spacing.lg,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  dateText: {
    fontSize: Typography.labelSm,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  title: {
    fontSize: Typography.titleMd,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    marginBottom: Spacing.xs,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.primary,
  },
});
