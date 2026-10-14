import { Toaster, toast } from 'react-hot-toast';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
          padding: '12px 18px'
        },
        success: {
          iconTheme: {
            primary: '#16a34a',
            secondary: '#ffffff'
          }
        },
        error: {
          iconTheme: {
            primary: '#e11d48',
            secondary: '#ffffff'
          }
        }
      }}
    />
  );
};

export { toast };
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (toastId?: string) => toast.dismiss(toastId)
};
