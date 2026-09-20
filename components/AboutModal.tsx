import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Linking } from 'react-native';
import { ThemeColors } from '../types/game';
import {
  APP_VERSION,
  APP_NAME,
  CONTACT_EMAIL,
  IMPRESSUM_URL,
  PRIVACY_POLICY_URL,
  REPO_URL,
  PLAY_STORE_URL,
} from '../utils/constants';
import { modalStyles } from '../styles/modalStyles';
import { Button } from './Button';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  t: {
    about: string;
    version: string;
    aboutDescription: string;
    impressum: string;
    privacyPolicy: string;
    sourceCode: string;
    playStoreLink: string;
    copyright: string;
    license: string;
    contact: string;
    ok: string;
  };
}

export function AboutModal({ visible, onClose, colors, t }: AboutModalProps) {
  const linkColor = colors.gradientPrimary?.[0] ?? '#4F46E5';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: colors.settingsMenu }]}>
          <View style={styles.aboutModalHeader}>
            <Text style={[modalStyles.title, { color: colors.text }]}>{t.about}</Text>
            <TouchableOpacity style={styles.aboutModalCloseButton} onPress={onClose}>
              <Text style={[styles.aboutModalCloseText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.aboutModalAppName, { color: colors.text }]}>{APP_NAME}</Text>
          <Text style={[styles.aboutModalInfoText, { color: colors.text }]}>
            {t.version} {APP_VERSION}
          </Text>
          <Text style={[styles.aboutModalInfoText, { color: colors.textSecondary }]}>
            {t.aboutDescription}
          </Text>
          <View style={styles.aboutModalDivider} />
          <TouchableOpacity onPress={() => Linking.openURL(IMPRESSUM_URL).catch(() => {})}>
            <Text style={[styles.aboutModalInfoText, { color: linkColor }]}>{t.impressum}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => {})}>
            <Text style={[styles.aboutModalInfoText, { color: linkColor }]}>{t.privacyPolicy}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(REPO_URL).catch(() => {})}>
            <Text style={[styles.aboutModalInfoText, { color: linkColor }]}>{t.sourceCode}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(PLAY_STORE_URL).catch(() => {})}>
            <Text style={[styles.aboutModalInfoText, { color: linkColor }]}>{t.playStoreLink}</Text>
          </TouchableOpacity>
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
            <Text style={[styles.aboutModalInfoText, { color: linkColor }]}>{t.contact}</Text>
          </TouchableOpacity>
          <Button label={t.ok} onPress={onClose} variant="primary" fullWidth colors={colors} />
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
