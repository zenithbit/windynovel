import { useParams, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Spin,
  Alert,
  Button,
  Typography,
  Image,
  Tag,
  Card,
  Space,
  Divider,
  Row,
  Col,
  Flex,
} from "antd";
import {
  ArrowLeftOutlined,
  ReadOutlined,
  ReloadOutlined,
  EditOutlined,
  SyncOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ChapterList from "../components/ChapterList";
import { storiesAPI, chaptersAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useReadingProgress } from "../contexts/ReadingProgressContext";

const { Title, Text, Paragraph } = Typography;

const StoryDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { getStoryProgress } = useReadingProgress();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const storyResponse = await storiesAPI.getBySlug(id);
      const storyData = storyResponse.data.data.story;
      setStory(storyData);

      const chaptersResponse = await chaptersAPI.getByStory(storyData._id);
      setChapters(chaptersResponse.data.data.chapters || []);
    } catch (err) {
      console.error("Error fetching story:", err);
      setError(err.response?.data?.message || "Không thể tải thông tin truyện");
    } finally {
      setLoading(false);
    }
  };

  const refreshChapters = async () => {
    if (!story) return;

    try {
      setRefreshing(true);
      const chaptersResponse = await chaptersAPI.getByStory(story._id);
      setChapters(chaptersResponse.data.data.chapters || []);
    } catch (err) {
      console.error("Error refreshing chapters:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStoryData();
    }
  }, [id]);

  // Auto refresh when returning from write-chapter page
  useEffect(() => {
    // Check if user came from write-chapter page
    if (location.state?.from === "write-chapter" && story) {
      refreshChapters();
    }
  }, [location.state, story]);

  // Add event listener for when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      refreshChapters();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [story]);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (error || !story) {
    return (
      <Flex
        justify="center"
        align="center"
        vertical
        style={{ minHeight: "100vh", padding: "0 24px" }}
      >
        <Title level={2} style={{ textAlign: "center" }}>
          {error ? "Lỗi tải truyện" : "Không tìm thấy truyện"}
        </Title>
        <Paragraph style={{ textAlign: "center", marginBottom: 16 }}>
          {error || "Truyện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </Paragraph>
        {error && (
          <Alert message={error} type="error" style={{ marginBottom: 16 }} />
        )}
        <Link to="/">
          <Button type="primary" icon={<ArrowLeftOutlined />}>
            Về trang chủ
          </Button>
        </Link>
      </Flex>
    );
  }

  const readingProgress = story
    ? getStoryProgress(story._id)
    : { lastChapter: 0 };
  const lastChapter = readingProgress.lastChapter || 0;
  const totalChapters = chapters.length;

  const continueReading = () => {
    const nextChapter = lastChapter < totalChapters ? lastChapter + 1 : 1;
    return `/story/${story.slug}/chapter/${nextChapter}`;
  };

  // Check if current user is the story author
  const isAuthor =
    isAuthenticated &&
    user &&
    story &&
    (user.id === story.createdBy._id || user._id === story.createdBy._id);

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, paddingTop: 16 }}>
        <Link to="/">
          <Button type="text" icon={<ArrowLeftOutlined />}>
            Quay lại trang chủ
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Row gutter={[24, 24]}>
          {/* Story Cover - Responsive */}
          <Col xs={24} sm={8} md={6}>
            <Image
              src={
                story.cover ||
                "https://via.placeholder.com/400x600/6B7280/FFFFFF?text=No+Image"
              }
              alt={story.title}
              style={{
                width: "100%",
                borderRadius: 8,
                maxWidth: 300,
                margin: "0 auto",
                display: "block",
              }}
            />
          </Col>

          {/* Story Info - Responsive */}
          <Col xs={24} sm={16} md={18}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={1} style={{ marginBottom: 0 }}>
                {story.title}
              </Title>

              <Space direction="vertical" size="small">
                <Text strong>Tác giả: {story.author}</Text>
                {story.translator && (
                  <Text strong>Dịch giả: {story.translator}</Text>
                )}
              </Space>

              <Paragraph style={{ marginBottom: 16 }}>
                {story.description}
              </Paragraph>

              {story.tags && story.tags.length > 0 && (
                <div>
                  <Text strong>Thể loại: </Text>
                  <Space wrap style={{ marginTop: 8 }}>
                    {story.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* Story Stats - Mobile Responsive */}
              <Card style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Flex vertical align="center">
                      <Text type="secondary">Tổng chương</Text>
                      <Title level={4} style={{ margin: 0 }}>
                        {totalChapters}
                      </Title>
                    </Flex>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Flex vertical align="center">
                      <Text type="secondary">Tiến độ đọc</Text>
                      <Title level={4} style={{ margin: 0 }}>
                        {lastChapter}/{totalChapters}
                      </Title>
                    </Flex>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Flex vertical align="center">
                      <Text type="secondary">Lượt xem</Text>
                      <Title level={4} style={{ margin: 0 }}>
                        {story.viewCount || 0}
                      </Title>
                    </Flex>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Flex vertical align="center">
                      <Text type="secondary">Đánh giá</Text>
                      <Title level={4} style={{ margin: 0 }}>
                        {story.rating?.average?.toFixed(1) || "0.0"}
                      </Title>
                    </Flex>
                  </Col>
                </Row>
              </Card>

              {/* Action Buttons - Mobile Responsive */}
              <div style={{ marginTop: 24 }}>
                {totalChapters > 0 ? (
                  <Space wrap size="middle">
                    <Link
                      to={
                        lastChapter >= totalChapters ? "#" : continueReading()
                      }
                    >
                      <Button
                        type="primary"
                        size="large"
                        icon={<ReadOutlined />}
                        disabled={lastChapter >= totalChapters}
                      >
                        {lastChapter >= totalChapters
                          ? "Đã đọc hết"
                          : lastChapter > 0
                          ? "Tiếp tục đọc"
                          : "Bắt đầu đọc"}
                      </Button>
                    </Link>

                    {lastChapter > 0 && (
                      <Link to={`/story/${story.slug}/chapter/1`}>
                        <Button size="large" icon={<ReloadOutlined />}>
                          Đọc lại từ đầu
                        </Button>
                      </Link>
                    )}

                    {isAuthor && (
                      <>
                        <Link to={`/story/${story.slug}/edit`}>
                          <Button
                            type="default"
                            size="large"
                            icon={<SettingOutlined />}
                            style={{
                              background: "#1890ff",
                              borderColor: "#1890ff",
                              color: "white",
                            }}
                          >
                            Chỉnh sửa truyện
                          </Button>
                        </Link>
                        <Link to={`/story/${story.slug}/write-chapter`}>
                          <Button
                            type="default"
                            size="large"
                            icon={<EditOutlined />}
                            style={{
                              background: "#52c41a",
                              borderColor: "#52c41a",
                              color: "white",
                            }}
                          >
                            Viết chương mới
                          </Button>
                        </Link>
                        <Button
                          size="large"
                          icon={<SyncOutlined spin={refreshing} />}
                          onClick={refreshChapters}
                          loading={refreshing}
                          title="Làm mới danh sách chương"
                        >
                          Làm mới
                        </Button>
                      </>
                    )}
                  </Space>
                ) : (
                  <Space wrap>
                    <Text type="secondary">Truyện chưa có chương nào</Text>
                    {isAuthor && (
                      <>
                        <Link to={`/story/${story.slug}/edit`}>
                          <Button
                            type="default"
                            size="large"
                            icon={<SettingOutlined />}
                            style={{
                              background: "#1890ff",
                              borderColor: "#1890ff",
                              color: "white",
                            }}
                          >
                            Chỉnh sửa truyện
                          </Button>
                        </Link>
                        <Link to={`/story/${story.slug}/write-chapter`}>
                          <Button
                            type="primary"
                            size="large"
                            icon={<EditOutlined />}
                          >
                            Viết chương đầu tiên
                          </Button>
                        </Link>
                      </>
                    )}
                  </Space>
                )}
              </div>
            </Space>
          </Col>
        </Row>

        {/* Chapter List */}
        {totalChapters > 0 && (
          <>
            <Divider />
            <div style={{ marginTop: 32 }}>
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={16}
                style={{ marginBottom: 16 }}
              >
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    Danh sách chương
                  </Title>
                  <Text type="secondary">Tổng cộng {totalChapters} chương</Text>
                </div>
                {isAuthor && (
                  <Button
                    icon={<SyncOutlined spin={refreshing} />}
                    onClick={refreshChapters}
                    loading={refreshing}
                    title="Làm mới danh sách chương"
                  >
                    Làm mới
                  </Button>
                )}
              </Flex>
              <ChapterList
                story={story}
                chapters={chapters}
                readingProgress={readingProgress}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StoryDetail;
