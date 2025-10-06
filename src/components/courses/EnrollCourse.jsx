import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBook, FaClock, FaGraduationCap, FaMoneyCheck } from "react-icons/fa";
import { getCourseById } from "../../api/courses";
import {
  subscribeToCourse,
  getSubscriptionStatus,
} from "../../api/subscriptions";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import i18next from "i18next";
import ImageNotFound from "../../assets/images/ImageNotFound.png"
function EnrollCourse() {
  const { t } = useTranslation();
  const [enrollError, setEnrollError] = useState(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    vodafone_number: "",
    amount: "",
    parent_phone: "",
    student_info: "",
    payment_proof: null,
  });
  const { courseId } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      try {
        setLoading(true);
        const courseRes = await getCourseById(courseId);
        setCourse(courseRes.data);
        if (token) {
          try {
            const statusRes = await getSubscriptionStatus(token, courseId);
            setSubscriptionStatus(statusRes.data);
          } catch (err) {
            console.log("No subscription found for this course");
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndStatus();
  }, [courseId, token]);
  if (!course) {
    return;
  }
  const handleEnroll = async () => {
    if (!token) {
      setEnrollError(t("enrollCourse.enrollError"));
      return;
    }

    // التحقق من وجود البيانات المطلوبة
    if (!subscriptionData.vodafone_number || !subscriptionData.parent_phone || !subscriptionData.payment_proof) {
      setEnrollError("يرجى ملء جميع البيانات المطلوبة وإرفاق إثبات الدفع");
      return;
    }

    setEnrolling(true);
    setEnrollError(null);
    setEnrollSuccess(false);

    try {
      const formData = new FormData();
      formData.append("course_id", parseInt(courseId));
      formData.append("vodafone_number", subscriptionData.vodafone_number);
      formData.append("amount", parseFloat(course.price || subscriptionData.amount));
      formData.append("parent_phone", subscriptionData.parent_phone);
      formData.append("student_info", subscriptionData.student_info);
      if (subscriptionData.payment_proof) {
        formData.append("payment_proof", subscriptionData.payment_proof);
      }

      await subscribeToCourse(token, formData);
      setEnrollSuccess(true);
      setShowSubscriptionForm(false);
      
      // إعادة تعيين البيانات
      setSubscriptionData({
        vodafone_number: "",
        amount: "",
        parent_phone: "",
        student_info: "",
        payment_proof: null,
      });

      // تحديث حالة الاشتراك
      try {
        const statusRes = await getSubscriptionStatus(token, courseId);
        setSubscriptionStatus(statusRes.data);
      } catch (err) {
        console.log("Error refreshing subscription status");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setEnrollError(
        error.response?.data?.message || error.message || "فشل في الاشتراك. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setSubscriptionData({
      ...subscriptionData,
      [name]: files ? files[0] : value,
    });
  };
  if (loading) {
    return;
  }

  return (
    <div>
      {/* COURSE CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden mb-6 transition-colors border border-transparent dark:border-gray-700">
        <img src={course.image_url || ImageNotFound} alt="Course Thumbnail" className="w-full" />
        <div className="p-4 dark:bg-gray-800 transition-colors">
          {enrollError && (
            <p className="text-red-500 dark:text-red-400 text-sm mb-3">{enrollError}</p>
          )}
          {enrollSuccess && (
            <p className="text-green-500 dark:text-green-400 text-sm mb-3">
              {t("enrollCourse.enrollSuccess")}
            </p>
          )}

          {/* Subscription Status Display */}
          {/* {subscriptionStatus && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Subscription Status
              </h4>
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Status:</strong>{" "}
                  {subscriptionStatus.subscription_status}
                </p>
                {subscriptionStatus.days_remaining !== undefined && (
                  <p>
                    <strong>Days Remaining:</strong>{" "}
                    {Math.ceil(subscriptionStatus.days_remaining)}
                  </p>
                )}
                {subscriptionStatus.is_expired && (
                  <p className="text-red-600 font-semibold">
                    Subscription has expired
                  </p>
                )}
              </div>
            </div>
          )} */}

          {/* Payment Instructions */}
          {showSubscriptionForm && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 transition-colors">
                تعليمات الدفع
              </h4>
              <div className="text-blue-700 dark:text-blue-300 text-sm space-y-2 transition-colors">
                <p>يرجى تحويل مبلغ <strong className="dark:text-blue-100">{course.price} جنيه</strong> إلى الرقم التالي:</p>
                <p className="font-bold text-lg dark:text-blue-100 transition-colors">01008187344</p>
                <p className="dark:text-blue-300">بعد التحويل، خذ لقطة شاشة للدفع واملأ الفورم التالي:</p>
              </div>
            </div>
          )}

          {/* Subscription Form */}
          {showSubscriptionForm && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                {t("enrollCourse.subscriptionDetails")}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("enrollCourse.vodafoneNumber")}
                  </label>
                  <input
                    type="tel"
                    name="vodafone_number"
                    value={subscriptionData.vodafone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-gray-100 transition-colors"
                    placeholder={t("enrollCourse.vodafonePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("enrollCourse.amount")}
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={course.price || subscriptionData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                    placeholder={t("enrollCourse.amountPlaceholder")}
                    readOnly
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("enrollCourse.parentPhone")}
                  </label>
                  <input
                    type="tel"
                    name="parent_phone"
                    value={subscriptionData.parent_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-gray-100 transition-colors"
                    placeholder={t("enrollCourse.parentPhonePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("enrollCourse.studentInfo")}
                  </label>
                  <textarea
                    name="student_info"
                    value={subscriptionData.student_info}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 dark:bg-gray-800 transition-colors"
                    placeholder={t("enrollCourse.studentInfoPlaceholder")}
                    rows="3"
                  />
                </div>

                {/* Payment Proof Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("enrollCourse.paymentProof")} *
                  </label>
                  <input
                    type="file"
                    name="payment_proof"
                    onChange={handleInputChange}
                    accept="image/*"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 transition-colors"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("enrollCourse.paymentProofHint")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showSubscriptionForm && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="mb-3 w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg dark:shadow-green-900/50"
            >
              <FaGraduationCap
                className={`${i18next.language === "ar" ? "ml-2" : "mr-2"}`}
              />
              {enrolling
                ? t("enrollCourse.processing")
                : t("enrollCourse.confirmSubscription")}
            </button>
          )}

          {!subscriptionStatus?.subscription?.is_active ? (
            <button
              onClick={() => setShowSubscriptionForm(!showSubscriptionForm)}
              className="w-full bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg dark:shadow-pink-900/50"
            >
              <FaGraduationCap
                className={`${i18next.language === "ar" ? "ml-2" : "mr-2"}`}
              />
              {showSubscriptionForm
                ? t("enrollCourse.cancel")
                : "اشترك الآن"}
            </button>
          ) : null}
        </div>
      </div>

      {/* COURSE DETAILS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 transition-colors border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 transition-colors">
          {t("enrollCourse.courseIncludes")}
        </h3>
        <ul className="space-y-3">
          <li className="flex justify-between items-center py-2 transition-colors">
            <div className="flex items-center">
              <FaMoneyCheck
                className={`text-pink-600 dark:text-pink-400 transition-colors ${
                  i18next.language === "ar" ? "ml-3" : "mr-3"
                }`}
              />
              <span className="text-gray-700 dark:text-gray-200 transition-colors">{t("enrollCourse.price")}</span>
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-semibold transition-colors">{course.price}</span>
          </li>
          <li className="flex justify-between items-center py-2 transition-colors">
            <div className="flex items-center">
              <FaBook
                className={`text-pink-600 dark:text-pink-400 transition-colors ${
                  i18next.language === "ar" ? "ml-3" : "mr-3"
                }`}
              />
              <span className="text-gray-700 dark:text-gray-200 transition-colors">{t("enrollCourse.episodes")}</span>
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-semibold transition-colors">{course.lessons_count}</span>
          </li>
          <li className="border-t border-gray-100 dark:border-gray-700 transition-colors"></li>
          <li className="flex justify-between items-center py-2 transition-colors">
            <div className="flex items-center">
              <FaClock
                className={`text-pink-600 dark:text-pink-400 transition-colors ${
                  i18next.language === "ar" ? "ml-3" : "mr-3"
                }`}
              />
              <span className="text-gray-700 dark:text-gray-200 transition-colors">{t("enrollCourse.date")}</span>
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-semibold transition-colors">
              {course.created_at.split("T")[0]}
            </span>
          </li>
          <li className="border-t border-gray-100 dark:border-gray-700 transition-colors"></li>
        </ul>
      </div>
    </div>
  );
}

export default EnrollCourse;