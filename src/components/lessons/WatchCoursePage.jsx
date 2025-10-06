import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronLeft } from "react-icons/fa";
import CommentLesson from "./CommentLesson";
import Sidebar from "./Sidebar";
import VideoPlayer from "./VideoPlayer";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonsByCourse } from "../../api/lessons";
import { useAuth } from "../../context/AuthContext";

const WatchCoursePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const { token } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [isPurchased] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!courseId) {
        setError(t("lessons.courseInfo.title"));
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await getLessonsByCourse(courseId, token);
        const lessonsData = response?.data?.lessons || [];
        setLessons(lessonsData);

        if (lessonsData.length === 0) {
          setError(t("lessons.sidebar.noEpisodes"));
          setIsLoading(false);
          return;
        }

        // Set current lesson ID
        let initialLessonId = lessonId ? Number(lessonId) : null;
        const validLesson = lessonsData.find(
          (l) => l.id === initialLessonId && l.has_video
        );

        if (validLesson) {
          setCurrentLessonId(initialLessonId);
        } else {
          // Fallback to the first lesson with a video
          const firstValidLesson = lessonsData.find((l) => l.has_video);
          if (firstValidLesson) {
            setCurrentLessonId(firstValidLesson.id);
            navigate(`/courses/${courseId}/lessons/${firstValidLesson.id}`, {
              replace: true,
            });
          } else {
            setError(t("lessons.videoPlayer.noVideo"));
          }
        }
      } catch (e) {
        console.error("Error loading lessons:", e);
        setError(e.message || t("lessons.videoPlayer.error"));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId, lessonId, navigate, token, t]);

  const currentLesson = useMemo(() => {
    const lesson = lessons.find((l) => l.id === Number(currentLessonId));
    if (!lesson || !lesson.has_video) {
      console.warn("Current lesson is invalid or has no video:", lesson);
      return null;
    }
    return lesson;
  }, [lessons, currentLessonId]);

  // Handle lesson selection
  const handleLessonSelect = (lesson) => {
    if (!lesson.has_video) {
      console.warn("Selected lesson has no video:", lesson);
      setError(t("lessons.videoPlayer.noVideo"));
      return;
    }
    setCurrentLessonId(lesson.id);
    navigate(`/courses/${courseId}/lessons/${lesson.id}`, { replace: true });
    setIsVideoPlaying(false);
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
    const allLessons = lessons.filter((l) => l.has_video);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      handleLessonSelect(nextLesson);
    }
  };

  // Handle play next
  const handlePlayNext = () => {
    const allLessons = lessons.filter((l) => l.has_video);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      handleLessonSelect(nextLesson);
    }
  };

  // Handle play previous
  const handlePlayPrevious = () => {
    const allLessons = lessons.filter((l) => l.has_video);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex > 0) {
      const previousLesson = allLessons[currentIndex - 1];
      handleLessonSelect(previousLesson);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-lg font-medium text-primary dark:text-primary-light">
          {t("lessons.videoPlayer.loading")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-lg font-medium text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!isPurchased) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 min-h-screen transition-colors">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-primary dark:text-primary-light">
            {t("lessons.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("overviewCourse.subscribeToView")}
          </p>
          <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md transition-colors">
            {t("enrollCourse.enrollNow")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <div
        dir="ltr"
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => navigate(-1)}
          >
            <FaChevronLeft className="h-5 w-5 text-primary dark:text-primary-light" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-primary dark:text-primary-light">
              {t("lessons.title")} #{courseId}
            </h1>
            {currentLesson && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{currentLesson.title}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="lg:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-auto transition-colors">
          <div className="space-y-4">
            <Sidebar
              lessons={lessons}
              currentLessonId={currentLessonId}
              onSelectLesson={handleLessonSelect}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 p-4 gap-4 overflow-auto">
          {/* Video Player */}
          {currentLesson ? (
            <VideoPlayer
              key={currentLessonId} // Force re-render on lesson change
              lessonId={currentLessonId}
              lessonData={currentLesson}
              onLessonChange={handleLessonSelect}
              onVideoEnd={handleVideoEnd}
            />
          ) : (
            <div className="w-full flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                {t("lessons.videoPlayer.noLesson")}
              </p>
            </div>
          )}

          {/* Comments */}
          {currentLessonId && <CommentLesson lessonId={currentLessonId} />}
        </div>
      </div>
    </div>
  );
};

export default WatchCoursePage;