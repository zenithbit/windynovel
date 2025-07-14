import React, { useState, useEffect } from "react";
import { Card, Flex, Typography, Button } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const Toast = ({
  message,
  type = "success",
  onClose,
  duration = 4000,
  index = 0,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const typeStyles = {
      success: {
        backgroundColor: "#f6ffed",
        borderColor: "#52c41a",
        color: "#389e0d",
      },
      error: {
        backgroundColor: "#fff2f0",
        borderColor: "#ff4d4f",
        color: "#cf1322",
      },
      warning: {
        backgroundColor: "#fffbe6",
        borderColor: "#faad14",
        color: "#d48806",
      },
      info: {
        backgroundColor: "#e6f7ff",
        borderColor: "#1890ff",
        color: "#0958d9",
      },
    };

    return {
      position: "fixed",
      right: "16px",
      top: `${16 + index * 80}px`,
      maxWidth: "384px",
      width: "100%",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      borderLeft: `4px solid ${typeStyles[type].borderColor}`,
      backgroundColor: typeStyles[type].backgroundColor,
      zIndex: 1000,
      transform: isVisible ? "translateX(0)" : "translateX(100%)",
      opacity: isVisible ? 1 : 0,
      transition: "all 0.3s ease-in-out",
    };
  };

  const getIcon = () => {
    const iconProps = {
      style: { fontSize: "16px", marginRight: "8px" },
    };

    switch (type) {
      case "success":
        return (
          <CheckCircleOutlined
            {...iconProps}
            style={{ ...iconProps.style, color: "#52c41a" }}
          />
        );
      case "error":
        return (
          <CloseCircleOutlined
            {...iconProps}
            style={{ ...iconProps.style, color: "#ff4d4f" }}
          />
        );
      case "warning":
        return (
          <ExclamationCircleOutlined
            {...iconProps}
            style={{ ...iconProps.style, color: "#faad14" }}
          />
        );
      case "info":
        return (
          <InfoCircleOutlined
            {...iconProps}
            style={{ ...iconProps.style, color: "#1890ff" }}
          />
        );
      default:
        return null;
    }
  };

  const getTextColor = () => {
    const colors = {
      success: "#389e0d",
      error: "#cf1322",
      warning: "#d48806",
      info: "#0958d9",
    };
    return colors[type];
  };

  return (
    <Card
      size="small"
      style={getToastStyles()}
      bodyStyle={{ padding: "12px 16px" }}
    >
      <Flex align="flex-start" gap="small">
        {getIcon()}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: getTextColor(),
              wordBreak: "break-words",
            }}
          >
            {message}
          </Text>
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          style={{
            border: "none",
            boxShadow: "none",
            color: "#999",
            padding: "0",
            width: "16px",
            height: "16px",
            minWidth: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </Flex>
    </Card>
  );
};

export default Toast;
