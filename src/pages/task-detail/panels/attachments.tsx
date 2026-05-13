import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Alert, Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { AttachIcon, CloseIcon } from '../../../components/icons/icons';
import { SectionLabel } from '../../../components/ui/ui';
import {
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from '../../../hooks/useAttachments';
import { useAuthStore } from '../../../store/auth-store';
import type { Attachment } from '../../../api/attachments';

const DropZone = styled(Box, {
  shouldForwardProp: p => p !== 'isOver' && p !== 'isBusy',
})<{ isOver: boolean; isBusy: boolean }>(({ theme, isOver, isBusy }) => ({
  border: `1.5px dashed ${isOver ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: 10,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: isBusy ? 'progress' : 'pointer',
  backgroundColor: isOver
    ? alpha(theme.palette.primary.main, 0.08)
    : theme.palette.background.paper,
  color: isOver ? theme.palette.primary.main : theme.palette.text.secondary,
  transition: 'border-color 120ms, background-color 120ms, color 120ms',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
}));

const FileRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  padding: theme.spacing(1, 1.25),
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    '& .row-actions': { opacity: 1 },
  },
}));

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function fileEmoji(contentType: string, fileName: string): string {
  const ct = contentType.toLowerCase();
  const ext = fileName.toLowerCase().split('.').pop() ?? '';
  if (ct.startsWith('image/')) return 'IMG';
  if (ct.startsWith('video/')) return 'VID';
  if (ct.startsWith('audio/')) return 'AUD';
  if (ct.includes('pdf')) return 'PDF';
  if (ct.includes('zip') || ct.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'ZIP';
  if (ct.includes('word') || ['doc', 'docx'].includes(ext)) return 'DOC';
  if (ct.includes('sheet') || ct.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) return 'XLS';
  if (ct.includes('presentation') || ['ppt', 'pptx'].includes(ext)) return 'PPT';
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'go', 'rs', 'c', 'cpp', 'sh', 'json', 'xml', 'yaml', 'yml'].includes(ext)) return 'CODE';
  if (ct.startsWith('text/')) return 'TXT';
  return 'FILE';
}

interface Props {
  taskId: string;
}

export function Attachments({ taskId }: Props) {
  const { data: attachments = [], isPending, isError } = useAttachments(taskId);
  const upload = useUploadAttachment(taskId);
  const remove = useDeleteAttachment(taskId);
  const currentUserId = useAuthStore(s => s.userId);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null);

  const isBusy = upload.isPending;

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    let successCount = 0;
    let lastError: string | null = null;

    for (const file of list) {
      try {
        await upload.mutateAsync(file);
        successCount++;
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Chyba uploadu';
      }
    }

    if (successCount > 0 && !lastError) {
      setFeedback({ kind: 'success', msg: successCount === 1 ? 'Soubor nahrán' : `${successCount} souborů nahráno` });
    } else if (lastError) {
      setFeedback({ kind: 'error', msg: `Chyba uploadu: ${lastError}` });
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      void handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const openPicker = () => {
    if (!isBusy) fileInputRef.current?.click();
  };

  const handleDelete = async (a: Attachment) => {
    try {
      await remove.mutateAsync(a.id);
      setFeedback({ kind: 'success', msg: 'Soubor smazán' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Chyba mazání';
      setFeedback({ kind: 'error', msg: `Chyba: ${msg}` });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <SectionLabel>Přílohy · {attachments.length}</SectionLabel>

      <DropZone
        isOver={dragOver}
        isBusy={isBusy}
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleInputChange}
        />
        {isBusy ? (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography sx={{ fontSize: 13 }}>Nahrávám…</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <AttachIcon />
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              {dragOver ? 'Pusť soubory sem' : 'Přetáhni soubory sem nebo klikni pro výběr'}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              Max. 25 MB na soubor
            </Typography>
          </Box>
        )}
      </DropZone>

      {feedback && (
        <Alert severity={feedback.kind} onClose={() => setFeedback(null)} sx={{ py: 0.5 }}>
          {feedback.msg}
        </Alert>
      )}

      {isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {isError && !isPending && (
        <Alert severity="error">Nepodařilo se načíst přílohy</Alert>
      )}

      {!isPending && !isError && attachments.length === 0 && (
        <Typography sx={{ fontSize: 12.5, color: 'text.disabled', textAlign: 'center', py: 1 }}>
          Žádné přílohy
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {attachments.map(a => {
          const canDelete = !a.createdBy || a.createdBy === currentUserId;
          return (
            <FileRow key={a.id}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'text.secondary',
                  flexShrink: 0,
                }}
              >
                {fileEmoji(a.contentType, a.fileName)}
              </Box>

              <Box
                component="a"
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover .file-name': { color: 'primary.main' },
                }}
              >
                <Typography
                  className="file-name"
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a.fileName}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                  {formatBytes(a.sizeBytes)} · {formatDate(a.createdAt)}
                </Typography>
              </Box>

              {canDelete && (
                <Box className="row-actions" sx={{ opacity: 0, transition: 'opacity 120ms' }}>
                  <Tooltip title="Smazat">
                    <IconButton
                      size="small"
                      disabled={remove.isPending}
                      onClick={() => void handleDelete(a)}
                      aria-label="Smazat přílohu"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </FileRow>
          );
        })}
      </Box>
    </Box>
  );
}
