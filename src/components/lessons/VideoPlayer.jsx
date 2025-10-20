import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Hls from "hls.js";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaSpinner,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCog,
} from "react-icons/fa";
import { getLessonDetails } from "../../api/lessons";
import { useAuth } from "../../context/AuthContext";
import VideoProtection from "../common/VideoProtection";

const VideoPlayer = ({ lessonId, lessonData, onLessonChange, onVideoEnd }) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);

  const [lessonDetails, setLessonDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Reset video player states
  const resetPlayerStates = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Load lesson details and initialize video
  useEffect(() => {
    const loadLessonDetails = async () => {
      if (!lessonId) return;

      setIsLoading(true);
      resetPlayerStates();

      try {
        let lessonDataToUse = lessonData;

        if (!lessonDataToUse) {
          const response = await getLessonDetails(lessonId, token);
          lessonDataToUse = response.data || response;
        }

        setLessonDetails(lessonDataToUse);

        if (lessonDataToUse.has_video && lessonDataToUse.video_url) {
          initializeVideoPlayer(lessonDataToUse.video_url);
        } else {
          setError(t("lessons.videoPlayer.noVideo", "لا يوجد فيديو متاح"));
        }
      } catch (err) {
        console.error("Error loading lesson details:", err);
        setError(err.message || t("lessons.videoPlayer.loadError", "خطأ في تحميل الفيديو"));
      } finally {
        setIsLoading(false);
      }
    };

    loadLessonDetails();

    return () => {
      resetPlayerStates();
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [lessonId, lessonData, token, t, resetPlayerStates]);

  // Initialize video player with HLS support
  const initializeVideoPlayer = useCallback(
    (videoUrl) => {
      if (!videoRef.current) return;

      console.log("Initializing video player with URL:", videoUrl);

      resetPlayerStates();

      const isHls = /\.m3u8(\?.*)?$/i.test(videoUrl);
      console.log("Video type - HLS:", isHls);

      if (isHls) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });

          hls.loadSource(videoUrl);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            console.log("HLS manifest parsed successfully");
            
            if (hls.levels && hls.levels.length > 0) {
              const qualities = hls.levels.map((level, index) => ({
                index: index,
                height: level.height,
                width: level.width,
                bitrate: level.bitrate,
                label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}kbps`
              }));
              
              qualities.sort((a, b) => (b.height || 0) - (a.height || 0));
              
              setAvailableQualities([
                { index: -1, label: 'Auto', isAuto: true },
                ...qualities
              ]);
              
              console.log('Available qualities:', qualities);
            }
            
            setError(null);
            videoRef.current.play().catch((err) => {
              console.error("Auto-play failed:", err);
              setIsPlaying(false);
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS error:", data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error("Network error");
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error("Media error");
                  hls.recoverMediaError();
                  break;
                default:
                  hls.destroy();
                  hlsRef.current = null;
                  setError(t("lessons.videoPlayer.hlsError", "خطأ في تشغيل الفيديو"));
                  break;
              }
            }
          });

          hlsRef.current = hls;
          return;
        }

        if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = videoUrl;
          videoRef.current.load();
          return;
        }

        setError(t("lessons.videoPlayer.hlsNotSupported", "المتصفح لا يدعم تشغيل الفيديو"));
        return;
      }

      videoRef.current.src = videoUrl;
      videoRef.current.load();

      videoRef.current.onerror = (e) => {
        console.error("Video load error:", e);
        setError(t("lessons.videoPlayer.loadError", "خطأ في تحميل الفيديو"));
      };

      videoRef.current.onloadeddata = () => {
        console.log("Video loaded successfully");
        setError(null);
        videoRef.current.play().catch((err) => {
          console.error("Auto-play failed:", err);
          setIsPlaying(false);
        });
      };
    },
    [t, resetPlayerStates]
  );

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Play failed:", err);
          setError(t("lessons.videoPlayer.playError", "فشل تشغيل الفيديو"));
        });
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
  };

  const handleSeek = (seekTime) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress(total > 0 ? (current / total) * 100 : 0);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onVideoEnd?.();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  };

  const handleQualityChange = useCallback((qualityIndex) => {
    if (!hlsRef.current) return;
    
    const currentTime = videoRef.current?.currentTime || 0;
    const wasPlaying = isPlaying;
    
    if (qualityIndex === -1) {
      hlsRef.current.currentLevel = -1;
      setCurrentQuality('auto');
    } else {
      hlsRef.current.currentLevel = qualityIndex;
      const selectedQuality = availableQualities.find(q => q.index === qualityIndex);
      setCurrentQuality(selectedQuality?.label || 'auto');
    }
    
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          videoRef.current.play();
        }
      }
    }, 100);
    
    setShowQualityMenu(false);
  }, [availableQualities, isPlaying]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div
        className="relative w-full bg-black rounded-lg"
        style={{ paddingTop: "56.25%" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <FaSpinner className="animate-spin text-4xl mb-4 mx-auto" />
            <p className="text-lg">{t("lessons.videoPlayer.loading", "جاري التحميل...")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative w-full bg-gray-900 rounded-lg"
        style={{ paddingTop: "56.25%" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <FaExclamationTriangle className="text-4xl mb-4 mx-auto text-red-500" />
            <p className="text-lg mb-2">{t("lessons.videoPlayer.error", "خطأ")}</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VideoProtection
      lessonId={lessonId}
      userId={user?.id}
    >
      <div ref={containerRef} className="relative w-full bg-black rounded-lg overflow-hidden group">
        {/* Protected Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/90 text-white">
            <FaShieldAlt />
            <span>{t("lessons.videoPlayer.protected", "محمي")}</span>
          </div>
        </div>

        {/* Video Element */}
        <div className="relative" style={{ paddingTop: "56.25%" }}>
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onEnded={handleVideoEnd}
            onMouseMove={handleMouseMove}
            onClick={isPlaying ? handlePause : handlePlay}
            controls={false}
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Video Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
          
          {/* Security Watermark */}
          {user && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-10 text-white text-2xl font-bold rotate-[-30deg] whitespace-nowrap">
              {user.name || user.email} • ID: {user.id}
            </div>
          )}

          {/* Controls Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
            onMouseMove={handleMouseMove}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div
                className="relative h-1 bg-gray-600 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const seekTime = percentage * duration;
                  handleSeek(seekTime);
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="hover:text-gray-300 transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                </button>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={handleMuteToggle}
                    className="hover:text-gray-300 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    aria-label="Volume"
                  />
                </div>

                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {lessonDetails && (
                  <div className="text-sm text-right rtl:text-left hidden md:block">
                    <div className="font-medium">{lessonDetails.title}</div>
                  </div>
                )}

                {availableQualities.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      className="flex items-center space-x-1 rtl:space-x-reverse hover:text-gray-300 transition-colors text-sm"
                      aria-label="Quality settings"
                    >
                      <FaCog size={16} />
                      <span>{currentQuality}</span>
                    </button>
                    
                    {showQualityMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                        {availableQualities.map((quality) => (
                          <button
                            key={quality.index}
                            onClick={() => handleQualityChange(quality.index)}
                            className={`w-full px-4 py-2 text-left rtl:text-right hover:bg-gray-700 transition-colors text-sm ${
                              (quality.isAuto && currentQuality === 'auto') || 
                              (quality.label === currentQuality) 
                                ? 'bg-gray-700 text-white' 
                                : 'text-gray-300'
                            }`}
                          >
                            {quality.label}
                            {quality.isAuto && ` (${t("lessons.videoPlayer.auto", "تلقائي")})`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleFullscreenToggle}
                  className="hover:text-gray-300 transition-colors"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VideoProtection>
  );
};

export default VideoPlayer;
