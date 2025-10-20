import React, { useState } from "react";
import ReactPlayer from "react-player";
import { FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

function IntroVideoModal({ isOpen, onClose, videoUrl, courseTitle }) {
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  if (!isOpen || !videoUrl) return null;

  const handleError = (error) => {
    console.error("Video player error:", error);
    setHasError(true);
  };

  const handleReady = () => {
    setIsReady(true);
    setHasError(false);
  };

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
        <div className="aspect-video bg-black relative">
          {hasError ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center p-6">
                <p className="text-xl mb-2">❌</p>
                <p className="text-lg">لا يمكن تشغيل الفيديو</p>
                <p className="text-sm text-gray-400 mt-2">تأكد من أن الفيديو متاح للعرض</p>
              </div>
            </div>
          ) : (
            <>
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4">جاري التحميل...</p>
                  </div>
                </div>
              )}
              <ReactPlayer
                key={videoUrl}
                url={videoUrl}
                playing={isReady}
                controls={true}
                width="100%"
                height="100%"
                onReady={handleReady}
                onError={handleError}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 0,
                      controls: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      fs: 1,
                      cc_load_policy: 0,
                      iv_load_policy: 3,
                    },
                  },
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntroVideoModal;
