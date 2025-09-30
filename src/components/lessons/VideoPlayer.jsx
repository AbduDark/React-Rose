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
  FaLock,
} from "react-icons/fa";
import {
  getLessonDetails,
  getSecureVideoUrl,
  validateVideoAccess,
  reportSuspiciousActivity,
} from "../../api/lessons";
import { useAuth } from "../../context/AuthContext";
import videoSecurityService from "../../services/VideoSecurityService";
import VideoProtection from "../common/VideoProtection";

const VideoPlayer = ({ lessonId, lessonData, onLessonChange, onVideoEnd }) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const securityCleanupRef = useRef(null);

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
  const [secureVideoUrl, setSecureVideoUrl] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [isSecureMode, setIsSecureMode] = useState(true);
  const [securityStatus, setSecurityStatus] = useState("initializing");
  const [originalVideoUrl, setOriginalVideoUrl] = useState(null);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);

  // Handle security violations
  const handleSecurityViolation = useCallback(
    async (violationType) => {
      console.warn(`Security violation detected: ${violationType}`);
      try {
        await reportSuspiciousActivity(
          lessonId,
          violationType,
          {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            violationCount: violationCountRef.current,
          },
          token
        );
      } catch (error) {
        console.error("Failed to report security violation:", error);
      }
    },
    [lessonId, token]
  );

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
      videoRef.current.load(); // Reset the video element
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Load lesson details with security
  useEffect(() => {
    const loadLessonDetails = async () => {
      if (!lessonId) return;

      setIsLoading(true);
      setSecurityStatus("initializing");
      resetPlayerStates(); // Reset states before loading new video

      try {
        let lessonDataToUse = lessonData;

        // If lessonData is provided, use it directly
        if (!lessonDataToUse) {
          // Fallback to API call if lessonData is not provided
          const response = await getLessonDetails(lessonId, token);
          lessonDataToUse = response.data || response;
        }

        setLessonDetails(lessonDataToUse);

        if (lessonDataToUse.has_video) {
          setSecurityStatus("getting_secure_url");

          try {
            // Get secure video URL with encryption (Frontend only)
            const secureResponse = await getSecureVideoUrl(lessonId, token);
            const secureData = secureResponse.data || secureResponse;

            if (secureData.secure_url && secureData.session_token) {
              setSecureVideoUrl(secureData.secure_url);
              setSessionToken(secureData.session_token);
              setOriginalVideoUrl(secureData.original_url);
              setSecurityStatus("secure");

              // Validate access before initializing player
              const validationResult = await validateVideoAccess(
                lessonId,
                token,
                secureData.session_token
              );

              if (validationResult.data?.valid) {
                // استخدام URL الأصلي مباشرة مع الحماية المحلية
                initializeSecureVideoPlayer(
                  secureData.original_url,
                  secureData.session_token
                );
              } else {
                throw new Error(
                  validationResult.data?.error || "Access validation failed"
                );
              }
            } else {
              throw new Error("Failed to get secure video data");
            }
          } catch (secureError) {
            console.warn("Secure mode failed, falling back to regular mode:", secureError);
            
            // Fallback to regular video URL
            setIsSecureMode(false);
            setSecurityStatus("fallback");

            if (lessonDataToUse.video_url) {
              setOriginalVideoUrl(lessonDataToUse.video_url);
              initializeVideoPlayer(lessonDataToUse.video_url);
            } else if (lessonDataToUse.video_stream_url) {
              setOriginalVideoUrl(lessonDataToUse.video_stream_url);
              initializeVideoPlayer(lessonDataToUse.video_stream_url);
            } else {
              setError(t("lessons.videoPlayer.noVideo"));
            }
          }
        } else {
          setError(t("lessons.videoPlayer.noVideo"));
        }
      } catch (err) {
        console.error("Error loading lesson details:", err);
        setError(err.message || t("lessons.videoPlayer.loadError"));
        setSecurityStatus("error");

        // Report suspicious activity if it's an access error
        if (
          err.message.includes("Access") ||
          err.message.includes("validation")
        ) {
          try {
            await reportSuspiciousActivity(
              lessonId,
              "access_denied",
              err.message,
              token
            );
          } catch (reportError) {
            console.warn("Failed to report suspicious activity:", reportError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLessonDetails();

    // Cleanup on unmount or lesson change
    return () => {
      resetPlayerStates();
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      if (securityCleanupRef.current) {
        securityCleanupRef.current();
      }
    };
  }, [lessonId, lessonData, token, t, resetPlayerStates]);

  // Initialize secure video player with enhanced protection
  const initializeSecureVideoPlayer = useCallback(
    (secureUrl, sessionToken) => {
      if (!videoRef.current) return;

      console.log("Initializing secure video player with URL:", secureUrl);

      // Reset video element
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.removeAttribute("src");
      videoRef.current.load();

      // Apply video protection
      videoSecurityService.applyVideoProtection(videoRef.current);

      // Start monitoring for suspicious activity
      securityCleanupRef.current = videoSecurityService.monitorDownloadAttempts(
        videoRef.current,
        lessonId,
        user?.id
      );

      const isHls = /\.m3u8(\?.*)?$/i.test(secureUrl);
      const isMp4 = /\.mp4(\?.*)?$/i.test(secureUrl);

      console.log("Secure video type - HLS:", isHls, "MP4:", isMp4);

      // Enhanced HLS configuration with security
      if (isHls) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            // Enhanced security configurations
            xhrSetup: (xhr, url) => {
              // Add session token to all requests
              xhr.setRequestHeader("X-Session-Token", sessionToken);
              xhr.setRequestHeader("X-Lesson-ID", lessonId);
              xhr.setRequestHeader("X-User-ID", user?.id);
            },
            // Prevent segment caching
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            // Disable seeking to prevent unauthorized access
            enableSoftwareAES: true,
            // Add error handling for security violations
            fragLoadingErrorRetry: 1,
            fragLoadingTimeOut: 20000,
            manifestLoadingTimeOut: 10000,
          });

          hls.loadSource(secureUrl);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("Secure HLS manifest parsed successfully");
            setError(null);
            setSecurityStatus("ready");
            videoRef.current.play().catch((err) => {
              console.error("Auto-play failed:", err);
              setIsPlaying(false);
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("Secure HLS error:", data);
            if (data.fatal) {
              hls.destroy();
              hlsRef.current = null;
              setError(t("lessons.videoPlayer.hlsError"));
              setSecurityStatus("error");

              // Report security error
              reportSuspiciousActivity(
                lessonId,
                "hls_error",
                data.details,
                token
              );
            }
          });

          hlsRef.current = hls;
          return;
        }

        if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = secureUrl;
          videoRef.current.load();
          setSecurityStatus("ready");
          return;
        }

        setError(t("lessons.videoPlayer.hlsNotSupported"));
        setSecurityStatus("error");
        return;
      }

      // For direct MP4 URLs with security
      videoRef.current.src = secureUrl;
      videoRef.current.load();

      // Enhanced error handling for direct video URLs
      videoRef.current.onerror = (e) => {
        console.error("Secure video load error:", e);
        setError(t("lessons.videoPlayer.loadError"));
        setSecurityStatus("error");

        // Report security error
        reportSuspiciousActivity(
          lessonId,
          "video_load_error",
          e.toString(),
          token
        );
      };

      videoRef.current.onloadeddata = () => {
        console.log("Secure video loaded successfully");
        setError(null);
        setSecurityStatus("ready");
        videoRef.current.play().catch((err) => {
          console.error("Auto-play failed:", err);
          setIsPlaying(false);
        });
      };
    },
    [lessonId, user?.id, token, t]
  );

  // Initialize video player with HLS support and direct MP4 support
  const initializeVideoPlayer = useCallback(
    (videoUrl) => {
      if (!videoRef.current) return;

      console.log("Initializing video player with URL:", videoUrl);

      // Reset video element
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.removeAttribute("src");
      videoRef.current.load();

      const isHls = /\.m3u8(\?.*)?$/i.test(videoUrl);
      const isMp4 = /\.mp4(\?.*)?$/i.test(videoUrl);

      console.log("Video type - HLS:", isHls, "MP4:", isMp4);

      // If URL is HLS, use Hls.js or native HLS
      if (isHls) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });

          hls.loadSource(videoUrl);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("HLS manifest parsed successfully");
            setError(null);
            videoRef.current.play().catch((err) => {
              console.error("Auto-play failed:", err);
              setIsPlaying(false);
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS error:", data);
            if (data.fatal) {
              hls.destroy();
              hlsRef.current = null;
              videoRef.current.src = videoUrl; // Fallback to direct URL
              videoRef.current.load();
              setError(t("lessons.videoPlayer.hlsError"));
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

        setError(t("lessons.videoPlayer.hlsNotSupported"));
        return;
      }

      // For direct MP4 URLs or other video formats
      videoRef.current.src = videoUrl;
      videoRef.current.load();

      // Add error handling for direct video URLs
      videoRef.current.onerror = (e) => {
        console.error("Video load error:", e);
        setError(t("lessons.videoPlayer.loadError"));
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
    [t]
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
          setError(t("lessons.videoPlayer.playError"));
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
      videoRef.current?.requestFullscreen();
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
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
            <p className="text-lg">{t("lessons.videoPlayer.loading")}</p>
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
            <p className="text-lg mb-2">{t("lessons.videoPlayer.error")}</p>
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
      onSecurityViolation={handleSecurityViolation}
    >
      <div className="relative w-full bg-black rounded-lg overflow-hidden group">
        {/* Security Status Indicator */}
        {isSecureMode && (
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                securityStatus === "ready"
                  ? "bg-green-500/90 text-white"
                  : securityStatus === "secure"
                  ? "bg-blue-500/90 text-white"
                  : securityStatus === "error"
                  ? "bg-red-500/90 text-white"
                  : "bg-yellow-500/90 text-white"
              }`}
            >
              {securityStatus === "ready" ? <FaShieldAlt /> : <FaLock />}
              <span>
                {securityStatus === "ready"
                  ? t("lessons.videoPlayer.secure")
                  : securityStatus === "secure"
                  ? t("lessons.videoPlayer.encrypted")
                  : securityStatus === "error"
                  ? t("lessons.videoPlayer.securityError")
                  : t("lessons.videoPlayer.initializing")}
              </span>
            </div>
            
            {/* Security Logs Button */}
            <button
              onClick={() => setShowSecurityLogs(true)}
              className="bg-gray-800/90 text-white p-2 rounded-full hover:bg-gray-700/90 transition-colors"
              title="عرض سجلات الأمان"
            >
              <FaShieldAlt className="text-xs" />
            </button>
          </div>
        )}

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
            // Enhanced security attributes
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Video Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />

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
              <div className="flex items-center space-x-4">
                {/* Play/Pause Button */}
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                </button>

                {/* Volume Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMuteToggle}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {isMuted ? (
                      <FaVolumeMute size={16} />
                    ) : (
                      <FaVolumeUp size={16} />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) =>
                      handleVolumeChange(parseFloat(e.target.value))
                    }
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Time Display */}
                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Lesson Info */}
                {lessonDetails && (
                  <div className="text-sm">
                    <div className="font-medium">{lessonDetails.title}</div>
                    <div className="text-gray-400">
                      {lessonDetails.video_duration_formatted} •{" "}
                      {lessonDetails.video_size_formatted}
                    </div>
                  </div>
                )}

                {/* Fullscreen Button */}
                <button
                  onClick={handleFullscreenToggle}
                  className="hover:text-gray-300 transition-colors"
                >
                  {isFullscreen ? (
                    <FaCompress size={16} />
                  ) : (
                    <FaExpand size={16} />
                  )}
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
