import React, { useCallback, useEffect, useState } from 'react'; // React + hooks
import {
  Image,                // exibe a foto de perfil
  KeyboardAvoidingView, // evita que o teclado cubra os campos
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';            // ícones
import * as ImagePicker from 'expo-image-picker';         // seletor de imagens da galeria
import { router } from 'expo-router';                     // navegação
import { theme } from '../../constants/theme';            // tokens de design
import { getProfile, updateProfile } from '../../services/profileService'; // serviços de perfil
import { initialOf } from '../../utils/format';           // inicial do nome (avatar)
import type { UserProfile } from '../../types/domain';    // tipo do perfil
import StateView from '../../components/StateView';
import Input from '../../components/Input';
import Button from '../../components/Button';

// Tela de edição de perfil.
export default function EditProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null); // perfil original
  const [name, setName] = useState('');                            // nome em edição
  const [avatar, setAvatar] = useState<string | null>(null);      // avatar em edição (URI ou null)
  const [nameError, setNameError] = useState<string | null>(null);// erro de validação do nome
  const [loading, setLoading] = useState(true);                   // carregando?
  const [error, setError] = useState<string | null>(null);        // erro geral?
  const [saving, setSaving] = useState(false);                    // salvando?

  // Carrega o perfil e preenche os campos editáveis.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await getProfile();
      setProfile(p);
      setName(p.name);      // preenche o campo nome
      setAvatar(p.avatar);  // preenche o avatar
    } catch {
      setError('Não foi possível carregar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega ao montar a tela.
  useEffect(() => {
    load();
  }, [load]);

  // Abre a galeria para o usuário escolher uma foto.
  const pickImage = async () => {
    // usa expo-image-picker quando disponível
    // Pede permissão para acessar as fotos do dispositivo.
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      // Sem permissão: avisa e interrompe.
      setError('Permissão para acessar as fotos foi negada.');
      return;
    }
    // Abre a galeria com opção de recorte quadrado (1:1).
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // só imagens
      allowsEditing: true,                             // permite recortar
      aspect: [1, 1],                                  // proporção quadrada
      quality: 0.7,                                    // compressão (0 a 1)
    });
    // Se não cancelou e há uma imagem, guarda o caminho (uri) dela.
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  // Salva as alterações do perfil.
  const onSave = async () => {
    // Valida que o nome não está vazio.
    if (!name.trim()) {
      setNameError('Informe um nome de exibição.');
      return;
    }
    setNameError(null);
    setSaving(true);
    try {
      // TODO PUT /me
      await updateProfile({ name: name.trim(), avatar }); // envia nome + avatar
      router.back();                                       // volta à tela anterior
    } catch {
      setError('Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  // Cabeçalho com botão de voltar + título.
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

  // Estado de carregamento/erro.
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

        {/* Avatar */}
        <View style={styles.avatarBlock}>
          {avatar ? (
            // Se há foto, exibe a imagem.
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              accessibilityLabel="Foto de perfil"
            />
          ) : (
            // Senão, exibe a inicial do nome num círculo.
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialOf(name || profile.name)}</Text>
            </View>
          )}
          {/* Botão para trocar a foto (abre a galeria) */}
          <TouchableOpacity
            onPress={pickImage}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto"
            style={styles.changePhoto}
          >
            <Ionicons
              name="camera-outline"
              size={18}
              color={theme.colors.accent}
              accessible={false}
            />
            <Text style={styles.changePhotoText}>Alterar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Nome */}
        {/* Campo editável do nome de exibição */}
        <Input
          label="Nome de exibição"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          placeholder="Como quer ser chamado"
          autoCapitalize="words"
          error={nameError}
        />

        {/* E-mail somente leitura */}
        {/* Mostra o e-mail mas não permite editar (ícone de cadeado) */}
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

        {/* Botão de salvar as alterações */}
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

// Estilos.
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
    borderRadius: theme.radius.full, // círculo
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
    backgroundColor: theme.colors.surfaceAlt, // tom diferente p/ indicar "bloqueado"
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
