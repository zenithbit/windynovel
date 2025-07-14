import { Link } from "react-router-dom";
import {
  List,
  Card,
  Typography,
  Tag,
  Badge,
  Empty,
  Space,
  Switch,
  Row,
  Col,
} from "antd";
import {
  RightOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { useReadingProgress } from "../contexts/ReadingProgressContext";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;

const ChapterList = ({ story, chapters = [], readingProgress = {} }) => {
  const { updateStoryProgress } = useReadingProgress();
  const lastChapter = readingProgress.lastChapter || 0;

  // Initialize compact view state from localStorage
  const [isCompactView, setIsCompactView] = useState(() => {
    const saved = localStorage.getItem("chapterListCompactView");
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Save compact view state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "chapterListCompactView",
      JSON.stringify(isCompactView)
    );
  }, [isCompactView]);

  const handleChapterClick = async (chapterNumber) => {
    // Update reading progress when user clicks on a chapter
    if (story && story._id) {
      const totalChapters = chapters.length;
      const progress =
        totalChapters > 0
          ? Math.round((chapterNumber / totalChapters) * 100)
          : 0;

      // Update to the current chapter or higher if they're going back
      const newLastChapter = Math.max(chapterNumber, lastChapter);

      await updateStoryProgress(story._id, newLastChapter, progress);
    }
  };

  const renderCompactView = () => (
    <Row gutter={[8, 8]}>
      {chapters.map((chapter) => {
        const isRead = chapter.number <= lastChapter;

        return (
          <Col xs={12} sm={8} md={6} lg={4} key={chapter.number}>
            <Link
              to={`/story/${story.slug}/chapter/${chapter.number}`}
              onClick={() => handleChapterClick(chapter.number)}
            >
              <Card
                size="small"
                hoverable
                style={{
                  backgroundColor: isRead
                    ? "rgba(24, 144, 255, 0.08)"
                    : "var(--card-bg)",
                  borderColor: isRead
                    ? "var(--primary-color)"
                    : "var(--border-color)",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
                bodyStyle={{ padding: "8px 12px" }}
              >
                {isRead && (
                  <CheckCircleOutlined
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      color: "var(--primary-color)",
                      fontSize: "12px",
                    }}
                  />
                )}
                <div style={{ textAlign: "center" }}>
                  <Text
                    strong
                    style={{
                      color: "var(--text-color)",
                      fontSize: "12px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Ch. {chapter.number}
                  </Text>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "var(--text-color-secondary)",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={chapter.title}
                  >
                    {chapter.title}
                  </Text>
                  {chapter.isPublished === false && (
                    <Tag
                      color="orange"
                      size="small"
                      style={{
                        fontSize: "10px",
                        padding: "0 4px",
                        marginTop: "2px",
                      }}
                    >
                      Chưa XB
                    </Tag>
                  )}
                </div>
              </Card>
            </Link>
          </Col>
        );
      })}
    </Row>
  );

  const renderNormalView = () => (
    <List
      dataSource={chapters}
      renderItem={(chapter) => {
        // A chapter is considered "read" if it's <= lastChapter
        const isRead = chapter.number <= lastChapter;

        return (
          <List.Item style={{ padding: 0, marginBottom: 8 }}>
            <Link
              to={`/story/${story.slug}/chapter/${chapter.number}`}
              style={{ display: "block", width: "100%" }}
              onClick={() => handleChapterClick(chapter.number)}
            >
              <Badge.Ribbon
                text="Đã đọc"
                color="blue"
                style={{ display: isRead ? "block" : "none" }}
              >
                <Card
                  hoverable
                  style={{
                    backgroundColor: isRead
                      ? "rgba(24, 144, 255, 0.08)"
                      : "var(--card-bg)",
                    borderColor: isRead
                      ? "var(--primary-color)"
                      : "var(--border-color)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div>
                          <Space>
                            <Text strong style={{ color: "var(--text-color)" }}>
                              Chương {chapter.number}
                            </Text>
                            {chapter.isPublished === false && (
                              <Tag color="orange" size="small">
                                Chưa xuất bản
                              </Tag>
                            )}
                            {isRead && (
                              <CheckCircleOutlined
                                style={{ color: "var(--primary-color)" }}
                              />
                            )}
                          </Space>
                        </div>

                        <Title
                          level={5}
                          style={{
                            margin: 0,
                            color: "var(--text-color-secondary)",
                            transition: "color 0.3s ease",
                          }}
                        >
                          {chapter.title}
                        </Title>

                        {chapter.wordCount && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "12px",
                              color: "var(--text-color-secondary)",
                            }}
                          >
                            {chapter.wordCount.toLocaleString()} từ
                          </Text>
                        )}
                      </Space>
                    </div>

                    <RightOutlined
                      style={{
                        color: "var(--text-color-secondary)",
                        marginLeft: 16,
                        transition: "color 0.3s ease",
                      }}
                    />
                  </div>
                </Card>
              </Badge.Ribbon>
            </Link>
          </List.Item>
        );
      }}
    />
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Danh sách chương ({chapters.length} chương)
        </Title>

        <Space>
          <BarsOutlined
            style={{
              color: isCompactView
                ? "var(--text-color-secondary)"
                : "var(--primary-color)",
            }}
          />
          <Switch
            checked={isCompactView}
            onChange={setIsCompactView}
            size="small"
          />
          <AppstoreOutlined
            style={{
              color: isCompactView
                ? "var(--primary-color)"
                : "var(--text-color-secondary)",
            }}
          />
        </Space>
      </div>

      {chapters.length === 0 ? (
        <Empty
          description="Truyện chưa có chương nào."
          style={{ padding: "40px 0" }}
        />
      ) : isCompactView ? (
        renderCompactView()
      ) : (
        renderNormalView()
      )}
    </div>
  );
};

export default ChapterList;
