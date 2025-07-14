import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Button,
  Space,
  InputNumber,
  Affix,
  Card,
  Progress,
  Alert,
  Rate,
  Input,
  List,
  Avatar,
  Divider,
  message,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
  MinusOutlined,
  PlusOutlined,
  LoginOutlined,
  SendOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useReadingProgress } from "../contexts/ReadingProgressContext";
import { commentsAPI, chaptersAPI } from "../services/api";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const ReaderView = ({ story, chapter }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getStoryProgress, updateStoryProgress } = useReadingProgress();
  const [fontSize, setFontSize] = useState(16);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [chapterRating, setChapterRating] = useState({ average: 0, count: 0 });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);

  // Safe access to chapters with fallback
  const totalChapters = story?.totalChapters || story?.chapters?.length || 0;
  const currentChapter = chapter?.number || 1;
  const readingProgress = story
    ? getStoryProgress(story._id)
    : { lastChapter: 0 };

  useEffect(() => {
    // Update reading progress when chapter changes
    if (story?._id && chapter?.number && totalChapters > 0) {
      updateStoryProgress(
        story._id,
        chapter.number,
        Math.round((chapter.number / totalChapters) * 100)
      );
    }
  }, [story?._id, chapter?.number, totalChapters]);

  // Load comments and ratings when chapter changes
  useEffect(() => {
    if (chapter?._id) {
      loadChapterComments();
      loadChapterRating();
      if (isAuthenticated) {
        loadUserRating();
      }
    }
  }, [chapter?._id, isAuthenticated]);

  const loadChapterComments = async () => {
    try {
      setLoadingComments(true);
      const response = await commentsAPI.getByChapter(chapter._id, {
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.data.success) {
        setComments(response.data.data.comments || []);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
      message.error("Không thể tải bình luận");
    } finally {
      setLoadingComments(false);
    }
  };

  const loadChapterRating = async () => {
    try {
      setLoadingRating(true);
      const response = await chaptersAPI.getChapterRating(chapter._id);

      if (response.data.success) {
        setChapterRating({
          average: response.data.data.average || 0,
          count: response.data.data.count || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load rating:", error);
    } finally {
      setLoadingRating(false);
    }
  };

  const loadUserRating = async () => {
    try {
      const response = await chaptersAPI.getUserChapterRating(chapter._id);

      if (response.data.success) {
        setUserRating(response.data.data.userRating || 0);
      }
    } catch (error) {
      console.error("Failed to load user rating:", error);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      navigate(`/story/${story.slug}/chapter/${currentChapter - 1}`);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < totalChapters) {
      navigate(`/story/${story.slug}/chapter/${currentChapter + 1}`);
    }
  };

  const handleFontSizeChange = (value) => {
    if (value && value >= 12 && value <= 24) {
      setFontSize(value);
    }
  };

  const handleRatingChange = async (value) => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để đánh giá");
      return;
    }

    try {
      const response = await chaptersAPI.rateChapter(chapter._id, value);

      if (response.data.success) {
        setUserRating(value);
        setChapterRating({
          average: response.data.data.average,
          count: response.data.data.count,
        });
        message.success(`Bạn đã đánh giá ${value} sao cho chương này`);
      }
    } catch (error) {
      console.error("Failed to rate chapter:", error);
      message.error("Không thể gửi đánh giá");
    }
  };

  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!commentText.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận");
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await commentsAPI.create({
        content: commentText.trim(),
        chapterId: chapter._id,
        storyId: story._id,
      });

      if (response.data.success) {
        const newComment = response.data.data.comment;
        setComments([newComment, ...comments]);
        setCommentText("");
        message.success("Bình luận đã được đăng thành công");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      message.error("Có lỗi xảy ra khi đăng bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatCommentTime = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }
  };

  return (
    <Layout className="layout-container">
      {/* Header */}
      <Affix offsetTop={0}>
        <Header
          className="layout-header"
          style={{
            padding: "0 16px",
            height: "auto",
            minHeight: "64px",
          }}
        >
          <div
            className="header-content"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              padding: "12px 0",
            }}
          >
            {/* Left Section - Back Button & Story Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flex: "1",
                minWidth: "0",
              }}
            >
              <Link to={`/story/${story?.slug}`}>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  size="large"
                  style={{
                    color: "var(--text-color)",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    borderRadius: "var(--border-radius)",
                    transition: "all 0.3s ease",
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Quay lại
                </Button>
              </Link>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderLeft: "2px solid var(--border-color)",
                  paddingLeft: "16px",
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: "var(--text-color)",
                    fontSize: "16px",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={story?.title}
                >
                  {story?.title}
                </Title>
                <Text
                  style={{
                    color: "var(--text-color-secondary)",
                    fontSize: "14px",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: "2px",
                  }}
                  title={`Chương ${currentChapter}: ${chapter?.title}`}
                >
                  Chương {currentChapter}: {chapter?.title}
                </Text>
              </div>
            </div>

            {/* Right Section - Font Size Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                background: "var(--background-color-light)",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <Text
                style={{
                  color: "var(--text-color-secondary)",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                Cỡ chữ:
              </Text>

              <Button
                icon={<MinusOutlined />}
                onClick={() => handleFontSizeChange(fontSize - 2)}
                disabled={fontSize <= 12}
                title="Giảm cỡ chữ"
                size="small"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-color)",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />

              <div
                style={{
                  minWidth: "48px",
                  textAlign: "center",
                  color: "var(--text-color)",
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "4px 8px",
                  background: "var(--card-bg)",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color)",
                }}
              >
                {fontSize}px
              </div>

              <Button
                icon={<PlusOutlined />}
                onClick={() => handleFontSizeChange(fontSize + 2)}
                disabled={fontSize >= 24}
                title="Tăng cỡ chữ"
                size="small"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-color)",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </div>
          </div>
        </Header>
      </Affix>

      {/* Content */}
      <Content className="layout-content">
        <div className="main-content">
          {/* Progress Bar - Only for authenticated users */}
          {isAuthenticated && totalChapters > 0 && (
            <Card
              className="story-card fade-in"
              style={{
                marginBottom: 24,
                background: "var(--card-bg)",
                borderColor: "var(--border-color)",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text
                  strong
                  style={{
                    color: "var(--text-color)",
                    fontSize: "16px",
                  }}
                >
                  Tiến độ đọc{" "}
                  {readingProgress.lastChapter === totalChapters &&
                    "✓ Đã hoàn thành chương"}
                </Text>
                <Progress
                  percent={
                    readingProgress.lastChapter === totalChapters
                      ? 100
                      : Math.round(
                          (readingProgress.lastChapter / totalChapters) * 100
                        )
                  }
                  format={() =>
                    readingProgress.lastChapter === totalChapters
                      ? `✓ ${readingProgress.lastChapter}/${totalChapters}`
                      : `${readingProgress.lastChapter}/${totalChapters}`
                  }
                  strokeColor={
                    readingProgress.lastChapter === totalChapters
                      ? {
                          from: "#52c41a",
                          to: "#73d13d",
                        }
                      : {
                          from: "#1890ff",
                          to: "#722ed1",
                        }
                  }
                  trailColor="var(--border-color)"
                />
              </Space>
            </Card>
          )}

          {/* Login reminder for non-authenticated users */}
          {!isAuthenticated && (
            <Alert
              message="Đăng nhập để theo dõi tiến độ đọc"
              description="Đăng nhập để lưu tiến độ đọc của bạn và đồng bộ trên tất cả thiết bị."
              type="info"
              action={
                <Button
                  size="small"
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </Button>
              }
              style={{
                marginBottom: 24,
                background: "var(--card-bg)",
                borderColor: "var(--border-color)",
              }}
              showIcon
            />
          )}

          {/* Chapter Content */}
          <Card
            className="story-card fade-in"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
              <Title
                level={2}
                style={{
                  marginBottom: 32,
                  color: "var(--text-color)",
                  fontSize: `${Math.max(fontSize + 8, 24)}px`,
                }}
              >
                Chương {currentChapter}: {chapter?.title}
              </Title>

              <div
                className="reading-font"
                style={{
                  whiteSpace: "pre-wrap",
                  color: "var(--text-color)",
                  fontFamily: "Georgia, serif",
                  lineHeight: 1.8,
                  fontSize: `${fontSize}px`,
                }}
              >
                {chapter?.content}
              </div>
            </div>
          </Card>

          {/* Comment and Rating Section */}
          <Card
            className="story-card fade-in"
            style={{
              marginTop: 24,
              background: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <Title
              level={3}
              style={{
                marginBottom: 24,
                color: "var(--text-color)",
                fontSize: "20px",
              }}
            >
              Đánh giá & Bình luận
            </Title>

            {/* Rating Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={8}>
                <Card
                  size="small"
                  style={{
                    background: "var(--background-color-light)",
                    borderColor: "var(--border-color)",
                    textAlign: "center",
                  }}
                  loading={loadingRating}
                >
                  <Statistic
                    title={
                      <Text style={{ color: "var(--text-color-secondary)" }}>
                        Đánh giá trung bình
                      </Text>
                    }
                    value={chapterRating.average}
                    precision={1}
                    prefix={<StarOutlined style={{ color: "#faad14" }} />}
                    suffix={
                      <Text style={{ color: "var(--text-color-secondary)" }}>
                        / 5
                      </Text>
                    }
                    valueStyle={{ color: "var(--text-color)" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card
                  size="small"
                  style={{
                    background: "var(--background-color-light)",
                    borderColor: "var(--border-color)",
                    textAlign: "center",
                  }}
                  loading={loadingRating}
                >
                  <Statistic
                    title={
                      <Text style={{ color: "var(--text-color-secondary)" }}>
                        Số lượt đánh giá
                      </Text>
                    }
                    value={chapterRating.count}
                    valueStyle={{ color: "var(--text-color)" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Card
                  size="small"
                  style={{
                    background: "var(--background-color-light)",
                    borderColor: "var(--border-color)",
                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "var(--text-color-secondary)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Đánh giá của bạn
                  </Text>
                  <Rate
                    value={userRating}
                    onChange={handleRatingChange}
                    style={{ fontSize: "20px" }}
                    disabled={!isAuthenticated}
                  />
                </Card>
              </Col>
            </Row>

            <Divider style={{ borderColor: "var(--border-color)" }} />

            {/* Comment Input Section */}
            {isAuthenticated ? (
              <div style={{ marginBottom: 24 }}>
                <Title
                  level={4}
                  style={{
                    marginBottom: 16,
                    color: "var(--text-color)",
                    fontSize: "16px",
                  }}
                >
                  Viết bình luận
                </Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <TextArea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về chương này..."
                    rows={4}
                    maxLength={500}
                    showCount
                    style={{
                      background: "var(--background-color-light)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-color)",
                    }}
                  />
                  <div style={{ textAlign: "right" }}>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleCommentSubmit}
                      loading={submittingComment}
                      disabled={!commentText.trim()}
                      className="btn-gradient"
                    >
                      Đăng bình luận
                    </Button>
                  </div>
                </Space>
              </div>
            ) : (
              <Alert
                message="Đăng nhập để bình luận"
                description="Bạn cần đăng nhập để có thể đánh giá và bình luận về chương này."
                type="info"
                action={
                  <Button
                    size="small"
                    type="primary"
                    icon={<LoginOutlined />}
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập
                  </Button>
                }
                style={{
                  marginBottom: 24,
                  background: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                }}
                showIcon
              />
            )}

            {/* Comments List */}
            <Title
              level={4}
              style={{
                marginBottom: 16,
                color: "var(--text-color)",
                fontSize: "16px",
              }}
            >
              Bình luận ({comments.length})
            </Title>

            {loadingComments ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "var(--text-color-secondary)",
                }}
              >
                <Text>Đang tải bình luận...</Text>
              </div>
            ) : comments.length > 0 ? (
              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item
                    style={{
                      padding: "16px 0",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={comment.userId?.profile?.avatar}
                          icon={<UserOutlined />}
                          style={{
                            background: "var(--primary-color)",
                          }}
                        />
                      }
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              color: "var(--text-color)",
                              fontSize: "14px",
                            }}
                          >
                            {comment.userId?.profile?.displayName ||
                              comment.userId?.username ||
                              "Người dùng ẩn danh"}
                          </Text>
                          <Text
                            style={{
                              color: "var(--text-color-secondary)",
                              fontSize: "12px",
                            }}
                          >
                            {formatCommentTime(comment.createdAt)}
                          </Text>
                        </div>
                      }
                      description={
                        <Text
                          style={{
                            color: "var(--text-color)",
                            fontSize: "14px",
                            lineHeight: 1.6,
                            marginTop: "8px",
                            display: "block",
                          }}
                        >
                          {comment.content}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "var(--text-color-secondary)",
                }}
              >
                <Text>
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </Text>
              </div>
            )}
          </Card>
        </div>
      </Content>

      {/* Navigation Footer */}
      <Affix offsetBottom={0}>
        <Footer className="layout-footer">
          <div className="footer-content">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <Button
                icon={<LeftOutlined />}
                onClick={handlePrevChapter}
                disabled={currentChapter <= 1}
                size="large"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-color)",
                }}
              >
                Chương trước
              </Button>

              <Space>
                <Text
                  strong
                  style={{
                    color: "var(--text-color)",
                    fontSize: "16px",
                  }}
                >
                  {currentChapter} / {totalChapters || 0}
                </Text>
              </Space>

              <Button
                type="primary"
                icon={<RightOutlined />}
                onClick={handleNextChapter}
                disabled={currentChapter >= totalChapters}
                size="large"
                iconPosition="end"
                className="btn-gradient"
              >
                Chương sau
              </Button>
            </div>
          </div>
        </Footer>
      </Affix>
    </Layout>
  );
};

export default ReaderView;
