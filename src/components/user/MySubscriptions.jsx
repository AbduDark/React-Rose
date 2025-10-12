import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  getMySubscriptions,
  cancelSubscription,
  renewSubscription,
} from "../../api/subscriptions";
import { useAuth } from "../../context/AuthContext";
import i18next from "i18next";
import { FiHeart } from "react-icons/fi";

const MySubscriptions = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRenewForm, setShowRenewForm] = useState(null);
  const [renewData, setRenewData] = useState({
    vodafone_number: "",
    parent_phone: "",
    payment_proof: null,
  });
  
  useEffect(() => {
    if (!token) {
      setError(t("mySubscriptions.error.login"));
      setLoading(false);
      navigate("/auth/login");
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        const currentLang = i18n.language || 'ar';
        const data = await getMySubscriptions(token, currentLang);
        const subs = data?.data?.subscriptions || [];
        setSubscriptions(subs);
        
        const firstRejectedOrExpired = subs.find(
          sub => sub.is_expired || sub.status === "expired" || sub.status === "rejected"
        );
        if (firstRejectedOrExpired) {
          setShowRenewForm(firstRejectedOrExpired.id);
        }
      } catch (err) {
        setError(err.message || t("mySubscriptions.error.fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [token, navigate, t, i18n.language]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm(t("common.confirm"))) {
      return;
    }

    setActionLoading(subscriptionId);
    setError(null);
    setSuccess(null);
    try {
      const currentLang = i18n.language || 'ar';
      const response = await cancelSubscription(token, subscriptionId, currentLang);
      const successMsg = typeof response.message === 'object' 
        ? response.message[currentLang] || response.message.en || response.message.ar 
        : response.message;
      setSuccess(successMsg || t("mySubscriptions.cancelSuccess"));
      
      setTimeout(() => setSuccess(null), 3000);
      
      const data = await getMySubscriptions(token, currentLang);
      setSubscriptions(data?.data?.subscriptions || []);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenewSubscription = async (subscriptionId) => {
    if (!renewData.vodafone_number || !renewData.parent_phone || !renewData.payment_proof) {
      setError(t("enrollCourse.fillAllFields") || "الرجاء ملء جميع الحقول");
      return;
    }

    setActionLoading(subscriptionId);
    setError(null);
    setSuccess(null);
    try {
      const currentLang = i18n.language || 'ar';
      const formData = new FormData();
      formData.append('subscription_id', subscriptionId);
      formData.append('vodafone_number', renewData.vodafone_number);
      formData.append('parent_phone', renewData.parent_phone);
      if (renewData.payment_proof instanceof File) {
        formData.append('payment_proof', renewData.payment_proof);
      }

      const response = await renewSubscription(token, formData, currentLang);
      setSuccess(t("mySubscriptions.renewSuccess"));
      
      setShowRenewForm(null);
      setRenewData({ vodafone_number: "", parent_phone: "", payment_proof: null });

      setTimeout(() => {
        setSuccess(null);
        navigate("/dashboard/subscriptions");
      }, 2000);

      const data = await getMySubscriptions(token, currentLang);
      setSubscriptions(data?.data?.subscriptions || []);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenewInputChange = (e) => {
    const { name, value, files } = e.target;
    setRenewData({
      ...renewData,
      [name]: files ? files[0] : value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-10 text-center">
          {t("mySubscriptions.title")}
        </h2>

        {success && (
          <div className="mb-8 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center transition-colors">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-center transition-colors">
            {error}
            {error.includes("log in") && (
              <Link
                to="/auth/login"
                className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t("auth.login.loginButton")}
              </Link>
            )}
          </div>
        )}

        {loading && !error ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 dark:border-indigo-400 transition-all duration-300"></div>
          </div>
        ) : subscriptions.length === 0 && !error ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 font-medium">
              {t("mySubscriptions.noSubscriptions")}.{" "}
              {t("mySubscriptions.explore")}
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 text-sm font-semibold"
            >
              {t("mySubscriptions.explore")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="mb-4">
                  <div
                    className="h-40 w-full rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    {sub.course?.image_url ? (
                      <img
                        src={sub.course.image_url}
                        alt={sub.course.title}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400 text-lg font-medium">
                        {sub.course?.title || t("cardCourse.error")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {sub.course?.title || t("cardCourse.error")}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        sub.is_active
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {sub.status
                        ? sub.status.charAt(0).toUpperCase() +
                          sub.status.slice(1)
                        : t("common.error")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>
                    <span className="font-medium">
                      {t("mySubscriptions.instructor")}:
                    </span>{" "}
                    {sub.course?.instructor_name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">
                      {t("mySubscriptions.level")}:
                    </span>{" "}
                    {sub.course?.level
                      ? sub.course.level.charAt(0).toUpperCase() +
                        sub.course.level.slice(1)
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">
                      {t("mySubscriptions.duration")}:
                    </span>{" "}
                    {sub.course?.duration_hours
                      ? `${sub.course.duration_hours} ${t("cardCourse.hours")}`
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">
                      {t("mySubscriptions.price")}:
                    </span>{" "}
                    {sub.course?.price ? `$${sub.course.price}` : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">
                      {t("mySubscriptions.subscribed")}:
                    </span>{" "}
                    {sub.subscribed_at ? formatDate(sub.subscribed_at) : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">
                      {t("mySubscriptions.expires")}:
                    </span>{" "}
                    {sub.expires_at ? formatDate(sub.expires_at) : "N/A"}
                  </p>
                </div>
                <div className="mt-6 space-y-2">
                  {/* View Course Button - Only for approved and not expired */}
                  {sub.status === "approved" && !sub.is_expired && (
                    <Link
                      to={`/courses/${sub.course_id}/lessons`}
                      className="inline-block w-full text-center bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 text-sm font-semibold"
                    >
                      {t("mySubscriptions.viewCourse")}
                    </Link>
                  )}

                  {/* Pending Status Message */}
                  {sub.status === "pending" && (
                    <div className="w-full text-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold">
                      {t("mySubscriptions.pendingApproval") || "قيد المراجعة"}
                    </div>
                  )}

                  {/* Rejected Status Message */}
                  {sub.status === "rejected" && (
                    <div className="w-full text-center bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-semibold">
                      {t("mySubscriptions.rejectedStatus") || "مرفوض - يرجى تقديم طلب جديد"}
                    </div>
                  )}

                  {/* Expired Status Message */}
                  {(sub.is_expired || sub.status === "expired") && (
                    <div className="w-full text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-lg text-sm font-semibold">
                      {t("mySubscriptions.expiredStatus") || "منتهي - يرجى التجديد"}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {/* Renew Button - Only for expired or rejected */}
                    {(sub.is_expired || sub.status === "expired" || sub.status === "rejected") && (
                      <button
                        onClick={() => {
                          setShowRenewForm(showRenewForm === sub.id ? null : sub.id);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="flex-1 bg-green-600 dark:bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 text-sm font-semibold"
                      >
                        {t("mySubscriptions.renew") || "تجديد الاشتراك"}
                      </button>
                    )}
                  </div>

                  {showRenewForm === sub.id && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-2 border-indigo-200 dark:border-indigo-600 rounded-xl shadow-md transition-colors">
                      <h5 className="font-bold text-indigo-800 dark:text-indigo-200 mb-4 text-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        {t("mySubscriptions.renewForm")}
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            {t("enrollCourse.vodafoneNumber")}
                          </label>
                          <input
                            type="tel"
                            name="vodafone_number"
                            value={renewData.vodafone_number}
                            onChange={handleRenewInputChange}
                            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
                            placeholder={t("enrollCourse.vodafonePlaceholder")}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            {t("enrollCourse.parentPhone")}
                          </label>
                          <input
                            type="tel"
                            name="parent_phone"
                            value={renewData.parent_phone}
                            onChange={handleRenewInputChange}
                            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
                            placeholder={t("enrollCourse.parentPhonePlaceholder")}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            {t("enrollCourse.paymentProof")}
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              name="payment_proof"
                              onChange={handleRenewInputChange}
                              accept="image/*"
                              required
                              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-200 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-800 transition-all cursor-pointer"
                            />
                          </div>
                          {renewData.payment_proof && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {renewData.payment_proof.name}
                            </p>
                          )}
                        </div>
                        <div
                          className={`flex gap-3 pt-2 ${
                            i18next.language === "ar" ? "flex-row-reverse" : ""
                          }`}
                        >
                          <button
                            onClick={() => handleRenewSubscription(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-600 text-white px-4 py-3 rounded-lg text-sm font-bold disabled:opacity-50 hover:from-green-700 hover:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 transition-all transform hover:scale-105 shadow-md"
                          >
                            {actionLoading === sub.id
                              ? t("enrollCourse.processing")
                              : t("mySubscriptions.confirmRenew")}
                          </button>
                          <button
                            onClick={() => {
                              setShowRenewForm(null);
                              setRenewData({ vodafone_number: "", parent_phone: "", payment_proof: null });
                              setError(null);
                            }}
                            className="flex-1 bg-gray-400 dark:bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-gray-500 dark:hover:bg-gray-700 transition-all shadow-md"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;