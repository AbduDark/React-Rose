import React, { useState } from "react";
import ReactPlayer from "react-player";
import { FiAlertCircle, FiCheckCircle, FiLoader } from "react-icons/fi";

function VideoTestPage() {
  const [customUrl, setCustomUrl] = useState("");
  const [testingUrl, setTestingUrl] = useState("");
  const [playerStates, setPlayerStates] = useState({});

  const sampleVideos = [
    {
      id: 1,
      title: "فيديو تعليمي عام - Rick Astley",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "تنسيق: youtube.com/watch?v=ID"
    },
    {
      id: 2,
      title: "فيديو قصير - Lofi Music",
      url: "https://youtu.be/jfKfPfyJRdk",
      description: "تنسيق: youtu.be/ID"
    },
    {
      id: 3,
      title: "فيديو تعليمي - Web Dev",
      url: "https://www.youtube.com/embed/8JJ101D3knE",
      description: "تنسيق: youtube.com/embed/ID"
    }
  ];

  const updatePlayerState = (videoId, state) => {
    setPlayerStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], ...state }
    }));
  };

  const handleTestCustomUrl = (e) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setPlayerStates(prev => ({
        ...prev,
        custom: { loading: true, ready: false, error: false, errorMessage: null }
      }));
      setTestingUrl(customUrl.trim());
    }
  };

  const getStateIcon = (state) => {
    if (state?.error) return <FiAlertCircle className="text-red-500" />;
    if (state?.ready) return <FiCheckCircle className="text-green-500" />;
    return <FiLoader className="text-blue-500 animate-spin" />;
  };

  const getStateText = (state) => {
    if (!state) return "لم يبدأ التحميل";
    if (state.error) return `خطأ: ${state.errorMessage || "فشل تحميل الفيديو"}`;
    if (state.ready) return "✅ جاهز للتشغيل";
    if (state.loading) return "جاري التحميل...";
    return "في الانتظار...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎬 اختبار تشغيل فيديوهات اليوتيوب
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            هذه الصفحة لاختبار أن ReactPlayer يشتغل بشكل صحيح مع روابط اليوتيوب المختلفة
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📋 ملاحظات مهمة:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>الفيديو لازم يكون <strong>Public</strong> أو <strong>Unlisted</strong> على اليوتيوب</li>
              <li>تأكد أن خيار <strong>"Allow embedding"</strong> مفعّل في إعدادات الفيديو</li>
              <li>كل التنسيقات المختلفة للروابط بتشتغل (youtube.com, youtu.be, embed)</li>
              <li>افتح Console (F12) عشان تشوف تفاصيل أكتر عن أي أخطاء</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🧪 اختبر رابط مخصص
          </h2>
          <form onSubmit={handleTestCustomUrl} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                         rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 
                         transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                اختبر
              </button>
            </div>
          </form>

          {testingUrl && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">الفيديو المخصص</h3>
                <div className="flex items-center gap-2 text-sm">
                  {getStateIcon(playerStates.custom)}
                  <span className="text-gray-700 dark:text-gray-300">
                    {getStateText(playerStates.custom)}
                  </span>
                </div>
              </div>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <ReactPlayer
                  key={testingUrl}
                  url={testingUrl}
                  controls
                  width="100%"
                  height="100%"
                  onReady={() => {
                    console.log("✅ Custom video ready:", testingUrl);
                    updatePlayerState("custom", { ready: true, loading: false, error: false, errorMessage: null });
                  }}
                  onError={(error) => {
                    console.error("❌ Custom video error:", error);
                    updatePlayerState("custom", { 
                      error: true, 
                      loading: false,
                      ready: false,
                      errorMessage: error?.message || "فشل التحميل" 
                    });
                  }}
                  onBuffer={() => {
                    console.log("⏳ Custom video buffering...");
                    updatePlayerState("custom", { loading: true });
                  }}
                  config={{
                    youtube: {
                      playerVars: {
                        autoplay: 0,
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                      },
                    },
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-all">
                {testingUrl}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📺 أمثلة فيديوهات يوتيوب
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sampleVideos.map((video) => (
              <div 
                key={video.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    {getStateIcon(playerStates[video.id])}
                    <span className="text-gray-700 dark:text-gray-300">
                      {getStateText(playerStates[video.id])}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {video.description}
                </p>
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-2">
                  <ReactPlayer
                    key={video.url}
                    url={video.url}
                    controls
                    width="100%"
                    height="100%"
                    onReady={() => {
                      console.log(`✅ Video ${video.id} ready:`, video.title);
                      updatePlayerState(video.id, { ready: true, loading: false, error: false, errorMessage: null });
                    }}
                    onError={(error) => {
                      console.error(`❌ Video ${video.id} error:`, error);
                      updatePlayerState(video.id, { 
                        error: true, 
                        loading: false,
                        ready: false,
                        errorMessage: error?.message || "فشل التحميل"
                      });
                    }}
                    onBuffer={() => {
                      console.log(`⏳ Video ${video.id} buffering...`);
                      updatePlayerState(video.id, { loading: true });
                    }}
                    config={{
                      youtube: {
                        playerVars: {
                          autoplay: 0,
                          controls: 1,
                          modestbranding: 1,
                          rel: 0,
                        },
                      },
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                  {video.url}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-3 text-lg">
            🔍 كيف تعرف ليه الفيديو مش شغال؟
          </h3>
          <ol className="text-sm text-yellow-800 dark:text-yellow-400 space-y-2 list-decimal list-inside">
            <li>افتح <strong>Console</strong> من Developer Tools (اضغط F12)</li>
            <li>شوف الرسائل اللي بتظهر لكل فيديو (✅ ready, ❌ error)</li>
            <li>لو في error، هيظهر التفاصيل في Console</li>
            <li>أشهر الأخطاء:
              <ul className="list-disc list-inside mr-6 mt-1">
                <li>"Video unavailable" = الفيديو Private أو محذوف</li>
                <li>"Embedding disabled" = صاحب الفيديو منع العرض على مواقع تانية</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default VideoTestPage;
