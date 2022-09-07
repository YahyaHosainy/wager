import { toast } from "react-toastify";

export const createToastNotification = (text, type) =>
  toast(text, {
    type: type,
    position: "bottom-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
  });
