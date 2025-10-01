import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiBook } from "react-icons/fi";
import { getCourses } from "../../../api/courses";
import CreateCourse from "./CreateCourse";
import UpdateCourse from "./UpdateCourse";
import DeleteCourse from "./DeleteCourse";
import SearchCourse from "./SearchCourse";
import CardCourse from "./CardCourse";
import Pagination from "../../common/Pagination";
import i18n from "../../../i18n";

const CoursesManager = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchCourses(page);
  }, [page]);

  useEffect(() => {
    const filtered = courses.filter((course) => {
      // Enhanced search that handles Arabic and English text
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = course.title?.toLowerCase().includes(searchLower) || false;
      const instructorMatch = course.instructor_name?.toLowerCase().includes(searchLower) || false;
      const descriptionMatch = course.description?.toLowerCase().includes(searchLower) || false;
      const gradeMatch = course.grade?.toLowerCase().includes(searchLower) || false;
      
      const matchesSearch = searchTerm === "" || titleMatch || instructorMatch || descriptionMatch || gradeMatch;
      
      const matchesFilter = selectedFilter === "all" || course.level === selectedFilter;
      const matchesCategory = selectedCategory === "all" || course.language === selectedCategory;
      
      return matchesSearch && matchesFilter && matchesCategory;
    });
    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedFilter, selectedCategory]);

  const fetchCourses = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getCourses(pageNum, 6, i18n.language);
      setCourses(response.data || []);
      setMeta(response.meta || null);
      setPage(response.meta?.current_page || 1);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError(
        t("adminDashboard.coursesManager.failedToFetch", { 
          error: err.message || t("common.error")
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseCreated = (newCourse) => {
    setCourses((prev) => [...prev, newCourse]);
    setIsCreateModalOpen(false);
    // Refresh the courses list to show updated data
    fetchCourses(page);
  };

  const handleCourseUpdated = (updatedCourse) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
    setIsEditModalOpen(false);
    setCurrentCourse(null);
    // Refresh the courses list to show updated data
    fetchCourses(page);
  };

  // Handle course deletion
  const handleCourseDeleted = (courseId) => {
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  const handleEditCourse = (course) => {
    setCurrentCourse(course);
    setIsEditModalOpen(true);
  };

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">
          {t("adminDashboard.coursesManager.loadingCourses")}
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
            {t("adminDashboard.coursesManager.title")}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              {filteredCourses.length}{" "}
              {t("adminDashboard.coursesManager.coursesCount", {
                total: courses.length,
              })}
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center mt-4 md:mt-0 gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg"
            >
              <FiPlus className="w-4 h-4" />
              {t("adminDashboard.coursesManager.addCourse")}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <SearchCourse
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {t("adminDashboard.coursesManager.noCoursesFound")}
          </h3>
          <p className="text-gray-400">
            {searchTerm ||
            selectedFilter !== "all" ||
            selectedCategory !== "all"
              ? t("adminDashboard.coursesManager.tryAdjustingFilters")
              : t("adminDashboard.coursesManager.noCoursesDescription")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CardCourse
                key={course.id}
                course={course}
                onEdit={() => handleEditCourse(course)}
                onDelete={() => handleDeleteCourse(course)}
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

      {/* Create Course Modal */}
      <CreateCourse
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />

      {/* Edit Course Modal */}
      <UpdateCourse
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        course={currentCourse}
        onCourseUpdated={handleCourseUpdated}
      />

      {/* Delete Course Modal */}
      <DeleteCourse
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        course={courseToDelete}
        onCourseDeleted={handleCourseDeleted}
      />
    </div>
  );
};

export default CoursesManager;
