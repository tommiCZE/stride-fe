import api from './axios';

export interface Attachment {
  id: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  createdBy: string | null;
  createdAt: string;
}

export const attachmentsApi = {
  uploadImage: (taskId: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<{ url: string }>(`/api/tasks/${taskId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data.url);
  },
};

export async function fetchAttachments(taskId: string): Promise<Attachment[]> {
  const { data } = await api.get<Attachment[]>(`/api/tasks/${taskId}/attachments`);
  return data;
}

export async function uploadAttachment(taskId: string, file: File): Promise<Attachment> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<Attachment>(
    `/api/tasks/${taskId}/attachments`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await api.delete(`/api/attachments/${attachmentId}`);
}
