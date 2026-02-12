import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  loading?: boolean;
}

export default function CreateProjectModal({
  visible,
  onClose,
  onCreate,
  loading,
}: CreateProjectModalProps) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  const canCreate = name.trim().length > 0 && !loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>&#x1F4D6;</Text>
            <Text style={styles.title}>New Project</Text>
            <Text style={styles.subtitle}>
              Give your manga project a name
            </Text>
          </View>

          <TextInput
            style={[styles.input, name.trim() && styles.inputActive]}
            placeholder="e.g. Dragon Quest Adventures"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={50}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />

          <Text style={styles.charCount}>
            {name.length}/50
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                !canCreate && styles.buttonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!canCreate}
              activeOpacity={0.7}
            >
              <Text style={styles.createText}>
                {loading ? 'Creating...' : 'Create Project'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    width: '88%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  input: {
    borderWidth: 2,
    borderColor: '#eeeff2',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a2e',
    backgroundColor: '#f9fafb',
    fontWeight: '500',
  },
  inputActive: {
    borderColor: '#6366f1' + '40',
    backgroundColor: '#fff',
  },
  charCount: {
    fontSize: 12,
    color: '#c8c8c8',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  createButton: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  createText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
