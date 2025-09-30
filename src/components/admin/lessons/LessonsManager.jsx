import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiBook } from "react-icons/fi";
import { getAllLessons } from "../../../api/lessons";
import { getCourses } from "../../../api/courses";
import { useAuth } from "../../../context/AuthContext";
import CreateLesson from "./CreateLessons";
import UpdateLesson from "./UpdateLessons";
import DeleteLesson from "./DeleteLessons";
import SearchLesson from "./SearchLessons";
import CardLesson from "./CardLessons";
import VideoUpload from "./VideoUpload";
import Pagination from "../../common/Pagination";

const LessonsManager = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [lessonForVideo, setLessonForVideo] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchLessons(page);
    fetchCoursesList();
  }, [page, selectedCourse]);

  useEffect(() => {
    const filtered = lessons.filter((lesson) => {
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" ||
        lesson.is_free === (selectedFilter === "free");
      const matchesCourse =
        selectedCourse === "all" ||
        lesson.course_id === parseInt(selectedCourse);
      return matchesSearch && matchesFilter && matchesCourse;
    });
    setFilteredLessons(filtered);
  }, [lessons, searchTerm, selectedFilter, selectedCourse]);

  const fetchLessons = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const params = { page: pageNum };
      if (selectedCourse !== "all") {
        params.course_id = selectedCourse;
      }
      const response = await getAllLessons(params, token);
      setLessons(response.data?.data || []);
      setMeta(response.data || null);
      setPage(response.data?.current_page || 1);
      setError("");
    } catch (err) {
      setError(
        t("adminDashboard.lessonsManager.failedToFetch", { error: err.message })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoursesList = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const handleLessonCreated = (newLesson) => {
    setLessons((prev) => [...prev, newLesson]);
    setIsCreateModalOpen(false);
  };

  const handleLessonUpdated = (updatedLesson) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === updatedLesson.id ? updatedLesson : lesson
      )
    );
    setIsEditModalOpen(false);
    setCurrentLesson(null);
  };

  // Handle lesson deletion
  const handleLessonDeleted = (lessonId) => {
    setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
    setIsDeleteModalOpen(false);
    setLessonToDelete(null);
  };

  const handleEditLesson = (lesson) => {
    setCurrentLesson(lesson);
    setIsEditModalOpen(true);
  };

  const handleDeleteLesson = (lesson) => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  const handleVideoManage = (lesson) => {
    setLessonForVideo(lesson);
    setIsVideoModalOpen(true);
  };

  const handleVideoUpdated = () => {
    // Refresh lessons data to get updated video status
    fetchLessons(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">
          {t("adminDashboard.lessonsManager.loadingLessons")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex justify-between md:flex-row flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {t("adminDashboard.lessonsManager.title")}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              {filteredLessons.length}{" "}
              {t("adminDashboard.lessonsManager.lessonsCount", {
                total: lessons.length,
              })}
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center mt-4 md:mt-0 gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg"
            >
              <FiPlus className="w-4 h-4" />
              {t("adminDashboard.lessonsManager.addLesson")}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <SearchLesson
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          courses={courses}
        />
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12">
          <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {t("adminDashboard.lessonsManager.noLessonsFound")}
          </h3>
          <p className="text-gray-400">
            {searchTerm || selectedFilter !== "all" || selectedCourse !== "all"
              ? t("adminDashboard.lessonsManager.tryAdjustingFilters")
              : t("adminDashboard.lessonsManager.noLessonsDescription")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <CardLesson
                key={lesson.id}
                lesson={lesson}
                onEdit={() => handleEditLesson(lesson)}
                onDelete={() => handleDeleteLesson(lesson)}
                onVideoManage={() => handleVideoManage(lesson)}
              />
            ))}
          </div>
          {meta && meta.last_page > 1 && (
            <Pagination
              page={page}
              setPage={setPage}
              pageCount={meta.last_page}
            />
          )}
        </>
      )}

      {/* Create Lesson Modal */}
      <CreateLesson
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLessonCreated={handleLessonCreated}
        courses={courses}
      />

      {/* Edit Lesson Modal */}
      <UpdateLesson
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lesson={currentLesson}
        onLessonUpdated={handleLessonUpdated}
        courses={courses}
      />

      {/* Delete Lesson Modal */}
      <DeleteLesson
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        lesson={lessonToDelete}
        onLessonDeleted={handleLessonDeleted}
      />

      {/* Video Upload Modal */}
      <VideoUpload
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        lesson={lessonForVideo}
        onVideoUpdated={handleVideoUpdated}
      />
    </div>
  );
};

export default LessonsManager;
