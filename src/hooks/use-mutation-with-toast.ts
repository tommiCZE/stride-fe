import { useMutation } from '@tanstack/react-query';
import type {
  DefaultError,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

/**
 * Wrapper kolem `useMutation`, který automaticky zobrazí toast notifikaci
 * při úspěchu nebo chybě, aniž by porušil existující `onSuccess` / `onError`
 * callbacky předané volajícím.
 *
 * Volající callbacky se spustí jako první, teprve poté se zobrazí toast —
 * komponenty si tak mohou doplnit chybovou hlášku (`errorMessage` se
 * vyhodnocuje až po jejich průchodu).
 *
 * Použití:
 * ```ts
 * const createTask = useMutationWithToast({
 *   mutationFn: createTaskApi,
 *   successMessage: 'Task vytvořen',
 *   errorMessage: 'Chyba při vytváření tasku',
 *   onSuccess: (newTask) => qc.invalidateQueries({ queryKey: ['tasks'] }),
 * });
 * ```
 */
export interface MutationToastOptions {
  successMessage?: string;
  /** Statická zpráva nebo funkce, která dostane error a vrátí text. */
  errorMessage?: string | ((error: unknown) => string);
}

export function useMutationWithToast<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult> & MutationToastOptions,
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
  const { enqueueSnackbar } = useSnackbar();
  const { successMessage, errorMessage, onSuccess, onError, ...rest } = options;

  return useMutation<TData, TError, TVariables, TOnMutateResult>({
    ...rest,
    onSuccess: (data, variables, onMutateResult, context) => {
      onSuccess?.(data, variables, onMutateResult, context);
      if (successMessage) {
        enqueueSnackbar(successMessage, { variant: 'success' });
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      onError?.(error, variables, onMutateResult, context);
      const text =
        typeof errorMessage === 'function'
          ? errorMessage(error)
          : errorMessage ?? 'Něco se pokazilo. Zkus to prosím znovu.';
      enqueueSnackbar(text, { variant: 'error' });
    },
  });
}
