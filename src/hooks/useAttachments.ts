import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteAttachment,
  fetchAttachments,
  uploadAttachment,
  type Attachment,
} from '../api/attachments';

export const attachmentKeys = {
  all: ['attachments'] as const,
  byTask: (taskId: string) => ['attachments', taskId] as const,
};

export function useAttachments(taskId: string) {
  return useQuery<Attachment[]>({
    queryKey: attachmentKeys.byTask(taskId),
    queryFn: () => fetchAttachments(taskId),
    enabled: !!taskId,
  });
}

export function useUploadAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation<Attachment, Error, File>({
    mutationFn: (file: File) => uploadAttachment(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.byTask(taskId) });
    },
  });
}

export function useDeleteAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (attachmentId: string) => deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.byTask(taskId) });
    },
  });
}
