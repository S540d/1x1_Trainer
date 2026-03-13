import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import { ThemeColors } from '../types/game';
import { APP_VERSION, APP_NAME, CONTACT_EMAIL } from '../utils/constants';
import { modalStyles } from '../styles/modalStyles';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  t: {
    about: string;
    version: string;
    aboutDescription: string;
    copyright: string;
    license: string;
    contact: string;
    ok: string;
  };
}

export function AboutModal({ visible, onClose, colors, t }: AboutModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: colors.settingsMenu }]}>
          <View style={styles.aboutModalHeader}>
            <Text style={[modalStyles.title, { color: colors.text }]}>{t.about}</Text>
            <TouchableOpacity
              style={styles.aboutModalCloseButton}
              onPress={onClose}
            >
              <Text style={[styles.aboutModalCloseText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.aboutModalAppName, { color: colors.text }]}>
            {APP_NAME}
          </Text>
          <Text style={[styles.aboutModalInfoText, { color: colors.text }]}>
            {t.version} {APP_VERSION}
          </Text>
          <Text style={[styles.aboutModalInfoText, { color: colors.textSecondary }]}>
            {t.aboutDescription}
          </Text>
          <View style={styles.aboutModalDivider} />
          <Text style={[styles.aboutModalInfoText, { color: colors.textSecondary }]}>
            {t.copyright}
          </Text>
          <Text style={[styles.aboutModalInfoText, { color: colors.textSecondary }]}>
            {t.license}
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})}
          >
            <Text style={[styles.aboutModalInfoText, { color: '#4F46E5' }]}>
              {t.contact}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modalStyles.primaryButton}
            onPress={onClose}
          >
            <Text style={modalStyles.primaryButtonText}>{t.ok}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  aboutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutModalCloseButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutModalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  aboutModalAppName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aboutModalInfoText: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 20,
  },
  aboutModalDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
    marginVertical: 8,
  },
});
