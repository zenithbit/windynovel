import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Layout as AntLayout,
  Menu,
  Dropdown,
  Avatar,
  Button,
  Space,
  Typography,
  Divider,
  Tooltip,
  Drawer,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  ProfileOutlined,
  StarOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  DownOutlined,
  HomeFilled,
  SearchOutlined,
  EditOutlined,
  HeartOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTheme } from "../contexts/ThemeContext";

const { Header, Content, Footer } = AntLayout;
const { Title, Text } = Typography;

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { showSuccess } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    showSuccess("Đăng xuất thành công! Hẹn gặp lại bạn.");
    navigate("/");
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const getCurrentKey = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/stories") return "stories";
    if (path === "/trending") return "trending";
    if (path.startsWith("/explore")) return "explore";
    return "";
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeFilled />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "stories",
      icon: <BookOutlined />,
      label: <Link to="/stories">Truyện</Link>,
    },
    {
      key: "trending",
      icon: <TrophyOutlined />,
      label: <Link to="/trending">Thịnh hành</Link>,
    },
    {
      key: "explore",
      icon: <SearchOutlined />,
      label: <Link to="/explore">Khám phá</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "write",
      icon: <EditOutlined />,
      label: <Link to="/write">Viết truyện</Link>,
    },
    {
      key: "library",
      icon: <BookOutlined />,
      label: <Link to="/library">Thư viện</Link>,
    },
    {
      key: "favorites",
      icon: <HeartOutlined />,
      label: <Link to="/favorites">Yêu thích</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: <Link to="/profile">Thông tin cá nhân</Link>,
    },
    {
      key: "bookmarks",
      icon: <StarOutlined />,
      label: <Link to="/bookmarks">Bookmark</Link>,
    },
    {
      key: "history",
      icon: <ClockCircleOutlined />,
      label: <Link to="/history">Lịch sử đọc</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntLayout className="layout-container">
      {/* Header */}
      <Header className="layout-header">
        <div className="header-content">
          {/* Mobile Menu Button - Only visible on mobile */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={handleMobileMenuToggle}
            className="mobile-menu-button"
            size="large"
          />

          {/* Logo */}
          <div className="logo-container">
            <div className="logo-icon">
              <span className="logo-text">W</span>
            </div>
            <Title level={4} className="logo-title">
              WindyNovel
            </Title>
          </div>

          {/* Navigation - Hidden on mobile */}
          <div className="navigation-container">
            <Menu
              theme={isDarkMode ? "dark" : "light"}
              mode="horizontal"
              selectedKeys={[getCurrentKey()]}
              items={menuItems}
              className="navigation-menu"
            />
          </div>

          {/* User Menu */}
          <Space size="small" wrap>
            {isAuthenticated ? (
              <>
                <Text type="secondary" className="user-greeting">
                  Xin chào,{" "}
                  <Text strong>
                    {user?.profile?.displayName || user?.username}
                  </Text>
                </Text>
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button type="text" className="user-button">
                    <Space size="small">
                      <Avatar
                        size="small"
                        style={{
                          background:
                            "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                        }}
                        icon={<UserOutlined />}
                        className="user-avatar"
                      >
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </Avatar>
                      <DownOutlined className="dropdown-icon" />
                    </Space>
                  </Button>
                </Dropdown>
              </>
            ) : (
              <Space size="small">
                <Button
                  type="primary"
                  ghost
                  onClick={() => navigate("/login")}
                  size="small"
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate("/register")}
                  size="small"
                >
                  Đăng ký
                </Button>
              </Space>
            )}
          </Space>
        </div>
      </Header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="logo-icon">
              <span className="logo-text">W</span>
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "var(--text-color)",
              }}
            >
              WindyNovel
            </span>
          </div>
        }
        placement="left"
        closable={true}
        onClose={handleMobileMenuClose}
        open={mobileMenuOpen}
        width={280}
        styles={{
          body: {
            padding: 0,
            backgroundColor: "var(--card-bg)",
          },
          header: {
            backgroundColor: "var(--card-bg)",
            borderBottom: "1px solid var(--border-color)",
          },
        }}
        className="mobile-drawer"
      >
        <Menu
          mode="vertical"
          selectedKeys={[getCurrentKey()]}
          items={menuItems.map((item) => ({
            ...item,
            label: <div onClick={handleMobileMenuClose}>{item.label}</div>,
          }))}
          style={{
            border: "none",
            backgroundColor: "var(--card-bg)",
            color: "var(--text-color)",
          }}
          theme={isDarkMode ? "dark" : "light"}
        />

        {isAuthenticated && (
          <>
            <Divider
              style={{ margin: "16px 0", borderColor: "var(--border-color)" }}
            />
            <Menu
              mode="vertical"
              items={userMenuItems
                .filter((item) => item.key !== "logout")
                .map((item) => ({
                  ...item,
                  label:
                    item.type === "divider" ? (
                      item.label
                    ) : (
                      <div onClick={handleMobileMenuClose}>{item.label}</div>
                    ),
                }))}
              style={{
                border: "none",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-color)",
              }}
              theme={isDarkMode ? "dark" : "light"}
            />
            <div style={{ padding: "16px", backgroundColor: "var(--card-bg)" }}>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  handleLogout();
                  handleMobileMenuClose();
                }}
                block
              >
                Đăng xuất
              </Button>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div style={{ padding: "16px", backgroundColor: "var(--card-bg)" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                onClick={() => {
                  navigate("/login");
                  handleMobileMenuClose();
                }}
                block
              >
                Đăng nhập
              </Button>
              <Button
                type="default"
                onClick={() => {
                  navigate("/register");
                  handleMobileMenuClose();
                }}
                block
              >
                Đăng ký
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Main Content */}
      <Content className="layout-content">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>{children}</div>
      </Content>

      {/* Footer */}
      <Footer className="layout-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div>
              <div className="footer-logo-section">
                <div className="footer-logo-icon">
                  <span className="footer-logo-text">W</span>
                </div>
                <Title level={5} className="footer-title">
                  WindyNovel
                </Title>
              </div>
              <Text type="secondary">
                Nền tảng đọc truyện online tốt nhất với hàng ngàn tác phẩm chất
                lượng cao.
              </Text>
            </div>

            <div>
              <Title level={5}>Khám phá</Title>
              <div className="footer-links">
                <Link to="/explore">Tìm kiếm truyện</Link>
                <Link to="/trending">Truyện hot</Link>
                <Link to="/new">Truyện mới</Link>
                <Link to="/categories">Thể loại</Link>
              </div>
            </div>

            <div>
              <Title level={5}>Tác giả</Title>
              <div className="footer-links">
                <Link to="/write">Viết truyện</Link>
                <Link to="/guide">Hướng dẫn</Link>
                <Link to="/tips">Mẹo hay</Link>
                <Link to="/support">Hỗ trợ</Link>
              </div>
            </div>

            <div>
              <Title level={5}>Cộng đồng</Title>
              <div className="footer-links">
                <Link to="/forum">Diễn đàn</Link>
                <Link to="/events">Sự kiện</Link>
                <Link to="/rankings">Bảng xếp hạng</Link>
                <Link to="/feedback">Góp ý</Link>
              </div>
            </div>
          </div>

          <Divider />

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              © 2024 WindyNovel. Tất cả quyền được bảo lưu.
            </Text>
          </div>
        </div>
      </Footer>

      {/* Sticky Theme Toggle Button */}
      <Tooltip
        title={
          isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
        }
        placement="right"
      >
        <Button
          type="primary"
          shape="circle"
          icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className="theme-toggle-sticky"
          size="large"
        />
      </Tooltip>
    </AntLayout>
  );
};

export default Layout;
