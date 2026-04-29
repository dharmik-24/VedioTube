import toast from 'react-hot-toast';

export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
    },
  });
};

export const showLoadingToast = (message) => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

export const updateToast = (toastId, message, type = 'success') => {
  toast.dismiss(toastId);
  if (type === 'success') {
    showSuccessToast(message);
  } else {
    showErrorToast(message);
  }
};
