import api from './axios';

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
