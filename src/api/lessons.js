const API_BASE = import.meta.env.VITE_API_BASE;

// Admin Lesson Management APIs

export const getAllLessons = async (params = {}, token) => {
  const { course_id, page = 1 } = params;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const queryParams = new URLSearchParams();
  if (course_id) queryParams.append("course_id", course_id);
  if (page) queryParams.append("page", page);

  const res = await fetch(
    `${API_BASE}/admin/lessons?${queryParams.toString()}`,
    {
      method: "GET",
      headers,
    }
  );

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (typeof payload === "object" && payload?.message) ||
      (typeof payload === "string"
        ? `Server error (${res.status}): Received non-JSON response. ${payload
            .substring(0, 180)
            .replace(/\n/g, " ")}`
        : "Failed to fetch lessons.");
    throw new Error(message);
  }
  return payload;
};

export const createLesson = async (lessonData, token) => {
  if (!lessonData.course_id || !lessonData.title) {
    throw new Error("course_id and title are required");
  }
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/lessons`, {
    method: "POST",
    headers,
    body: JSON.stringify(lessonData),
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(
      (typeof data === "object" && data?.message) ||
        (typeof data === "string"
          ? `Server error (${res.status}): ${data}`
          : `Failed to create lesson (Status: ${res.status})`)
    );
  }
  return data;
};

export const updateLesson = async (lessonId, lessonData, token) => {
  if (!lessonId) {
    throw new Error("lessonId is required");
  }
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/lessons/${lessonId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(lessonData),
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(
      (typeof data === "object" && data?.message) ||
        (typeof data === "string"
          ? `Server error (${res.status}): ${data}`
          : `Failed to update lesson (Status: ${res.status})`)
    );
  }
  return data;
};

export const deleteLesson = async (lessonId, token) => {
  if (!lessonId) {
    throw new Error("lessonId is required");
  }

  const headers = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/lessons/${lessonId}`, {
    method: "DELETE",
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(
      (typeof data === "object" && data?.message) ||
        (typeof data === "string"
          ? `Server error (${res.status}): ${data}`
          : `Failed to delete lesson (Status: ${res.status})`)
    );
  }

  return data;
};

export const uploadLessonVideo = async (lessonId, videoFile, token) => {
  if (!lessonId || !videoFile) {
    throw new Error("lessonId and videoFile are required");
  }

  const formData = new FormData();
  formData.append("video", videoFile);

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/video/${lessonId}/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(
      (typeof data === "object" && data?.message) ||
        (typeof data === "string"
          ? `Server error (${res.status}): ${data}`
          : `Failed to upload video (Status: ${res.status})`)
    );
  }
  return data;
};

export const deleteLessonVideo = async (lessonId, token) => {
  if (!lessonId) {
    throw new Error("lessonId is required");
  }

  const headers = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/video/${lessonId}/delete`, {
    method: "DELETE",
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(
      (typeof data === "object" && data?.message) ||
        (typeof data === "string"
          ? `Server error (${res.status}): ${data}`
          : `Failed to delete video (Status: ${res.status})`)
    );
  }

  return data;
};

// Student Lesson APIs

export const getLessonsByCourse = async (courseId, token) => {
  if (!courseId) throw new Error("courseId is required");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/courses/${courseId}/lessons`, {
    method: "GET",
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (typeof payload === "object" && payload?.message) ||
      (typeof payload === "string"
        ? `Server error (${res.status}): Received non-JSON response. ${payload
            .substring(0, 180)
            .replace(/\n/g, " ")}`
        : "Failed to fetch lessons.");
    throw new Error(message);
  }
  return payload;
};

export const getLessonComments = async (lessonId, token) => {
  if (!lessonId) throw new Error("lessonId is required");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/lessons/${lessonId}/comments`, {
    method: "GET",
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (typeof payload === "object" && payload?.message) ||
      (typeof payload === "string"
        ? `Server error (${res.status}): ${payload
            .substring(0, 180)
            .replace(/\n/g, " ")}`
        : `Failed to fetch comments (Status: ${res.status})`);
    throw new Error(message);
  }

  // Extract comments from payload.data.comments
  return payload.data?.comments || [];
};

export const createComment = async ({ lesson_id, content }, token) => {
  if (!lesson_id || !content) {
    throw new Error("lesson_id and content are required");
  }
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ lesson_id, content }),
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(
      (typeof data === "object" && data?.message) ||
        (typeof data === "string"
          ? `Server error (${res.status}): ${data}`
          : `Failed to create comment (Status: ${res.status})`)
    );
  }
  return data.data?.comment || data;
};

export const deleteComment = async (commentId, token) => {
  if (!commentId) {
    throw new Error("commentId is required");
  }

  const headers = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: "DELETE",
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(
      (typeof data === "object" && data?.message) ||
        (typeof data === "string"
          ? `Server error (${res.status}): ${data}`
          : `Failed to delete comment (Status: ${res.status})`)
    );
  }

  return data;
};

// Get Lesson Details API
export const getLessonDetails = async (lessonId, token) => {
  if (!lessonId) {
    throw new Error("lessonId is required");
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/lessons/${lessonId}`, {
    method: "GET",
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (typeof data === "object" && data?.message) ||
      (typeof data === "string"
        ? `Server error (${res.status}): ${data
            .substring(0, 180)
            .replace(/\n/g, " ")}`
        : `Failed to fetch lesson details (Status: ${res.status})`);
    throw new Error(message);
  }

  return data;
};

