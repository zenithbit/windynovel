import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { usersAPI } from "../services/api";

const ReadingProgressContext = createContext();

export const useReadingProgress = () => {
  const context = useContext(ReadingProgressContext);
  if (!context) {
    throw new Error(
      "useReadingProgress must be used within a ReadingProgressProvider"
    );
  }
  return context;
};

export const ReadingProgressProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [readingProgress, setReadingProgress] = useState({});
  const [loading, setLoading] = useState(false);

  // Load all reading progress for authenticated users
  const loadReadingProgress = async () => {
    if (!isAuthenticated) {
      setReadingProgress({});
      return;
    }

    try {
      setLoading(true);
      const response = await usersAPI.getReadingHistory({ limit: 200 });
      if (response.data.success) {
        const progressMap = {};
        response.data.data.history.forEach((item) => {
          const storyId = item.storyId._id || item.storyId.id;
          progressMap[storyId] = {
            lastChapter: item.chapterNumber,
            progress: item.progress,
            readAt: item.readAt,
          };
        });
        setReadingProgress(progressMap);
      }
    } catch (error) {
      console.error("Failed to load reading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update reading progress for a specific story
  const updateStoryProgress = async (storyId, chapterNumber, progress = 0) => {
    if (!isAuthenticated) {
      // Fallback to localStorage for unauthenticated users
      const localProgress = JSON.parse(
        localStorage.getItem(`reading-progress-${storyId}`) || "{}"
      );
      localProgress.lastChapter = chapterNumber;
      localStorage.setItem(
        `reading-progress-${storyId}`,
        JSON.stringify(localProgress)
      );
      return;
    }

    try {
      await usersAPI.updateReadingHistory({
        storyId,
        chapterNumber,
        progress,
      });

      // Update local state
      setReadingProgress((prev) => ({
        ...prev,
        [storyId]: {
          lastChapter: chapterNumber,
          progress,
          readAt: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error("Failed to update reading progress:", error);
    }
  };

  // Get reading progress for a specific story
  const getStoryProgress = (storyId) => {
    if (isAuthenticated) {
      return readingProgress[storyId] || { lastChapter: 0, progress: 0 };
    } else {
      // Fallback to localStorage for unauthenticated users
      const localProgress = JSON.parse(
        localStorage.getItem(`reading-progress-${storyId}`) || "{}"
      );
      return { lastChapter: localProgress.lastChapter || 0, progress: 0 };
    }
  };

  useEffect(() => {
    loadReadingProgress();
  }, [isAuthenticated]);

  const value = {
    readingProgress,
    loading,
    getStoryProgress,
    updateStoryProgress,
    refreshProgress: loadReadingProgress,
  };

  return (
    <ReadingProgressContext.Provider value={value}>
      {children}
    </ReadingProgressContext.Provider>
  );
};
