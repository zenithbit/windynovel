import { message } from "antd";

export const showSuccess = (content, duration = 3) => {
  message.success(content, duration);
};

export const showError = (content, duration = 3) => {
  message.error(content, duration);
};

export const showInfo = (content, duration = 3) => {
  message.info(content, duration);
};

export const showWarning = (content, duration = 3) => {
  message.warning(content, duration);
};

export const showLoading = (content, duration = 0) => {
  return message.loading(content, duration);
};
