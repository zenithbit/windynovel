import React, { useState, useEffect } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Spin,
  Empty,
  Tag,
  Rate,
  Space,
  Divider,
  Skeleton,
  Image,
  Input,
} from "antd";
import {
  StarFilled,
  EyeOutlined,
  HeartOutlined,
  BookOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FireOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { storiesAPI } from "../services/api";

const { Title, Text, Paragraph } = Typography;

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState({
    featured: [],
    trending: [],
    recent: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    stories: 0,
    authors: 0,
    readers: 0,
    totalViews: 0,
  });

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Fetch featured, trending, recent stories, and statistics from database via API
      // - Featured stories: Stories marked as featured in database with proper ordering
      // - Trending stories: Stories with highest views/likes in last 7 days from database
      // - Recent stories: Latest updated stories from database sorted by updatedAt
      // - Statistics: Platform-wide statistics from database
      const [
        featuredResponse,
        trendingResponse,
        recentResponse,
        statisticsResponse,
      ] = await Promise.all([
        storiesAPI.getFeatured({ limit: 8 }), // Fetch featured stories from database
        storiesAPI.getTrending({ limit: 8 }), // Fetch trending stories from database
        storiesAPI.getAll({
          limit: 8,
          sortBy: "updatedAt",
          sortOrder: "desc",
          isPublished: true, // Ensure only published stories from database
        }),
        storiesAPI.getStatistics(), // Fetch platform statistics from database
      ]);

      setStories({
        featured: featuredResponse.data.data.stories || [],
        trending: trendingResponse.data.data.stories || [],
        recent: recentResponse.data.data.stories || [],
      });

      setStatistics(
        statisticsResponse.data.data.statistics || {
          stories: 0,
          authors: 0,
          readers: 0,
          totalViews: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching data from database:", error);
      // Set empty arrays and default statistics on error
      setStories({
        featured: [],
        trending: [],
        recent: [],
      });
      setStatistics({
        stories: 0,
        authors: 0,
        readers: 0,
        totalViews: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await storiesAPI.getAll({
        search: value.trim(),
        limit: 20,
      });
      setSearchResults(response.data.data.stories || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Function to refresh data manually
  const refreshData = async () => {
    setLoading(true);
    await fetchHomeData();
    // Could add a success message here if needed
  };

  const formatNumber = (num) => {
    if (!num || num === undefined) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "blue";
      case "completed":
        return "green";
      case "paused":
        return "orange";
      case "dropped":
        return "red";
      default:
        return "blue";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ongoing":
        return "Đang ra";
      case "completed":
        return "Hoàn thành";
      case "paused":
        return "Tạm ngưng";
      case "dropped":
        return "Đã dừng";
      default:
        return "Đang ra";
    }
  };

  const renderStoryCard = (story, isLarge = false) => {
    return (
      <Card
        key={story._id}
        hoverable
        className="story-card"
        cover={
          <div
            className={
              isLarge ? "story-cover story-cover-large" : "story-cover"
            }
          >
            <Image
              alt={story.title}
              src={
                story.cover ||
                "https://via.placeholder.com/300x400?text=No+Image"
              }
              preview={false}
              className="story-cover-image"
              fallback="https://via.placeholder.com/300x400?text=No+Image"
            />
            <div className="story-tags">
              <Tag color={getStatusColor(story.status)} size="small">
                {getStatusText(story.status)}
              </Tag>
            </div>
          </div>
        }
        actions={[
          <Space key="views">
            <EyeOutlined />
            <span className="story-action-text">
              {formatNumber(story.viewCount)}
            </span>
          </Space>,
          <Space key="likes">
            <HeartOutlined />
            <span className="story-action-text">
              {formatNumber(story.likeCount)}
            </span>
          </Space>,
          <Space key="chapters">
            <BookOutlined />
            <span className="story-action-text">
              {story.totalChapters || 0} chương
            </span>
          </Space>,
        ]}
        onClick={() => (window.location.href = `/story/${story.slug}`)}
      >
        <Card.Meta
          title={
            <div className="story-title-container">
              <Text className="story-title" ellipsis={{ rows: 2 }}>
                {story.title}
              </Text>
              {story.featured && (
                <Tag icon={<StarFilled />} color="gold" size="small">
                  Nổi bật
                </Tag>
              )}
            </div>
          }
          description={
            <div className="story-meta">
              <Text type="secondary" className="story-author">
                Tác giả: {story.author}
              </Text>
              {story.translator && (
                <Text type="secondary" className="story-translator">
                  Dịch giả: {story.translator}
                </Text>
              )}
              <Paragraph
                ellipsis={{ rows: 3, expandable: false }}
                className="story-description"
              >
                {story.description}
              </Paragraph>
              <div className="story-tags-container">
                {story.tags &&
                  story.tags.slice(0, 3).map((tag) => (
                    <Tag key={tag} size="small">
                      {tag}
                    </Tag>
                  ))}
              </div>
              <div className="story-stats">
                <Space>
                  <Rate
                    disabled
                    defaultValue={story.rating?.average || 0}
                    count={5}
                    size="small"
                  />
                  <Text type="secondary" className="story-rating">
                    ({story.rating?.average?.toFixed(1) || "0.0"})
                  </Text>
                </Space>
              </div>
            </div>
          }
        />
      </Card>
    );
  };

  const renderSection = (title, storiesList, icon, isSearch = false) => (
    <div className="section-container">
      <div className="section-header">
        <span
          className={`section-icon ${
            icon === FireOutlined
              ? "section-icon-featured"
              : icon === SearchOutlined
              ? "section-icon-search"
              : "section-icon-book"
          }`}
        >
          {React.createElement(icon)}
        </span>
        <Title level={3} className="section-title">
          {title}
        </Title>
      </div>

      {storiesList.length === 0 ? (
        <div className="empty-state">
          <Empty
            description={
              isSearch ? "Không tìm thấy truyện nào" : "Chưa có truyện"
            }
          />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {storiesList.map((story, index) => (
            <Col key={story._id} xs={24} sm={12} md={8} lg={6}>
              {renderStoryCard(story, index === 0 && title.includes("Nổi bật"))}
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="home-container">
        <Skeleton active />
        <Divider />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col key={i} xs={24} sm={12} md={8} lg={6}>
              <Card loading />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <Title level={2} className="hero-title">
          Chào mừng đến với WindyNovel
        </Title>
        <Paragraph className="hero-description">
          Khám phá hàng ngàn câu chuyện hấp dẫn từ các tác giả tài năng. Đọc,
          viết và chia sẻ đam mê văn học của bạn.
        </Paragraph>

        <Space direction="vertical" size="middle" className="hero-actions">
          <div className="search-container">
            <Input.Search
              placeholder="Tìm kiếm truyện, tác giả..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              className="search-bar"
            />
          </div>
          <Space size="middle">
            <Button
              type="primary"
              size="large"
              className="hero-button"
              onClick={() => (window.location.href = "/explore")}
            >
              Khám phá ngay
            </Button>
            <Button size="large" className="hero-button" onClick={refreshData}>
              Làm mới
            </Button>
          </Space>
        </Space>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <>
          <div className="section-container">
            <div className="section-header">
              <span className="section-icon section-icon-search">
                <SearchOutlined />
              </span>
              <Title level={3} className="section-title">
                Kết quả tìm kiếm "{searchQuery}"
              </Title>
            </div>

            {searchLoading ? (
              <Row gutter={[16, 16]}>
                {[1, 2, 3, 4].map((i) => (
                  <Col key={i} xs={24} sm={12} md={8} lg={6}>
                    <Card loading />
                  </Col>
                ))}
              </Row>
            ) : searchResults.length === 0 ? (
              <div className="empty-state">
                <Empty description="Không tìm thấy truyện nào" />
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {searchResults.map((story) => (
                  <Col key={story._id} xs={24} sm={12} md={8} lg={6}>
                    {renderStoryCard(story)}
                  </Col>
                ))}
              </Row>
            )}
          </div>
          <Divider />
        </>
      )}

      {/* Featured Stories */}
      {renderSection("Truyện nổi bật", stories.featured, FireOutlined)}
      <Divider />

      {/* Trending Stories */}
      {renderSection("Đang thịnh hành", stories.trending, GiftOutlined)}
      <Divider />

      {/* Recent Stories */}
      {renderSection("Mới cập nhật", stories.recent, BookOutlined)}

      {/* Statistics Section */}
      <div className="stats-section">
        <Title level={4}>Thống kê nền tảng</Title>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Title level={3} className="stats-number stats-number-blue">
              {formatNumber(statistics.stories)}
            </Title>
            <Text className="stats-label">Truyện</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Title level={3} className="stats-number stats-number-green">
              {formatNumber(statistics.authors)}
            </Title>
            <Text className="stats-label">Tác giả</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Title level={3} className="stats-number stats-number-yellow">
              {formatNumber(statistics.readers)}
            </Title>
            <Text className="stats-label">Độc giả</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Title level={3} className="stats-number stats-number-red">
              {formatNumber(statistics.totalViews)}
            </Title>
            <Text className="stats-label">Lượt đọc</Text>
          </Col>
        </Row>
      </div>
    </div>
  );
}
