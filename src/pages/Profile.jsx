import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Row,
  Col,
  Tag,
  Select,
  Checkbox,
  Statistic,
  Divider,
  Space,
  message,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  BookOutlined,
  HeartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { usersAPI } from "../services/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [stats, setStats] = useState({
    bookmarks: 0,
    readingHistory: 0,
    comments: 0,
  });

  const availableGenres = [
    "học đường",
    "lãng mạn",
    "hành động",
    "viễn tưởng",
    "kinh dị",
    "hài hước",
    "phiêu lưu",
    "drama",
    "khoa học",
    "huyền bí",
  ];

  // Load user profile data on component mount
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        displayName: user.profile?.displayName || "",
        bio: user.profile?.bio || "",
        favoriteGenres: user.profile?.favoriteGenres || [],
        theme: theme,
        fontSize: user.preferences?.fontSize || "medium",
        fontFamily: user.preferences?.fontFamily || "serif",
        autoBookmark: user.preferences?.autoBookmark !== false,
      });

      // Load user stats
      loadUserStats();
    }
  }, [user, profileForm, theme]);

  const loadUserStats = async () => {
    try {
      const [bookmarksRes, historyRes] = await Promise.all([
        usersAPI.getBookmarks({ limit: 1 }),
        usersAPI.getReadingHistory({ limit: 1 }),
      ]);

      setStats({
        bookmarks: bookmarksRes.data.data.pagination?.total || 0,
        readingHistory: historyRes.data.data.pagination?.total || 0,
        comments: 0, // TODO: Add comments count API
      });
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      const formData = {
        profile: {
          displayName: values.displayName,
          bio: values.bio,
          favoriteGenres: values.favoriteGenres || [],
        },
        preferences: {
          theme: values.theme,
          fontSize: values.fontSize,
          fontFamily: values.fontFamily,
          autoBookmark: values.autoBookmark,
        },
      };

      const response = await usersAPI.updateProfile(formData);

      if (response.data.success) {
        updateUser(response.data.data.user);

        // Sync theme with global theme state if it changed
        if (values.theme !== theme) {
          if (
            (values.theme === "dark" && !isDarkMode) ||
            (values.theme === "light" && isDarkMode)
          ) {
            toggleTheme();
          }
        }

        setIsEditing(false);
        message.success("Cập nhật thông tin thành công!");
      } else {
        message.error(response.data.message || "Cập nhật thông tin thất bại!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      message.error(
        error.response?.data?.message || "Cập nhật thông tin thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu mới không khớp!");
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (result.success) {
        message.success("Đổi mật khẩu thành công!");
        setIsChangingPassword(false);
        passwordForm.resetFields();
      } else {
        message.error(result.error || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      console.error("Password change error:", error);
      message.error("Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có thông tin";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
      <Card>
        {/* Header with gradient background */}
        <div
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
            margin: "-24px -24px 24px -24px",
            padding: "32px 24px",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#fff",
                  color: "#1890ff",
                  fontSize: "32px",
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Col>
            <Col flex={1}>
              <Title level={2} style={{ color: "#fff", margin: 0 }}>
                {user?.profile?.displayName || user?.username}
              </Title>
              <Text
                style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px" }}
              >
                {user?.email}
              </Text>
              <br />
              <Text style={{ color: "rgba(255,255,255,0.65)" }}>
                Thành viên từ: {formatDate(user?.createdAt)}
              </Text>
              {user?.profile?.bio && (
                <Paragraph
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {user.profile.bio}
                </Paragraph>
              )}
            </Col>
          </Row>
        </div>

        {/* Profile Information */}
        <div style={{ marginBottom: 32 }}>
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 24 }}
          >
            <Col>
              <Title level={3}>Thông tin cá nhân</Title>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(!isEditing)}
                loading={loading}
              >
                {isEditing ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </Col>
          </Row>

          {isEditing ? (
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="displayName" label="Tên hiển thị">
                    <Input placeholder="Nhập tên hiển thị" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tên đăng nhập">
                    <Input value={user?.username || ""} disabled />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Không thể thay đổi tên đăng nhập
                    </Text>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="bio" label="Giới thiệu bản thân">
                <TextArea
                  rows={4}
                  maxLength={500}
                  showCount
                  placeholder="Viết vài dòng về bản thân..."
                />
              </Form.Item>

              <Form.Item name="favoriteGenres" label="Thể loại yêu thích">
                <Select
                  mode="multiple"
                  placeholder="Chọn thể loại yêu thích"
                  style={{ width: "100%" }}
                >
                  {availableGenres.map((genre) => (
                    <Option key={genre} value={genre}>
                      {genre}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Title level={4}>Tùy chọn đọc</Title>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item name="theme" label="Chủ đề giao diện">
                    <Select>
                      <Option value="light">Sáng</Option>
                      <Option value="dark">Tối</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="fontSize" label="Kích thước chữ">
                    <Select>
                      <Option value="small">Nhỏ</Option>
                      <Option value="medium">Vừa</Option>
                      <Option value="large">Lớn</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="fontFamily" label="Font chữ">
                    <Select>
                      <Option value="serif">Serif</Option>
                      <Option value="sans-serif">Sans-serif</Option>
                      <Option value="monospace">Monospace</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="autoBookmark" valuePropName="checked">
                <Checkbox>Tự động bookmark khi đọc</Checkbox>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Text strong>Tên hiển thị:</Text>
                  <br />
                  <Text>{user?.profile?.displayName || "Chưa cập nhật"}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Tên đăng nhập:</Text>
                  <br />
                  <Text>{user?.username}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Email:</Text>
                  <br />
                  <Text>{user?.email}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Vai trò:</Text>
                  <br />
                  <Text>
                    {user?.role === "admin" ? "Quản trị viên" : "Thành viên"}
                  </Text>
                </Col>
              </Row>

              {user?.profile?.bio && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Giới thiệu:</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    {user.profile.bio}
                  </Paragraph>
                </div>
              )}

              {user?.profile?.favoriteGenres?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Thể loại yêu thích:</Text>
                  <div style={{ marginTop: 8 }}>
                    {user.profile.favoriteGenres.map((genre) => (
                      <Tag key={genre} color="blue" style={{ marginBottom: 4 }}>
                        {genre}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Theme and Reading Preferences Display */}
              <div style={{ marginTop: 16 }}>
                <Text strong>Tùy chọn đọc:</Text>
                <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">Chủ đề:</Text>
                    <br />
                    <Tag color={theme === "dark" ? "purple" : "blue"}>
                      {theme === "dark" ? "Tối" : "Sáng"}
                    </Tag>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">Font chữ:</Text>
                    <br />
                    <Text>{user?.preferences?.fontFamily || "serif"}</Text>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">Cỡ chữ:</Text>
                    <br />
                    <Text>
                      {user?.preferences?.fontSize === "small"
                        ? "Nhỏ"
                        : user?.preferences?.fontSize === "large"
                        ? "Lớn"
                        : "Vừa"}
                    </Text>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">Auto bookmark:</Text>
                    <br />
                    <Tag
                      color={
                        user?.preferences?.autoBookmark ? "green" : "orange"
                      }
                    >
                      {user?.preferences?.autoBookmark ? "Bật" : "Tắt"}
                    </Tag>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Password Change Section */}
        <div style={{ marginBottom: 32 }}>
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 24 }}
          >
            <Col>
              <Title level={3}>Đổi mật khẩu</Title>
            </Col>
            <Col>
              <Button
                icon={<LockOutlined />}
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                loading={loading}
                style={{
                  backgroundColor: "#fa8c16",
                  borderColor: "#fa8c16",
                  color: "#fff",
                }}
              >
                {isChangingPassword ? "Hủy" : "Đổi mật khẩu"}
              </Button>
            </Col>
          </Row>

          {isChangingPassword && (
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordUpdate}
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu hiện tại!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận mật khẩu mới!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                  >
                    {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsChangingPassword(false);
                      passwordForm.resetFields();
                    }}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </div>

        <Divider />

        {/* Stats Section */}
        <div>
          <Title level={3} style={{ marginBottom: 24 }}>
            Thống kê
          </Title>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Lịch sử đọc"
                  value={stats.readingHistory}
                  prefix={<BookOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Bookmark"
                  value={stats.bookmarks}
                  prefix={<HeartOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Bình luận"
                  value={stats.comments}
                  prefix={<MessageOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
