import Swal from 'sweetalert2';

export const showAlert = {
  success: (message, title = 'Success!') => {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#4caf50',
      timer: 3000,
      showConfirmButton: true
    });
  },

  error: (message, title = 'Error!') => {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#f44336',
      showConfirmButton: true
    });
  },

  warning: (message, title = 'Warning!') => {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonColor: '#ff9800',
      showConfirmButton: true
    });
  },

  info: (message, title = 'Info') => {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonColor: '#2196f3',
      showConfirmButton: true
    });
  },

  confirm: (message, title = 'Are you sure?') => {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#f44336',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });
  }
};

export default showAlert;

