import React from "react";
import ReactPlayer from "react-player";
import { FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

function IntroVideoModal({ isOpen, onClose, videoUrl, courseTitle }) {
  const { t } = useTranslation();

  if (!isOpen || !videoUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-xl w-full max-w-4xl shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            {t("introVideo.title")} - {courseTitle}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <div className="aspect-video bg-black">
          <ReactPlayer
            url={videoUrl}
            playing
            controls
            width="100%"
            height="100%"
            className="react-player"
            config={{
              youtube: {
                playerVars: {
                  showinfo: 0,
                  modestbranding: 1,
                  rel: 0,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default IntroVideoModal;
