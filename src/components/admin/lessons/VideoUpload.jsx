import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiUpload, FiX, FiVideo, FiTrash2, FiCheck } from "react-icons/fi";
import { uploadLessonVideo, deleteLessonVideo } from "../../../api/lessons";
import { useAuth } from "../../../context/AuthContext";

function VideoUpload({ lesson, onVideoUpdated, isOpen, onClose }) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setError("");
    } else {
      setError(t("adminDashboard.videoUpload.invalidFileType"));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      await uploadLessonVideo(lesson.id, selectedFile, token);
      setSuccess(t("adminDashboard.videoUpload.uploadSuccess"));
      setSelectedFile(null);

      // Refresh lesson data
      if (onVideoUpdated) {
        onVideoUpdated();
      }

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;

    setIsDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteLessonVideo(lesson.id, token);
      setSuccess(t("adminDashboard.videoUpload.deleteSuccess"));

      // Refresh lesson data
      if (onVideoUpdated) {
        onVideoUpdated();
      }

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            {t("adminDashboard.videoUpload.title")} - {lesson.title}
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

        {success && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-500 rounded-lg text-green-300 flex items-center gap-2">
            <FiCheck className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Current Video Status */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <FiVideo className="w-5 h-5" />
            {t("adminDashboard.videoUpload.currentStatus")}
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                {t("adminDashboard.videoUpload.hasVideo")}:
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  lesson.has_video
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {lesson.has_video
                  ? t("adminDashboard.videoUpload.yes")
                  : t("adminDashboard.videoUpload.no")}
              </span>
            </div>

            {lesson.video_status && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">
                  {t("adminDashboard.videoUpload.status")}:
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lesson.video_status === "ready"
                      ? "bg-green-100 text-green-800"
                      : lesson.video_status === "processing"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {lesson.video_status === "ready"
                    ? t("adminDashboard.videoUpload.ready")
                    : lesson.video_status === "processing"
                    ? t("adminDashboard.videoUpload.processing")
                    : t("adminDashboard.videoUpload.unknown")}
                </span>
              </div>
            )}

            {lesson.duration_minutes && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">
                  {t("adminDashboard.videoUpload.duration")}:
                </span>
                <span className="text-white">
                  {lesson.duration_minutes}{" "}
                  {t("adminDashboard.videoUpload.minutes")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-3">
            {t("adminDashboard.videoUpload.uploadNewVideo")}
          </h4>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-400/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <FiVideo className="w-12 h-12 text-blue-400 mx-auto" />
                <div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <FiUpload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-white mb-2">
                    {t("adminDashboard.videoUpload.dragDrop")}
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    {t("adminDashboard.videoUpload.orClickToSelect")}
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <FiUpload className="w-4 h-4" />
                    {t("adminDashboard.videoUpload.selectFile")}
                  </label>
                </div>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("adminDashboard.videoUpload.uploading")}
                  </>
                ) : (
                  <>
                    <FiUpload className="w-4 h-4" />
                    {t("adminDashboard.videoUpload.upload")}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Delete Section */}
        {lesson.has_video && (
          <div className="border-t border-gray-700 pt-6">
            <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <FiTrash2 className="w-5 h-5" />
              {t("adminDashboard.videoUpload.deleteVideo")}
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              {t("adminDashboard.videoUpload.deleteWarning")}
            </p>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("adminDashboard.videoUpload.deleting")}
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4" />
                  {t("adminDashboard.videoUpload.deleteVideo")}
                </>
              )}
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
            disabled={isUploading || isDeleting}
          >
            {t("adminDashboard.videoUpload.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoUpload;
