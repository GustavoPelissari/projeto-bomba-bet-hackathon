import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { theme } from '../../constants/theme';
import { getProfile, updateProfile } from '../../services/profileService';
import { initialOf } from '../../utils/format';
import type { UserProfile } from '../../types/domain';
import StateView from '../../components/StateView';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await getProfile();
      setProfile(p);
      setName(p.name);
      setAvatar(p.avatar);
    } catch {
      setError('Não foi possível carregar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Abre a galeria (com recorte quadrado) e guarda a URI da imagem escolhida.
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Permissão para acessar as fotos foi negada.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      setNameError('Informe um nome de exibição.');
      return;
    }
    setNameError(null);
    setSaving(true);
    try {
      const fotoUrl = avatar && avatar.trim() ? avatar.trim() : null;
      await updateProfile({ name: name.trim(), avatar: fotoUrl });
      router.back();
    } catch {
      setError('Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const Header = (
    <TouchableOpacity
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.backBtn}
    >
      <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      <Text style={styles.headerTitle}>Editar perfil</Text>
    </TouchableOpacity>
  );

  if (loading || error || !profile) {
    return (
      <View style={styles.flex}>
        <View style={styles.headerPad}>{Header}</View>
        <StateView loading={loading} error={error} onRetry={load} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {Header}

        <View style={styles.avatarBlock}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              accessibilityLabel="Foto de perfil"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialOf(name || profile.name)}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={pickImage}
            accessibilityRole="button"
            accessibilityLabel="Escolher da galeria"
            style={styles.changePhoto}
          >
            <Ionicons
              name="camera-outline"
              size={18}
              color={theme.colors.accent}
              accessible={false}
            />
            <Text style={styles.changePhotoText}>Escolher da galeria</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Foto de perfil (URL)"
          icon="image-outline"
          value={avatar ?? ''}
          onChangeText={setAvatar}
          placeholder="https://exemplo.com/foto.jpg"
          autoCapitalize="none"
          keyboardType="url"
        />

        <Input
          label="Nome de exibição"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          placeholder="Como quer ser chamado"
          autoCapitalize="words"
          error={nameError}
        />

        <View style={styles.readonlyWrapper}>
          <Text style={styles.readonlyLabel}>E-mail</Text>
          <View style={styles.readonlyField}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.colors.textSecondary}
              accessible={false}
            />
            <Text style={styles.readonlyValue}>{profile.email}</Text>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={theme.colors.textSecondary}
              accessible={false}
            />
          </View>
          <Text style={styles.readonlyNote}>O e-mail não pode ser alterado.</Text>
        </View>

        <Button
          title="Salvar"
          onPress={onSave}
          loading={saving}
          icon="save-outline"
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  headerPad: {
    padding: theme.spacing.lg,
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: 48,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.font.h2,
    color: theme.colors.textPrimary,
  },
  avatarBlock: {
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 44,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  changePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  changePhotoText: {
    ...theme.font.label,
    color: theme.colors.accent,
  },
  readonlyWrapper: {
    marginBottom: theme.spacing.xl,
  },
  readonlyLabel: {
    ...theme.font.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs + 2,
  },
  readonlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md - 2,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg - 2,
  },
  readonlyValue: {
    flex: 1,
    ...theme.font.body,
    color: theme.colors.textSecondary,
  },
  readonlyNote: {
    ...theme.font.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs + 2,
  },
  saveBtn: {
    marginTop: theme.spacing.sm,
  },
});
