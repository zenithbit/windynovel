import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usersAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Spin,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Tag,
  Flex,
  Empty,
  Pagination,
  Space,
  Tooltip,
  Image,
} from "antd";
import {
  BookOutlined,
  DeleteOutlined,
  EyeOutlined,
  HeartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { showError, showSuccess } from "../utils/toast.js";

const { Title, Text, Paragraph } = Typography;

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 12,
    pages: 0,
    hasPrev: false,
    hasNext: false,
  });

  const { user } = useAuth();

  const loadBookmarks = async (page = 1) => {
    try {
      setLoading(true);
      const response = await usersAPI.getBookmarks({
        page,
        limit: pagination.pageSize,
      });
      setBookmarks(response.data.data.bookmarks);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      showError("Không thể tải danh sách bookmark");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (storyId, storyTitle) => {
    try {
      await usersAPI.removeBookmark(storyId);
      showSuccess(`Đã xóa "${storyTitle}" khỏi bookmark`);
      loadBookmarks(pagination.current);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      showError("Không thể xóa bookmark");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handlePageChange = (page) => {
    loadBookmarks(page);
  };

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  if (loading && pagination.current === 1) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: "60vh", padding: "24px" }}
      >
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary">Đang tải bookmark...</Text>
        </Space>
      </Flex>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Bookmark của tôi
        </Title>
        <Text type="secondary">
          Tổng cộng {pagination.total} truyện đã được bookmark
        </Text>
      </div>

      {bookmarks.length === 0 ? (
        <Empty
          image={<BookOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
          description={
            <Space direction="vertical" size="middle">
              <Title level={4} type="secondary">
                Chưa có bookmark nào
              </Title>
              <Text type="secondary">
                Bắt đầu bookmark những truyện yêu thích để dễ dàng truy cập sau
                này.
              </Text>
            </Space>
          }
        >
          <Link to="/">
            <Button type="primary" size="large">
              Khám phá truyện
            </Button>
          </Link>
        </Empty>
      ) : (
        <>
          {/* Story Grid */}
          <Row gutter={[16, 24]}>
            {bookmarks.map((bookmark) => {
              const story = bookmark.storyId;
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={bookmark._id}>
                  <Card
                    hoverable
                    style={{ height: "100%" }}
                    cover={
                      <div style={{ position: "relative", height: 200 }}>
                        <Image
                          src={
                            story.cover ||
                            "https://via.placeholder.com/300x200/f0f0f0/999?text=No+Image"
                          }
                          alt={story.title}
                          style={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                          }}
                          preview={false}
                        />
                        <Tooltip title="Xóa bookmark">
                          <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              handleRemoveBookmark(story._id, story.title)
                            }
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              borderRadius: "50%",
                              width: 32,
                              height: 32,
                            }}
                          />
                        </Tooltip>
                      </div>
                    }
                    bodyStyle={{ padding: 16 }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Link to={`/story/${story._id}`}>
                        <Title
                          level={5}
                          style={{
                            margin: 0,
                            fontSize: 14,
                            lineHeight: "1.4",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {story.title}
                        </Title>
                      </Link>

                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tác giả: {story.author}
                      </Text>

                      {/* Tags */}
                      <div>
                        {story.tags?.slice(0, 2).map((tag, index) => (
                          <Tag key={index} color="blue" size="small">
                            {tag}
                          </Tag>
                        ))}
                        {story.tags?.length > 2 && (
                          <Tag color="default" size="small">
                            +{story.tags.length - 2}
                          </Tag>
                        )}
                      </div>

                      {/* Stats */}
                      <Flex justify="space-between" style={{ fontSize: 11 }}>
                        <Flex align="center" gap={4}>
                          <StarOutlined style={{ color: "#faad14" }} />
                          <Text style={{ fontSize: 11 }}>
                            {story.rating?.toFixed(1) || "N/A"}
                          </Text>
                        </Flex>
                        <Flex align="center" gap={4}>
                          <EyeOutlined style={{ color: "#1890ff" }} />
                          <Text style={{ fontSize: 11 }}>
                            {story.viewCount || 0}
                          </Text>
                        </Flex>
                        <Flex align="center" gap={4}>
                          <HeartOutlined style={{ color: "#eb2f96" }} />
                          <Text style={{ fontSize: 11 }}>
                            {story.likeCount || 0}
                          </Text>
                        </Flex>
                      </Flex>

                      <Text type="secondary" style={{ fontSize: 10 }}>
                        Bookmark: {formatDate(bookmark.addedAt)}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Flex justify="center" style={{ marginTop: 32 }}>
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} mục`
                }
              />
            </Flex>
          )}
        </>
      )}
    </div>
  );
};

export default Bookmarks;
