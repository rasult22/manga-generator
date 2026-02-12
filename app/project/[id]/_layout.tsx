import { Stack, useLocalSearchParams } from 'expo-router';
import { useProject } from '@/hooks/useEntities';

export default function ProjectLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project } = useProject(id);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#6366f1',
        headerTitleStyle: { fontWeight: '600', color: '#1a1a2e' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: project?.name ?? 'Project',
        }}
      />
      <Stack.Screen
        name="entity"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
