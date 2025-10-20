import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiX, FiUpload, FiTrash2, FiVideo, FiCheck, FiAlertCircle } from "react-icons/fi";
import { uploadLessonVideo, deleteLessonVideo } from "../../../api/lessons";
import { useAuth } from "../../../context/AuthContext";

function VideoUpload({ lesson, onVideoUpdated, isOpen, onClose }) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        setError(t("adminDashboard.videoUpload.invalidFileType"));
        return;
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(t("adminDashboard.videoUpload.fileTooLarge"));
        return;
      }

      setSelectedVideo(file);
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async () => {
    if (!selectedVideo || !lesson || !token) return;

    setIsUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      await uploadLessonVideo(lesson.id, selectedVideo, token, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      setSuccess(t("adminDashboard.videoUpload.uploadSuccess"));
      setSelectedVideo(null);

      if (onVideoUpdated) {
        onVideoUpdated();
      }
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson || !token) return;

    setIsDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteLessonVideo(lesson.id, token);
      setSuccess(t("adminDashboard.videoUpload.deleteSuccess"));

      if (onVideoUpdated) {
        onVideoUpdated();
      }
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
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <FiVideo className="w-5 h-5" />
            {t("adminDashboard.videoUpload.title")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isUploading || isDeleting}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Lesson Info */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-lg font-medium text-white mb-2">{lesson.title}</h4>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>{t("adminDashboard.videoUpload.lessonId")}: {lesson.id}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              lesson.has_video 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {lesson.has_video 
                ? t("adminDashboard.videoUpload.hasVideo") 
                : t("adminDashboard.videoUpload.noVideo")
              }
            </span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-300 flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-500 rounded-lg text-green-300 flex items-center gap-2">
            <FiCheck className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              {t("adminDashboard.videoUpload.selectVideo")}
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              disabled={isUploading || isDeleting}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
            />
            <p className="mt-2 text-xs text-gray-400">
              {t("adminDashboard.videoUpload.supportedFormats")}: MP4, WebM, AVI, MOV (Max: 500MB)
            </p>
          </div>

          {/* Selected Video Info */}
          {selectedVideo && (
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FiVideo className="w-8 h-8 text-purple-400" />
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedVideo.name}</p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(selectedVideo.size)} • {selectedVideo.type}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>{t("adminDashboard.videoUpload.uploading")}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isUploading || isDeleting}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("adminDashboard.videoUpload.uploading")} {uploadProgress}%
                  </>
                ) : (
                  <>
                    <FiUpload className="w-4 h-4" />
                    {t("adminDashboard.videoUpload.uploadVideo")}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Delete Video Section */}
          {lesson.has_video && (
            <div className="pt-4 border-t border-gray-600">
              <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div>
                  <h5 className="text-md font-medium text-white mb-1">
                    {t("adminDashboard.videoUpload.deleteCurrentVideo")}
                  </h5>
                  <p className="text-gray-400 text-sm">
                    {t("adminDashboard.videoUpload.deleteWarning")}
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={isUploading || isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg disabled:opacity-50 flex items-center gap-2"
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isUploading || isDeleting}
            className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-50"
          >
            {t("adminDashboard.videoUpload.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoUpload;