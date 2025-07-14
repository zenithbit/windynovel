import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Spin, Flex } from "antd";
import ReaderView from "../components/ReaderView";
import { storiesAPI, chaptersAPI } from "../services/api";

const ChapterReader = () => {
  const { id, chapterNumber } = useParams(); // id is slug, chapterNumber is the chapter number
  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get the story by slug
        const storyResponse = await storiesAPI.getBySlug(id);
        const storyData = storyResponse.data.data.story;
        setStory(storyData);

        // Then get the specific chapter
        const chapterResponse = await chaptersAPI.getChapter(
          storyData._id,
          chapterNumber
        );
        setChapter(chapterResponse.data.data.chapter);
      } catch (err) {
        console.error("Error fetching chapter:", err);
        setError(err.response?.data?.message || "Không thể tải chương");
      } finally {
        setLoading(false);
      }
    };

    if (id && chapterNumber) {
      fetchChapterData();
    }
  }, [id, chapterNumber]);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (error || !story) {
    return <Navigate to="/" replace />;
  }

  if (!chapter) {
    return <Navigate to={`/story/${id}`} replace />;
  }

  return <ReaderView story={story} chapter={chapter} />;
};

export default ChapterReader;
