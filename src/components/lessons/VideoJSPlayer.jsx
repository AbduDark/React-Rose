import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const VideoJSPlayer = ({ videoUrl, lessonId, lessonTitle, onVideoEnd }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      console.warn("VideoJSPlayer: Missing video URL", { videoUrl });
      return;
    }

    // Wait for the next tick to ensure the element is in the DOM
    const initTimeout = setTimeout(() => {
      if (!videoRef.current) {
        console.warn("VideoJSPlayer: Video element not found in DOM");
        return;
      }

      const videoElement = videoRef.current;

      const player = videojs(videoElement, {
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      controlBar: {
        children: [
          "playToggle",
          "volumePanel",
          "currentTimeDisplay",
          "timeDivider",
          "durationDisplay",
          "progressControl",
          "playbackRateMenuButton",
          "fullscreenToggle",
        ],
      },
      html5: {
        vhs: {
          overrideNative: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      techOrder: ["html5"],
      userActions: {
        hotkeys: true,
      },
    });

    // إضافة الحماية من التحميل
    player.ready(() => {
      setIsReady(true);
      
      // منع النقر بالزر الأيمن
      player.el().addEventListener("contextmenu", (e) => {
        e.preventDefault();
        return false;
      });

      // إضافة علامة مائية للمستخدم
      if (user) {
        const watermark = document.createElement("div");
        watermark.className = "vjs-watermark";
        watermark.textContent = `${user.name || user.email} • ID: ${user.id}`;
        watermark.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          color: rgba(255, 255, 255, 0.1);
          font-size: 24px;
          font-weight: bold;
          pointer-events: none;
          user-select: none;
          z-index: 10;
          white-space: nowrap;
        `;
        player.el().appendChild(watermark);
      }

      // منع Picture-in-Picture والتحميل
      if (videoElement) {
        videoElement.disablePictureInPicture = true;
        videoElement.setAttribute("disablePictureInPicture", "");
        videoElement.setAttribute("controlsList", "nodownload noremoteplayback");
      }

      // عند انتهاء الفيديو
      player.on("ended", () => {
        onVideoEnd?.();
      });
    });

    // تعيين مصدر الفيديو
    if (videoUrl) {
      console.log("Setting video source:", videoUrl);
      player.src({
        src: videoUrl,
        type: "video/mp4",
      });
      
      // إضافة معالج الأخطاء
      player.on("error", () => {
        const error = player.error();
        console.error("Video playback error:", error);
        if (error) {
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            url: videoUrl
          });
        }
      });
    }

    playerRef.current = player;
    }, 0);

    return () => {
      clearTimeout(initTimeout);
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing player:", e);
        }
        playerRef.current = null;
      }
    };
  }, [videoUrl, lessonId, onVideoEnd, user]);

  if (!videoUrl) {
    return (
      <div className="relative w-full bg-gray-900 rounded-lg" style={{ paddingTop: "56.25%" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-lg">{t("lessons.videoPlayer.noVideo")}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full video-container">
      {/* شارة الحماية */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/90 text-white pointer-events-none">
        <FaShieldAlt />
        <span>{t("lessons.videoPlayer.protected")}</span>
      </div>

      {/* مشغل الفيديو */}
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-rose"
          playsInline
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* نمط مخصص للمشغل */}
      <style jsx>{`
        .video-container {
          position: relative;
          background: #000;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        /* منع التحديد والسحب */
        .video-container * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        /* تخصيص ألوان المشغل */
        :global(.vjs-theme-rose .vjs-big-play-button) {
          background-color: rgba(59, 130, 246, 0.9);
          border: none;
          border-radius: 50%;
        }

        :global(.vjs-theme-rose .vjs-big-play-button:hover) {
          background-color: rgba(37, 99, 235, 1);
        }

        :global(.vjs-theme-rose .vjs-control-bar) {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        }

        :global(.vjs-theme-rose .vjs-play-progress) {
          background-color: #3b82f6;
        }

        :global(.vjs-theme-rose .vjs-volume-level) {
          background-color: #3b82f6;
        }

        /* إخفاء زر التحميل */
        :global(.vjs-theme-rose .vjs-download-button) {
          display: none !important;
        }

        /* تحسين مظهر RTL */
        :global([dir="rtl"] .vjs-control-bar) {
          direction: ltr;
        }
      `}</style>
    </div>
  );
};

export default VideoJSPlayer;
