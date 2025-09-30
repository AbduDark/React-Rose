import CryptoJS from "crypto-js";
import {
  getEncryptionKey,
  getTokenConfig,
  SECURITY_CONFIG,
} from "../config/security";

/**
 * خدمة أمان الفيديو المتقدمة
 * تتضمن تشفير URLs، رموز المصادقة المؤقتة، وحماية من التحميل غير المصرح به
 */
class VideoSecurityService {
  constructor() {
    this.encryptionKey = getEncryptionKey();
    const tokenConfig = getTokenConfig();
    this.tokenExpiry = tokenConfig.expiry;
    this.maxViews = tokenConfig.maxViews;
    this.maxViolations = tokenConfig.maxViolations;
    this.sessionTokens = new Map(); // تخزين مؤقت للرموز
  }

  /**
   * تشفير URL الفيديو مع معلومات إضافية
   */
  encryptVideoUrl(videoUrl, lessonId, userId) {
    const payload = {
      url: videoUrl,
      lessonId: lessonId,
      userId: userId,
      timestamp: Date.now(),
      expiry: Date.now() + this.tokenExpiry,
      maxViews: this.maxViews,
      currentViews: 0,
    };

    const encryptedPayload = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      this.encryptionKey
    ).toString();

    return btoa(encryptedPayload); // Base64 encoding
  }

  /**
   * فك تشفير URL الفيديو والتحقق من الصلاحية
   */
  decryptVideoUrl(encryptedUrl) {
    try {
      const decryptedPayload = CryptoJS.AES.decrypt(
        atob(encryptedUrl),
        this.encryptionKey
      ).toString(CryptoJS.enc.Utf8);

      const payload = JSON.parse(decryptedPayload);

      // التحقق من انتهاء الصلاحية
      if (Date.now() > payload.expiry) {
        throw new Error("Video URL has expired");
      }

      // التحقق من عدد المشاهدات
      if (payload.currentViews >= payload.maxViews) {
        throw new Error("Maximum views exceeded");
      }

      return payload;
    } catch (error) {
      throw new Error("Invalid or corrupted video URL");
    }
  }

  /**
   * إنشاء رمز مصادقة مؤقت للفيديو
   */
  generateVideoToken(lessonId, userId, sessionId) {
    const tokenData = {
      lessonId,
      userId,
      sessionId,
      timestamp: Date.now(),
      expiry: Date.now() + this.tokenExpiry,
      nonce: Math.random().toString(36).substring(2, 15),
    };

    const token = CryptoJS.HmacSHA256(
      JSON.stringify(tokenData),
      this.encryptionKey
    ).toString();

    // حفظ الرمز في التخزين المؤقت
    this.sessionTokens.set(token, {
      ...tokenData,
      isValid: true,
      viewCount: 0,
    });

    return token;
  }

  /**
   * التحقق من صحة رمز المصادقة
   */
  validateVideoToken(token, lessonId, userId) {
    const tokenData = this.sessionTokens.get(token);

    if (!tokenData) {
      return { valid: false, error: "Token not found" };
    }

    if (!tokenData.isValid) {
      return { valid: false, error: "Token is invalid" };
    }

    if (Date.now() > tokenData.expiry) {
      this.sessionTokens.delete(token);
      return { valid: false, error: "Token has expired" };
    }

    if (tokenData.lessonId !== lessonId || tokenData.userId !== userId) {
      return { valid: false, error: "Token mismatch" };
    }

    // زيادة عداد المشاهدات
    tokenData.viewCount++;
    if (tokenData.viewCount > this.maxViews) {
      tokenData.isValid = false;
      return { valid: false, error: "Maximum views exceeded" };
    }

    return { valid: true, tokenData };
  }

  /**
   * إبطال رمز المصادقة
   */
  invalidateToken(token) {
    if (this.sessionTokens.has(token)) {
      this.sessionTokens.get(token).isValid = false;
    }
  }

  /**
   * تنظيف الرموز المنتهية الصلاحية
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of this.sessionTokens.entries()) {
      if (now > data.expiry) {
        this.sessionTokens.delete(token);
      }
    }
  }

  /**
   * إنشاء URL آمن للفيديو مع HLS/DASH - Frontend Only
   */
  createSecureVideoUrl(originalUrl, lessonId, userId) {
    try {
      // تشفير URL الأصلي مع معلومات إضافية
      const encryptedPayload = this.encryptVideoUrl(
        originalUrl,
        lessonId,
        userId
      );

      // إنشاء URL آمن محلي
      const secureUrl = new URL(window.location.origin);
      secureUrl.pathname = "/api/secure-video";
      secureUrl.searchParams.set("token", encryptedPayload);
      secureUrl.searchParams.set("lesson_id", lessonId);
      secureUrl.searchParams.set("user_id", userId);
      secureUrl.searchParams.set("timestamp", Date.now().toString());

      return secureUrl.toString();
    } catch (error) {
      console.warn("Failed to create secure URL, using original:", error);
      return originalUrl;
    }
  }

  /**
   * تطبيق حماية إضافية على عنصر الفيديو
   */
  applyVideoProtection(videoElement) {
    // منع النقر بالزر الأيمن
    videoElement.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });

    // منع اختيار النص
    videoElement.style.userSelect = "none";
    videoElement.style.webkitUserSelect = "none";
    videoElement.style.mozUserSelect = "none";
    videoElement.style.msUserSelect = "none";

    // منع السحب والإفلات
    videoElement.addEventListener("dragstart", (e) => {
      e.preventDefault();
      return false;
    });

    // منع اختصارات لوحة المفاتيح
    videoElement.addEventListener("keydown", (e) => {
      // منع F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "s")
      ) {
        e.preventDefault();
        return false;
      }
    });

    // إضافة طبقة حماية شفافة
    const protectionOverlay = document.createElement("div");
    protectionOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      pointer-events: none;
      background: transparent;
    `;

    videoElement.parentElement.style.position = "relative";
    videoElement.parentElement.appendChild(protectionOverlay);
  }

  /**
   * مراقبة محاولات التحميل غير المصرح بها
   */
  monitorDownloadAttempts(videoElement, lessonId, userId) {
    let downloadAttempts = 0;
    const maxAttempts = 3;

    // مراقبة طلبات الشبكة المشبوهة
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0];
      if (
        typeof url === "string" &&
        url.includes("video") &&
        !url.includes("token")
      ) {
        downloadAttempts++;
        if (downloadAttempts > maxAttempts) {
          console.warn("Suspicious download attempt detected");
          // يمكن إرسال تنبيه للخادم هنا
          return Promise.reject(new Error("Unauthorized access attempt"));
        }
      }
      return originalFetch.apply(this, args);
    };

    // مراقبة تغييرات DOM المشبوهة
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (
              element.tagName === "A" &&
              element.href &&
              element.href.includes("video")
            ) {
              console.warn("Suspicious video link detected");
              element.remove();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      window.fetch = originalFetch;
    };
  }
}

// إنشاء مثيل واحد من الخدمة
const videoSecurityService = new VideoSecurityService();

// تنظيف دوري للرموز المنتهية الصلاحية
setInterval(() => {
  videoSecurityService.cleanupExpiredTokens();
}, 5 * 60 * 1000); // كل 5 دقائق

export default videoSecurityService;
