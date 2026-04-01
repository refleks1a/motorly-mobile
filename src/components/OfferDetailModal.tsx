import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import {
  X,
  MapPin,
  Phone,
  Calendar,
  Tag,
  Share2,
  Bookmark,
  MessageSquare,
  Globe,
} from 'lucide-react-native';
import { PrimaryButton } from './PrimaryButton';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export interface OfferDetail {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  backgroundColor: string;
  // Detailed fields
  description: string;
  validUntil: string;
  shopName: string;
  shopLocation: string;
  shopPhone?: string;
  shopInstagram?: string;
  shopFacebook?: string;
  terms: string;
}

interface OfferDetailModalProps {
  visible: boolean;
  onClose: () => void;
  offer: OfferDetail | null;
  onClaim?: () => void;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  visible,
  onClose,
  offer,
  onClaim,
}) => {
  if (!offer) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCallShop = () => {
    if (offer.shopPhone) {
      Linking.openURL(`tel:${offer.shopPhone}`).catch(() => {
        Alert.alert('Error', 'Could not make a call');
      });
    }
  };

  const handleOpenInstagram = () => {
    if (offer.shopInstagram) {
      const instagramUrl = offer.shopInstagram.startsWith('@')
        ? `https://instagram.com/${offer.shopInstagram.substring(1)}`
        : offer.shopInstagram;
      Linking.openURL(instagramUrl).catch(() => {
        Alert.alert('Error', 'Could not open Instagram');
      });
    }
  };

  const handleOpenFacebook = () => {
    if (offer.shopFacebook) {
      const facebookUrl = offer.shopFacebook.includes('facebook.com')
        ? offer.shopFacebook
        : `https://facebook.com/${offer.shopFacebook}`;
      Linking.openURL(facebookUrl).catch(() => {
        Alert.alert('Error', 'Could not open Facebook');
      });
    }
  };

  const handleShare = () => {
    const shareText = `Check out this offer: ${offer.title} at ${offer.shopName}! ${offer.description}`;
    Alert.alert('Share Offer', 'Share functionality would open native share dialog');
  };

  const handleSave = () => {
    Alert.alert('Saved', 'Offer saved to your favorites');
  };

  const handleClaim = () => {
    if (onClaim) {
      onClaim();
    } else {
      Alert.alert('Offer Claimed', 'Your offer has been claimed successfully!');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Offer Details</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={24} color={Colors.onSurfaceVariant} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Offer Badge */}
            <View style={[styles.badgeContainer, { backgroundColor: offer.backgroundColor }]}>
              <View style={styles.badgeRow}>
                <Tag size={16} color={Colors.onBackground} strokeWidth={2} />
                <Text style={styles.badgeText}>{offer.badge}</Text>
              </View>
            </View>

            {/* Offer Title */}
            <Text style={styles.title}>{offer.title}</Text>
            <Text style={styles.subtitle}>{offer.subtitle}</Text>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{offer.description}</Text>
            </View>

            {/* Validity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Valid Until</Text>
              <View style={styles.validityRow}>
                <Calendar size={18} color={Colors.onSurfaceVariant} />
                <Text style={styles.validityText}>{formatDate(offer.validUntil)}</Text>
              </View>
            </View>

            {/* Shop Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shop Information</Text>
              
              <View style={styles.shopInfoRow}>
                <MapPin size={18} color={Colors.onSurfaceVariant} />
                <Text style={styles.shopInfoText}>{offer.shopLocation}</Text>
              </View>

              {offer.shopPhone && (
                <TouchableOpacity style={styles.shopInfoRow} onPress={handleCallShop}>
                  <Phone size={18} color={Colors.primary} />
                  <Text style={[styles.shopInfoText, styles.clickableText]}>{offer.shopPhone}</Text>
                </TouchableOpacity>
              )}

              {/* Social Media */}
              {(offer.shopInstagram || offer.shopFacebook) && (
                <View style={styles.socialMediaContainer}>
                  <Text style={styles.socialMediaLabel}>Follow on:</Text>
                  <View style={styles.socialMediaButtons}>
                    {offer.shopInstagram && (
                      <TouchableOpacity
                        style={styles.socialMediaButton}
                        onPress={handleOpenInstagram}
                      >
                        <MessageSquare size={20} color={Colors.primary} />
                        <Text style={styles.socialMediaText}>Instagram</Text>
                      </TouchableOpacity>
                    )}
                    {offer.shopFacebook && (
                      <TouchableOpacity
                        style={styles.socialMediaButton}
                        onPress={handleOpenFacebook}
                      >
                        <Globe size={20} color={Colors.primary} />
                        <Text style={styles.socialMediaText}>Facebook</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Terms & Conditions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
              <Text style={styles.terms}>{offer.terms}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
                <Share2 size={20} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSave}>
                <Bookmark size={20} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Claim Button */}
          <View style={styles.footer}>
            <PrimaryButton
              title={offer.buttonLabel}
              onPress={handleClaim}
              style={styles.claimButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  headerTitle: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badgeText: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Typography.headlineMd,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    marginBottom: Spacing.xs,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  validityText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  shopInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  shopInfoText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  clickableText: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  socialMediaContainer: {
    marginTop: Spacing.md,
  },
  socialMediaLabel: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  socialMediaButtons: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  socialMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
  },
  socialMediaText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.primary,
    fontWeight: Typography.weightMedium,
  },
  terms: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
  },
  secondaryButtonText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.primary,
    fontWeight: Typography.weightMedium,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.background,
  },
  claimButton: {
    width: '100%',
  },
});