// Get Secure Video URL API - Frontend Only Implementation
export const getSecureVideoUrl = async (lessonId, token) => {
  if (!lessonId) {
    throw new Error("lessonId is required");
  }

  // استخدام خدمة الأمان المحلية لإنشاء URL آمن
  const videoSecurityService = (
    await import("../services/VideoSecurityService")
  ).default;

  // الحصول على تفاصيل الدرس أولاً
  const lessonDetails = await getLessonDetails(lessonId, token);
  const lessonData = lessonDetails.data || lessonDetails;

  if (!lessonData.has_video || !lessonData.video_url) {
    throw new Error("No video available for this lesson");
  }

  // إنشاء URL آمن محلياً
  const secureUrl = videoSecurityService.createSecureVideoUrl(
    lessonData.video_url,
    lessonId,
    lessonData.user_id || "anonymous"
  );

  // إنشاء رمز جلسة محلي
  const sessionToken = videoSecurityService.generateVideoToken(
    lessonId,
    lessonData.user_id || "anonymous",
    Date.now().toString()
  );

  return {
    data: {
      secure_url: secureUrl,
      session_token: sessionToken,
      expires_at: Date.now() + 30 * 60 * 1000, // 30 دقيقة
      original_url: lessonData.video_url,
    },
  };
};

// Validate Video Access API - Frontend Only Implementation
export const validateVideoAccess = async (lessonId, token, sessionToken) => {
  if (!lessonId || !sessionToken) {
    throw new Error("lessonId and sessionToken are required");
  }

  // استخدام خدمة الأمان المحلية للتحقق
  const videoSecurityService = (
    await import("../services/VideoSecurityService")
  ).default;

  // الحصول على معلومات المستخدم من الـ token
  const userInfo = await getUserInfoFromToken(token);

  // التحقق من صحة الرمز محلياً
  const validation = videoSecurityService.validateVideoToken(
    sessionToken,
    lessonId,
    userInfo.id || "anonymous"
  );

  return {
    data: {
      valid: validation.valid,
      error: validation.error,
      remaining_views: validation.valid
        ? 3 - (validation.tokenData?.viewCount || 0)
        : 0,
      expires_at: validation.tokenData?.expiry || Date.now(),
    },
  };
};

// دالة مساعدة للحصول على معلومات المستخدم من الـ token
const getUserInfoFromToken = async (token) => {
  try {
    // محاولة فك تشفير الـ JWT token (إذا كان JWT)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.user_id || payload.sub || "anonymous",
      email: payload.email || "unknown@example.com",
      name: payload.name || "Anonymous User",
    };
  } catch (error) {
    // إذا فشل فك التشفير، إرجاع معلومات افتراضية
    return {
      id: "anonymous",
      email: "unknown@example.com",
      name: "Anonymous User",
    };
  }
};

// Report Suspicious Activity API - Frontend Only Implementation
export const reportSuspiciousActivity = async (
  lessonId,
  activityType,
  details,
  token
) => {
  if (!lessonId || !activityType) {
    throw new Error("lessonId and activityType are required");
  }

  // تسجيل النشاط المشبوه محلياً
  const securityLog = {
    lessonId,
    activityType,
    details,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    token: token ? "present" : "missing",
  };

  // حفظ في localStorage للتحليل لاحقاً
  try {
    const existingLogs = JSON.parse(
      localStorage.getItem("security_logs") || "[]"
    );
    existingLogs.push(securityLog);

    // الاحتفاظ بآخر 100 سجل فقط
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }

    localStorage.setItem("security_logs", JSON.stringify(existingLogs));

    // طباعة تحذير في وحدة التحكم
    console.warn("🚨 Security Violation Detected:", {
      type: activityType,
      lesson: lessonId,
      details: details,
      timestamp: new Date().toISOString(),
    });

    // إرسال إشعار للمستخدم إذا كان النشاط خطير
    if (
      [
        "script_injection",
        "dev_tools_opened",
        "download_link_injection",
      ].includes(activityType)
    ) {
      showSecurityAlert(activityType, lessonId);
    }
  } catch (error) {
    console.error("Failed to log security violation:", error);
  }

  return { success: true, logged: true };
};

// دالة لإظهار تنبيه أمني للمستخدم
const showSecurityAlert = (activityType, lessonId) => {
  const alertMessages = {
    script_injection: "تم اكتشاف محاولة حقن سكريبت مشبوهة",
    dev_tools_opened: "تم اكتشاف فتح أدوات المطور",
    download_link_injection: "تم اكتشاف محاولة حقن رابط تحميل",
  };

  const message = alertMessages[activityType] || "تم اكتشاف نشاط مشبوه";

  // إظهار تنبيه بصري
  const alertDiv = document.createElement("div");
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 300px;
  `;

  alertDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">⚠️ تحذير أمني</div>
    <div>${message}</div>
    <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">
      الدرس: ${lessonId} | ${new Date().toLocaleTimeString("ar-SA")}
    </div>
  `;

  document.body.appendChild(alertDiv);

  // إزالة التنبيه بعد 5 ثوان
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 5000);
};
