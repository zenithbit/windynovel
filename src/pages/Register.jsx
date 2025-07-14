import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Form,
  Input,
  Button,
  Typography,
  Space,
  Flex,
  Card,
  Alert,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { showError, showSuccess } from "../utils/toast.js";

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { setLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Check if passwords match
      if (values.password !== values.confirmPassword) {
        showError("Mật khẩu xác nhận không khớp!");
        return;
      }

      // Include confirmPassword in the registration data
      const registerData = {
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };
      const response = await authAPI.register(registerData);

      if (response.data.success) {
        showSuccess("Đăng ký thành công! Chào mừng bạn đến với WindyNovel.");
        // Auto login after registration
        const loginResponse = await authAPI.login({
          username: registerData.username,
          password: registerData.password,
        });

        if (loginResponse.data.success) {
          setLogin(loginResponse.data.data.user, loginResponse.data.data.token);
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Register error:", err);
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
          maxWidth: 450,
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
              Đăng ký
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Tạo tài khoản để bắt đầu hành trình đọc truyện của bạn.
            </Text>
          </div>
        </Space>

        {/* Form */}
        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          style={{ width: "100%" }}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
              { max: 20, message: "Tên đăng nhập không được quá 20 ký tự!" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu _!",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%", height: 48 }}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              Đã có tài khoản?{" "}
              <Link to="/login" style={{ fontWeight: 500 }}>
                Đăng nhập ngay
              </Link>
            </Text>
          </div>

          <div
            style={{
              marginTop: 24,
              fontSize: 12,
              color: "#999",
              textAlign: "center",
            }}
          >
            <Text type="secondary">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="/terms" style={{ color: "#1890ff" }}>
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="/privacy" style={{ color: "#1890ff" }}>
                Chính sách bảo mật
              </a>
            </Text>
          </div>
        </Form>
      </Card>
    </Flex>
  );
};

export default Register;
