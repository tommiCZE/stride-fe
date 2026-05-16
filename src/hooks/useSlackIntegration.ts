import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { slackIntegrationApi } from '../api/slack-integration';

const keys = {
  integration: (projectKey: string) => ['slack-integration', projectKey] as const,
  channels: (projectKey: string) => ['slack-channels', projectKey] as const,
};

export function useSlackIntegration(projectKey: string) {
  const qc = useQueryClient();

  const integrationQuery = useQuery({
    queryKey: keys.integration(projectKey),
    queryFn: () => slackIntegrationApi.get(projectKey),
    enabled: !!projectKey,
    staleTime: 1000 * 30,
  });

  const isConnected = !!integrationQuery.data;

  const channelsQuery = useQuery({
    queryKey: keys.channels(projectKey),
    queryFn: () => slackIntegrationApi.listChannels(projectKey),
    enabled: isConnected,
    staleTime: 1000 * 60,
  });

  const disconnect = useMutation({
    mutationFn: () => slackIntegrationApi.disconnect(projectKey),
    onSuccess: () => {
      qc.setQueryData(keys.integration(projectKey), null);
      qc.removeQueries({ queryKey: keys.channels(projectKey) });
    },
  });

  const setChannel = useMutation({
    mutationFn: (ch: { id: string; name: string }) =>
      slackIntegrationApi.updateChannel(projectKey, ch.id, ch.name),
    onSuccess: (next) => qc.setQueryData(keys.integration(projectKey), next),
  });

  return {
    integration: integrationQuery.data ?? null,
    isConnected,
    isLoading: integrationQuery.isLoading,
    channels: channelsQuery.data ?? [],
    channelsLoading: channelsQuery.isLoading,
    disconnect: () => disconnect.mutate(),
    setChannel: (ch: { id: string; name: string }) => setChannel.mutate(ch),
    disconnecting: disconnect.isPending,
    settingChannel: setChannel.isPending,
  };
}
