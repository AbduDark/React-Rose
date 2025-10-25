
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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) {
      if (!videoUrl) {
        console.warn("No video URL provided for lesson:", lessonId);
      }
      return;
    }

    const videoElement = videoRef.current;

    // تحديد رسائل الخطأ قبل إنشاء المشغل (خارج callbacks)
    const errorMessages = {
      loadError: t("lessons.videoPlayer.loadError", "حدث خطأ أثناء تحميل الفيديو"),
      videoNotAvailable: t("lessons.videoPlayer.videoNotAvailable", "الفيديو غير متوفر حالياً"),
      hlsNotSupported: t("lessons.videoPlayer.hlsNotSupported", "المتصفح لا يدعم تشغيل هذا النوع من الفيديو")
    };

    // تنظيف المشغل السابق إذا كان موجوداً
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    try {
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
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            useBandwidthFromLocalStorage: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
        techOrder: ["html5"],
        userActions: {
          hotkeys: true,
        },
      });

      player.ready(() => {
        console.log("Video player is ready");
        setIsReady(true);
        setError(null);
        
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
          console.log("Video ended");
          onVideoEnd?.();
        });

        // معالجة الأخطاء
        player.on("error", (e) => {
          const error = player.error();
          console.error("Video error:", error);
          if (error) {
            let errorMessage = errorMessages.loadError;
            
            if (error.code === 2) {
              errorMessage = errorMessages.videoNotAvailable;
            } else if (error.code === 4) {
              errorMessage = errorMessages.hlsNotSupported;
            }
            
            setError(errorMessage);
          }
        });
      });

      // تحديد نوع الفيديو بناءً على الرابط
      let sourceType = "video/mp4";
      if (videoUrl.includes(".m3u8")) {
        sourceType = "application/x-mpegURL";
      } else if (videoUrl.includes(".webm")) {
        sourceType = "video/webm";
      }

      // تعيين مصدر الفيديو
      player.src({
        src: videoUrl,
        type: sourceType,
      });

      playerRef.current = player;

    } catch (err) {
      console.error("Error initializing video player:", err);
      setError("فشل تهيئة مشغل الفيديو");
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
          playerRef.current = null;
        } catch (err) {
          console.error("Error disposing player:", err);
        }
      }
    };
  }, [videoUrl, lessonId, onVideoEnd, user, t]);

  if (!videoUrl) {
    return (
      <div className="relative w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl" style={{ paddingTop: "56.25%" }}>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {t("lessons.videoPlayer.noVideo", "لم يتم رفع الفيديو الخاص بهذا الدرس بعد")}
            </h3>
            <p className="text-gray-300 text-lg mb-4">
              {t("lessons.videoPlayer.videoComingSoon", "فيديو هذا الدرس سيتم رفعه قريباً")}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-300 text-sm font-medium">
                {t("lessons.videoPlayer.checkBackLater", "يرجى المتابعة في وقت لاحق")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full bg-gradient-to-br from-red-900/30 to-gray-900 rounded-lg shadow-xl border border-red-500/20" style={{ paddingTop: "56.25%" }}>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-3">
              {t("lessons.videoPlayer.error", "حدث خطأ")}
            </h3>
            <p className="text-red-300 text-base mb-2">{error}</p>
            <p className="text-gray-400 text-sm">
              {t("lessons.videoPlayer.noVideoDescription", "يرجى التحقق لاحقاً أو التواصل مع المدرس")}
            </p>
          </div>
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
      <style>{`
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
