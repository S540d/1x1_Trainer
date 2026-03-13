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
  };
}

export function AboutModal({ visible, onClose, colors, t }: AboutModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
          <View style={styles.aboutModalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.about}</Text>
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
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
          >
            <Text style={[styles.aboutModalInfoText, { color: '#4F46E5' }]}>
              {t.contact}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.restartButton}
            onPress={onClose}
          >
            <Text style={styles.restartButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  restartButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
