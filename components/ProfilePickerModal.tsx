import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChildProfile, ThemeColors } from '../types/game';
import { AVATAR_COLORS } from '../utils/constants';
import { createProfile, deleteProfileData, saveProfiles, getProfiles } from '../utils/storage';

const MAX_PROFILES = 6;

interface ProfilePickerModalProps {
  visible: boolean;
  // When false, the modal can't be dismissed without picking a profile —
  // used to force the "who is playing?" choice on app start.
  dismissible?: boolean;
  onClose: () => void;
  profiles: ChildProfile[];
  activeProfileId: string | undefined;
  onSwitchProfile: (profile: ChildProfile) => void;
  onProfilesChange: (profiles: ChildProfile[]) => void;
  colors: ThemeColors;
  t: {
    profiles: string;
    profilesSubtitle: string;
    addProfile: string;
    createProfile: string;
    profileNamePlaceholder: string;
    saveProfile: string;
    cancel: string;
    deleteProfile: string;
    deleteProfileConfirm: string;
    maxProfilesReached: string;
    profileActive: string;
  };
}

export function ProfilePickerModal({
  visible,
  dismissible = true,
  onClose,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onProfilesChange,
  colors,
  t,
}: ProfilePickerModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(AVATAR_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    if (!dismissible) return;
    setShowCreateForm(false);
    setNewName('');
    setSelectedColor(AVATAR_COLORS[0]);
    onClose();
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await createProfile(trimmed, selectedColor);
      const updated = await getProfiles();
      onProfilesChange(updated);
      setShowCreateForm(false);
      setNewName('');
      setSelectedColor(AVATAR_COLORS[0]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (profile: ChildProfile) => {
    if (profiles.length <= 1) return;
    Alert.alert(t.deleteProfile, `"${profile.name}" — ${t.deleteProfileConfirm}`, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.deleteProfile,
        style: 'destructive',
        onPress: async () => {
          await deleteProfileData(profile.id);
          const remaining = profiles.filter((p) => p.id !== profile.id);
          await saveProfiles(remaining);
          onProfilesChange(remaining);
        },
      },
    ]);
  };

  const activeColor = colors.gradientPrimary[0];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.settingsMenu }]}>
          {/* Header */}
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>{t.profiles}</Text>
            {dismissible && (
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.profilesSubtitle}
          </Text>

          <ScrollView bounces={false} style={styles.list}>
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              return (
                <View key={profile.id} style={[styles.profileRow, { borderColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.profileInfo}
                    onPress={() => !isActive && onSwitchProfile(profile)}
                    activeOpacity={isActive ? 1 : 0.7}
                  >
                    <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
                      <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.profileTextBlock}>
                      <Text style={[styles.profileName, { color: colors.text }]}>
                        {profile.name}
                      </Text>
                      {isActive && (
                        <Text style={[styles.activeLabel, { color: activeColor }]}>
                          {t.profileActive}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  {profiles.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(profile)}
                    >
                      <Text style={[styles.deleteButtonText, { color: colors.textSecondary }]}>
                        🗑
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Create form or Add button */}
          {showCreateForm ? (
            <View style={[styles.createForm, { borderTopColor: colors.border }]}>
              <Text style={[styles.createTitle, { color: colors.text }]}>{t.createProfile}</Text>
              <TextInput
                style={[
                  styles.nameInput,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
                ]}
                placeholder={t.profileNamePlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
                maxLength={20}
                autoFocus
              />
              <View style={styles.colorRow}>
                {AVATAR_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSwatchSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, { borderColor: colors.border }]}
                  onPress={() => {
                    setShowCreateForm(false);
                    setNewName('');
                    setSelectedColor(AVATAR_COLORS[0]);
                  }}
                >
                  <Text style={[styles.formButtonText, { color: colors.textSecondary }]}>
                    {t.cancel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.formButton,
                    styles.saveButton,
                    { backgroundColor: activeColor },
                    (!newName.trim() || isSaving) && styles.disabledButton,
                  ]}
                  onPress={handleCreate}
                  disabled={!newName.trim() || isSaving}
                >
                  <Text style={styles.saveButtonText}>{t.saveProfile}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.addButtonWrapper, { borderTopColor: colors.border }]}>
              {profiles.length < MAX_PROFILES ? (
                <TouchableOpacity
                  style={[styles.addButton, { borderColor: activeColor }]}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Text style={[styles.addButtonText, { color: activeColor }]}>
                    + {t.addProfile}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.maxReachedText, { color: colors.textSecondary }]}>
                  {t.maxProfilesReached}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  list: {
    flexGrow: 0,
    maxHeight: 320,
    paddingHorizontal: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileTextBlock: {
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  createForm: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  createTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  formButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  formButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    borderColor: 'transparent',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.45,
  },
  addButtonWrapper: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  addButton: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 28,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  maxReachedText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
