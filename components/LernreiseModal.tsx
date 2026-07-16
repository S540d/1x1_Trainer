import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemeColors, RowMastery, RowMasteryStatus } from '../types/game';
import { DESIGN_TOKENS } from '../utils/constants';
import { getRowMastery, isRowUnlocked } from '../utils/storage';
import { modalStyles } from '../styles/modalStyles';

interface LernreiseModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRow: (row: number) => void;
  colors: ThemeColors;
  profileId?: string;
  t: {
    lernreiseTitle: string;
    lernreiseSubtitle: string;
    lernreiseRowLabel: string;
    ok: string;
  };
}

const STATUS_EMOJI: Record<RowMasteryStatus, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
};

export function LernreiseModal({
  visible,
  onClose,
  onSelectRow,
  colors,
  profileId,
  t,
}: LernreiseModalProps) {
  const [mastery, setMastery] = useState<RowMastery[]>([]);

  useEffect(() => {
    if (visible) {
      getRowMastery(profileId).then(setMastery);
    }
  }, [visible, profileId]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.settingsMenu }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{t.lernreiseTitle}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t.lernreiseSubtitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.mapScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.mapGrid}>
              {mastery.map((m) => {
                const unlocked = isRowUnlocked(mastery, m.row);
                const icon = !unlocked ? '🔒' : m.status ? STATUS_EMOJI[m.status] : '▶';
                return (
                  <TouchableOpacity
                    key={m.row}
                    disabled={!unlocked}
                    onPress={() => {
                      onClose();
                      onSelectRow(m.row);
                    }}
                    style={[
                      styles.rowNode,
                      { borderColor: colors.border, backgroundColor: colors.card },
                      !unlocked && styles.rowNodeLocked,
                    ]}
                  >
                    <Text style={styles.rowNodeIcon}>{icon}</Text>
                    <Text
                      style={[
                        styles.rowNodeLabel,
                        { color: unlocked ? colors.text : colors.textSecondary },
                      ]}
                    >
                      {t.lernreiseRowLabel.replace('{row}', m.row.toString())}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.gradientPrimary[0] }]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>{t.ok}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 420,
    maxHeight: '88%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  mapScroll: {
    maxHeight: 440,
    marginBottom: 12,
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowNode: {
    width: '31%',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  rowNodeLocked: {
    opacity: 0.5,
  },
  rowNodeIcon: {
    fontSize: 24,
  },
  rowNodeLabel: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  closeBtn: {
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
});
