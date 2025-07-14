import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Form, Input, Button, Typography, Space, Flex, Card } from "antd";
import { UserOutlined, LockOutlined, BookOutlined } from "@ant-design/icons";
import { showError, showSuccess } from "../utils/toast.js";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { setLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await authAPI.login(values);

      if (response.data.success) {
        setLogin(response.data.data.user, response.data.data.token);
        showSuccess("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        padding: "24px 16px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: 16,
        }}
        bodyStyle={{ padding: 32 }}
      >
        {/* Header */}
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", textAlign: "center", marginBottom: 32 }}
        >
          <Link to="/">
            <Flex justify="center" align="center" gap={8}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "linear-gradient(135deg, #1890ff, #722ed1)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOutlined style={{ color: "white", fontSize: 24 }} />
              </div>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                WindyNovel
              </Title>
            </Flex>
          </Link>

          <div>
            <Title level={2} style={{ margin: 0 }}>
              Đăng nhập
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Chào mừng bạn quay trở lại! Hãy đăng nhập để tiếp tục đọc truyện.
            </Text>
          </div>
        </Space>

        {/* Form */}
        <Form
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          style={{ width: "100%" }}
        >
          <Form.Item
            name="emailOrUsername"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%", height: 48 }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              Chưa có tài khoản?{" "}
              <Link to="/register" style={{ fontWeight: 500 }}>
                Đăng ký ngay
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </Flex>
  );
};

export default Login;
