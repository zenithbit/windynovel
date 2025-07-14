import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Spin,
  Typography,
  Card,
  Row,
  Col,
  Button,
  Tag,
  Progress,
  Empty,
  Flex,
  Pagination,
  Space,
  Avatar,
  Divider,
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  ReadOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useToast } from "../contexts/ToastContext";
import { usersAPI } from "../services/api";

const { Title, Text, Paragraph } = Typography;

const ReadingHistory = () => {
  const { showToast } = useToast();
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    loadReadingHistory(1);
  }, []);

  const loadReadingHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await usersAPI.getReadingHistory({ page, limit: 20 });

      if (response.data.success) {
        setReadingHistory(response.data.data.history);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load reading history:", error);
      showToast("Không thể tải lịch sử đọc", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgressWidth = (progress) => {
    return Math.max(2, Math.min(100, progress));
  };

  const handlePageChange = (newPage) => {
    loadReadingHistory(newPage);
  };

  if (loading && pagination.current === 1) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{
          minHeight: "100vh",
          background: "var(--background-color-light)",
          padding: "24px 16px",
        }}
      >
        <Flex vertical align="center" gap="large">
          <Spin size="large" />
          <Text style={{ fontSize: "18px", color: "var(--text-color)" }}>
            Đang tải lịch sử đọc...
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background-color-light)",
        padding: "24px 0",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        {/* Header Section */}
        <Card
          style={{
            marginBottom: "32px",
            borderRadius: "16px",
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--box-shadow)",
          }}
        >
          <Flex align="center" gap="large">
            <Avatar
              size={64}
              icon={<BookOutlined />}
              style={{
                background: "var(--primary-color)",
                fontSize: "24px",
              }}
            />
            <div>
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "var(--text-color)",
                }}
              >
                Lịch sử đọc
              </Title>
              <Text
                style={{
                  fontSize: "16px",
                  color: "var(--text-color-secondary)",
                }}
              >
                Tổng cộng{" "}
                <Text strong style={{ color: "var(--primary-color)" }}>
                  {pagination.total}
                </Text>{" "}
                lần đọc truyện
              </Text>
            </div>
          </Flex>
        </Card>

        {readingHistory.length === 0 ? (
          <Card
            style={{
              borderRadius: "16px",
              textAlign: "center",
              padding: "40px 20px",
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Empty
              image={
                <BookOutlined
                  style={{ fontSize: "64px", color: "var(--primary-color)" }}
                />
              }
              imageStyle={{ height: "100px" }}
              description={
                <Flex vertical align="center" gap="medium">
                  <Title level={3} style={{ color: "var(--text-color)" }}>
                    Chưa có lịch sử đọc
                  </Title>
                  <Paragraph
                    style={{
                      fontSize: "16px",
                      color: "var(--text-color-secondary)",
                      marginBottom: "32px",
                    }}
                  >
                    Bắt đầu đọc những truyện thú vị để xây dựng lịch sử đọc của
                    bạn.
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ReadOutlined />}
                    className="btn-gradient"
                    style={{
                      borderRadius: "8px",
                      height: "48px",
                      padding: "0 32px",
                    }}
                  >
                    <Link
                      to="/"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      Khám phá truyện
                    </Link>
                  </Button>
                </Flex>
              }
            />
          </Card>
        ) : (
          <>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {readingHistory.map((historyItem) => {
                const story = historyItem.storyId;
                return (
                  <Card
                    key={historyItem._id}
                    hoverable
                    className="story-card"
                    style={{
                      borderRadius: "16px",
                      background: "var(--card-bg)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <Row gutter={[24, 16]} align="middle">
                      {/* Story Cover */}
                      <Col xs={24} sm={6} md={4}>
                        <Flex justify="center">
                          {story.cover ? (
                            <img
                              src={story.cover}
                              alt={story.title}
                              style={{
                                width: "80px",
                                height: "112px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "var(--box-shadow)",
                              }}
                            />
                          ) : (
                            <Flex
                              justify="center"
                              align="center"
                              style={{
                                width: "80px",
                                height: "112px",
                                background: "var(--background-color-light)",
                                borderRadius: "8px",
                                boxShadow: "var(--box-shadow)",
                                border: "1px solid var(--border-color)",
                              }}
                            >
                              <PictureOutlined
                                style={{
                                  fontSize: "24px",
                                  color: "var(--text-color-secondary)",
                                }}
                              />
                            </Flex>
                          )}
                        </Flex>
                      </Col>

                      {/* Story Info */}
                      <Col xs={24} sm={18} md={20}>
                        <Row gutter={[16, 12]}>
                          <Col xs={24} lg={16}>
                            <Link
                              to={`/story/${story.slug}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Title
                                level={4}
                                style={{
                                  margin: "0 0 8px 0",
                                  color: "var(--text-color)",
                                }}
                                className="story-title-hover"
                              >
                                {story.title}
                              </Title>
                            </Link>

                            <Text
                              style={{
                                color: "var(--text-color-secondary)",
                                marginBottom: "12px",
                                display: "block",
                              }}
                            >
                              Tác giả:{" "}
                              <Text
                                strong
                                style={{ color: "var(--text-color)" }}
                              >
                                {story.author}
                              </Text>
                            </Text>

                            {/* Tags */}
                            <Space wrap>
                              {story.tags?.slice(0, 3).map((tag, index) => (
                                <Tag
                                  key={index}
                                  color="blue"
                                  style={{ borderRadius: "12px" }}
                                >
                                  {tag}
                                </Tag>
                              ))}
                              {story.tags?.length > 3 && (
                                <Tag
                                  style={{
                                    borderRadius: "12px",
                                    borderColor: "var(--border-color)",
                                  }}
                                >
                                  +{story.tags.length - 3}
                                </Tag>
                              )}
                            </Space>
                          </Col>

                          {/* Reading Progress */}
                          <Col xs={24} lg={8}>
                            <Card
                              size="small"
                              style={{
                                background: "var(--background-color-light)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: "14px",
                                  color: "var(--text-color-secondary)",
                                }}
                              >
                                <Text
                                  strong
                                  style={{ color: "var(--primary-color)" }}
                                >
                                  Chương {historyItem.chapterNumber}
                                </Text>
                                {story.totalChapters && (
                                  <Text
                                    style={{
                                      color: "var(--text-color-secondary)",
                                    }}
                                  >
                                    /{story.totalChapters}
                                  </Text>
                                )}
                              </Text>

                              <Progress
                                percent={getProgressWidth(historyItem.progress)}
                                size="small"
                                style={{ margin: "8px 0" }}
                                strokeColor="var(--primary-color)"
                              />

                              <Text
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-color-secondary)",
                                }}
                              >
                                {historyItem.progress}% hoàn thành
                              </Text>
                            </Card>
                          </Col>
                        </Row>

                        <Divider
                          style={{
                            margin: "16px 0",
                            borderColor: "var(--border-color)",
                          }}
                        />

                        {/* Action Section */}
                        <Row
                          justify="space-between"
                          align="middle"
                          gutter={[16, 8]}
                        >
                          <Col xs={24} sm={12}>
                            <Flex align="center" gap="small">
                              <ClockCircleOutlined
                                style={{ color: "var(--text-color-secondary)" }}
                              />
                              <Text
                                style={{
                                  fontSize: "14px",
                                  color: "var(--text-color-secondary)",
                                }}
                              >
                                Đọc lần cuối: {formatDate(historyItem.readAt)}
                              </Text>
                            </Flex>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Flex gap="small" justify="end" wrap>
                              {(() => {
                                const isLastChapter =
                                  story.totalChapters &&
                                  historyItem.chapterNumber >=
                                    story.totalChapters;

                                console.log(story.totalChapters, historyItem);

                                return (
                                  <Button
                                    type="primary"
                                    icon={<ReadOutlined />}
                                    style={{ borderRadius: "6px" }}
                                    disabled={isLastChapter}
                                  >
                                    {isLastChapter ? (
                                      "Đã đọc hết"
                                    ) : (
                                      <Link
                                        to={`/story/${story.slug}/chapter/${historyItem.chapterNumber}`}
                                        style={{
                                          color: "inherit",
                                          textDecoration: "none",
                                        }}
                                      >
                                        Tiếp tục đọc
                                      </Link>
                                    )}
                                  </Button>
                                );
                              })()}

                              <Button
                                icon={<EyeOutlined />}
                                style={{
                                  borderRadius: "6px",
                                  borderColor: "var(--border-color)",
                                  color: "var(--text-color)",
                                }}
                              >
                                <Link
                                  to={`/story/${story.slug}`}
                                  style={{
                                    color: "inherit",
                                    textDecoration: "none",
                                  }}
                                >
                                  Xem truyện
                                </Link>
                              </Button>
                            </Flex>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </Space>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Flex justify="center" style={{ marginTop: "32px" }}>
                <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  pageSize={20}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} mục`
                  }
                  onChange={handlePageChange}
                  disabled={loading}
                />
              </Flex>
            )}
          </>
        )}
      </div>

      <style>{`
        .story-title-hover:hover {
          color: var(--primary-color) !important;
          transition: color 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ReadingHistory;
