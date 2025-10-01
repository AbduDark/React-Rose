import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { createAdminCourse } from "../../../api/courses";
import { useAuth } from "../../../context/AuthContext";
import i18n from "../../../i18n";

function CreateCourse({ onCourseCreated, isOpen, onClose }) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    grade: "",
    image: null,
    is_active: "true",
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push(t("adminDashboard.createCourse.validation.titleRequired"));
    }
    
    if (!formData.description.trim()) {
      errors.push(t("adminDashboard.createCourse.validation.descriptionRequired"));
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      errors.push(t("adminDashboard.createCourse.validation.priceRequired"));
    }
    
    if (!formData.grade) {
      errors.push(t("adminDashboard.createCourse.validation.gradeRequired"));
    }
    
    return errors;
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("Token in CreateCourse:", token ? "Token exists" : "No token");

    if (!token) {
      setIsLoading(false);
      setError(t("adminDashboard.createCourse.unauthenticated") || "Authentication required");
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      setIsLoading(false);
      return;
    }

    try {
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        grade: formData.grade,
        image: formData.image,
        is_active: formData.is_active === "true" ? 1 : 0,
      };

      const response = await createAdminCourse(courseData, token, i18n.language);

      setFormData({
        title: "",
        description: "",
        price: "",
        is_active: "true",
        grade: "",
        image: null,
      });

      // Show success message
      const successMessage = response.successMessage || 
                           t("adminDashboard.coursesManager.createSuccess");
      
      // Use a more user-friendly notification instead of alert
      if (window.showToast) {
        window.showToast(successMessage, 'success');
      } else {
        alert(successMessage);
      }

      onClose();
      if (onCourseCreated) {
        onCourseCreated(response.data);
      }
    } catch (err) {
      console.error("Course creation error:", err);
      setError(err.message || t("adminDashboard.createCourse.createError"));
    } finally {
      setIsLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl shadow-xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            {t("adminDashboard.createCourse.title")}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateCourse}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Course Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t("adminDashboard.createCourse.courseTitle")} *
              </label>
              <input
                type="text"
                name="title"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder={t(
                  "adminDashboard.createCourse.courseTitlePlaceholder"
                )}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t("adminDashboard.createCourse.description")} *
              </label>
              <textarea
                name="description"
                rows="3"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder={t(
                  "adminDashboard.createCourse.descriptionPlaceholder"
                )}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t("adminDashboard.createCourse.price")} *
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.price}
                onChange={handleInputChange}
                required
                placeholder={t("adminDashboard.createCourse.pricePlaceholder")}
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t("adminDashboard.createCourse.grade")}
              </label>
              <select
                name="grade"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.grade}
                onChange={handleInputChange}
                required
              >
                <option value="">
                  {t("adminDashboard.createCourse.selectGrade")}
                </option>
                <option value="الاول">
                  {t("adminDashboard.createCourse.firstGrade")}
                </option>
                <option value="الثاني">
                  {t("adminDashboard.createCourse.secondGrade")}
                </option>
                <option value="الثالث">
                  {t("adminDashboard.createCourse.thirdGrade")}
                </option>
              </select>
            </div>

            {/* Is Active */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t("adminDashboard.createCourse.status")}
              </label>
              <select
                name="is_active"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.is_active}
                onChange={handleInputChange}
              >
                <option value="true">
                  {t("adminDashboard.createCourse.active")}
                </option>
                <option value="false">
                  {t("adminDashboard.createCourse.inactive")}
                </option>
              </select>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t("adminDashboard.createCourse.courseImage")}
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleInputChange}
              />
              {formData.image && (
                <p className="mt-2 text-sm text-gray-400">
                  {t("adminDashboard.createCourse.selectedFile", {
                    filename: formData.image.name,
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("adminDashboard.createCourse.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading
                ? t("adminDashboard.createCourse.creating")
                : t("adminDashboard.createCourse.createCourse")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;
