import api from './axios';
import type { CommentDto, CreateCommentRequest, UpdateCommentRequest } from './types';

export const commentsApi = {
  list: (taskId: string) =>
    api.get<CommentDto[]>(`/api/tasks/${taskId}/comments`).then(r => r.data),

  create: (taskId: string, body: CreateCommentRequest) =>
    api.post<void>(`/api/tasks/${taskId}/comments`, body).then(r => r.data),

  update: (commentId: string, body: UpdateCommentRequest) =>
    api.patch<void>(`/api/comments/${commentId}`, body).then(r => r.data),

  delete: (commentId: string) =>
    api.delete<void>(`/api/comments/${commentId}`).then(r => r.data),
};
