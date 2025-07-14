import React from "react";
import { Card, Typography, Space } from "antd";
import { getSecureCookie } from "../utils/cookieUtils";

const { Text, Title } = Typography;

const CookieDebug = () => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const token = getSecureCookie("auth_token");
  const userData = getSecureCookie("user_data");

  return (
    <Card
      size="small"
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        backgroundColor: "#262626",
        color: "white",
        maxWidth: "280px",
        fontSize: "12px",
        zIndex: 1000,
        border: "none",
      }}
      bodyStyle={{ padding: "12px" }}
    >
      <Title
        level={5}
        style={{ color: "white", margin: "0 0 8px 0", fontSize: "14px" }}
      >
        🍪 Cookie Debug
      </Title>
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <div>
          <Text strong style={{ color: "white" }}>
            Token:
          </Text>{" "}
          <Text style={{ color: token ? "#52c41a" : "#ff4d4f" }}>
            {token ? "✅ Present" : "❌ Missing"}
          </Text>
        </div>
        <div>
          <Text strong style={{ color: "white" }}>
            User:
          </Text>{" "}
          <Text style={{ color: userData ? "#52c41a" : "#ff4d4f" }}>
            {userData ? `✅ ${userData.username}` : "❌ Missing"}
          </Text>
        </div>
        {userData && (
          <div>
            <Text strong style={{ color: "white" }}>
              Email:
            </Text>{" "}
            <Text style={{ color: "white" }}>{userData.email}</Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default CookieDebug;
