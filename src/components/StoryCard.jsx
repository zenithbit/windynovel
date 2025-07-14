import { Link } from "react-router-dom";
import { Card, Typography, Button, Flex, Space, Image } from "antd";
import { ReadOutlined } from "@ant-design/icons";
import { useReadingProgress } from "../contexts/ReadingProgressContext";

const { Title, Text, Paragraph } = Typography;

const StoryCard = ({ story }) => {
  const { getStoryProgress } = useReadingProgress();
  const readingProgress = getStoryProgress(story._id);
  const lastChapter = readingProgress.lastChapter || 0;
  const totalChapters = story.chapters.length;

  return (
    <Card hoverable style={{ height: "100%" }} bodyStyle={{ padding: 16 }}>
      <Flex gap={16} align="flex-start">
        <div style={{ flexShrink: 0 }}>
          <Image
            src={
              story.cover ||
              "https://via.placeholder.com/100x130/6B7280/FFFFFF?text=No+Image"
            }
            alt={story.title}
            width={80}
            height={110}
            style={{
              borderRadius: 6,
              objectFit: "cover",
            }}
            preview={false}
          />
        </div>

        <Flex
          vertical
          flex={1}
          justify="space-between"
          style={{ minHeight: 110 }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Title
              level={5}
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {story.title}
            </Title>

            <Text type="secondary" style={{ fontSize: 12 }}>
              Tác giả: {story.author}
            </Text>

            <Paragraph
              type="secondary"
              style={{
                margin: 0,
                fontSize: 12,
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {story.description}
            </Paragraph>
          </Space>

          <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: "#999" }}>
              {lastChapter > 0 ? (
                <span>
                  Đã đọc: {lastChapter}/{totalChapters} chương
                </span>
              ) : (
                <span>{totalChapters} chương</span>
              )}
            </Text>

            <Link to={`/story/${story.slug}`}>
              <Button type="primary" size="small" icon={<ReadOutlined />}>
                Đọc ngay
              </Button>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default StoryCard;
