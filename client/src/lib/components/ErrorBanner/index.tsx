import React from "react";
import { Alert } from "antd";

interface Props {
  message?: string;
  description?: string;
}

export const ErrorBanner = ({
  message = "啊哈，遇到一些错误哟:(",
  description = "好像出了点问题。 请检查您的连接和/或稍后再试。"
}: Props) => {
  return (
    <Alert
      banner
      closable
      message={message}
      description={description}
      type="error"
      className="error-banner"
    />
  );
};