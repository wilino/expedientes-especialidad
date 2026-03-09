import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../lib/feedback';

export function useFeedbackSnackbar() {
  const { enqueueSnackbar } = useSnackbar();

  return {
    success: (message: string) => {
      enqueueSnackbar(message, { variant: 'success' });
    },
    error: (error: unknown, fallback: string) => {
      enqueueSnackbar(getErrorMessage(error, fallback), { variant: 'error' });
    },
    warning: (message: string) => {
      enqueueSnackbar(message, { variant: 'warning' });
    },
    info: (message: string) => {
      enqueueSnackbar(message, { variant: 'info' });
    },
  };
}
