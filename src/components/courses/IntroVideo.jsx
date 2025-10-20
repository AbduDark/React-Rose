import React, { useState } from "react";
import ReactPlayer from "react-player/youtube";
import { FaPlay } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const IntroVideo = ({ introVideoUrl, courseTitle }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  if (!introVideoUrl) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {t("courseDetailPage.introVideo", "مقدمة الكورس")}
      </h2>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg aspect-video">
        {!showPlayer ? (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            onClick={() => setShowPlayer(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative z-10 bg-primary/90 group-hover:bg-primary p-6 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-110">
              <FaPlay className="w-8 h-8 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <p className="text-white text-lg font-semibold">
                {t("courseDetailPage.watchIntro", "شاهد المقدمة")}
              </p>
            </div>
          </div>
        ) : (
          <ReactPlayer
            url={introVideoUrl}
            playing={isPlaying}
            controls
            width="100%"
            height="100%"
            className="react-player"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
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
        )}
      </div>
    </div>
  );
};

export default IntroVideo;
