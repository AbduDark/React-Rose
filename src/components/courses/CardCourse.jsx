import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaStar, FaStarHalfAlt, FaRegStar, FaClock } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useCourse } from "../../context/CourseContext";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import i18next from "i18next";
import ImageNotFound from "../../assets/images/ImageNotFound.png";
import Pagination from "../common/Pagination";
import { useAuth } from "../../context/AuthContext";
import { addToFavorites, removeFromFavorites, getFavoriteSubscriptions } from "../../api/favorites";
import { getMySubscriptions } from "../../api/subscriptions";
import SubscriptionStatusModal from "../common/SubscriptionStatusModal";

function CardCourse() {
  const { t } = useTranslation();
  const { courses, loading, error, page, setPage, meta } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  const [favoriteCourseIds, setFavoriteCourseIds] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;
      try {
        const currentLang = i18next.language || 'ar';
        const data = await getFavoriteSubscriptions(token, currentLang);
        const subscriptions = data?.data?.subscriptions || data?.data?.favorites || data?.subscriptions || data?.favorites || [];
        const favoriteIds = subscriptions.map(sub => sub.course_id);
        setFavoriteCourseIds(favoriteIds);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };
    fetchFavorites();
  }, [token]);

  const handleCourseClick = async (courseId) => {
    if (!user) {
      navigate(`/courses/${courseId}`);
      return;
    }

    if (user.role !== "student") {
      navigate(`/courses/${courseId}`);
      return;
    }

    try {
      const currentLang = i18next.language || 'ar';
      const response = await getMySubscriptions(token, currentLang);
      
      const subscriptions = response?.data?.subscriptions || response?.subscriptions || [];
      const courseSubscription = subscriptions.find(sub => sub.course_id === courseId);

      if (!courseSubscription) {
        navigate(`/courses/${courseId}`);
        return;
      }

      const actualStatus = courseSubscription.status;
      const endDate = courseSubscription.end_date;
      const isExpired = endDate ? new Date(endDate) < new Date() : false;

      if (actualStatus === "pending") {
        setSelectedCourseId(courseId);
        setModalStatus("pending");
        setModalOpen(true);
      } else if (actualStatus === "rejected") {
        setSelectedCourseId(courseId);
        setModalStatus("rejected");
        setModalOpen(true);
      } else if (isExpired && actualStatus === "approved") {
        setSelectedCourseId(courseId);
        setModalStatus("expired");
        setModalOpen(true);
      } else if (actualStatus === "approved" && !isExpired) {
        navigate(`/courses/${courseId}`);
      } else {
        navigate(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      navigate(`/courses/${courseId}`);
    }
  };

  const handleToggleFavorite = async (e, courseId) => {
    e.stopPropagation();
    if (!token) {
      navigate("/auth/login");
      return;
    }

    setFavoriteLoading(prev => ({ ...prev, [courseId]: true }));
    try {
      const currentLang = i18next.language || 'ar';
      const isFavorite = favoriteCourseIds.includes(courseId);
      if (isFavorite) {
        await removeFromFavorites(token, courseId, currentLang);
        setFavoriteCourseIds(prev => prev.filter(id => id !== courseId));
      } else {
        await addToFavorites(token, courseId, currentLang);
        setFavoriteCourseIds(prev => [...prev, courseId]);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const renderStars = (rating) => {
    if (!rating)
      return <span className="text-gray-400">{t("cardCourse.noRating")}</span>;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="text-center my-9 text-red-600">
        {t("cardCourse.error")}
      </div>
    );

  return (
    <>
      <SubscriptionStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        status={modalStatus}
        courseId={selectedCourseId}
      />
      <div className="container mx-auto py-12 px-4">
        <motion.div
          className={`grid grid-cols-1 md:grid-cols-3 3xl:grid-cols-4 gap-6`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleCourseClick(course.id)}
              className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl dark:shadow-gray-900 cursor-pointer relative border border-transparent dark:border-gray-600"
            >
              <motion.button
                onClick={(e) => handleToggleFavorite(e, course.id)}
                disabled={favoriteLoading[course.id]}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-all ${
                  token && favoriteCourseIds.includes(course.id) ? "text-red-500" : "text-gray-400 dark:text-gray-300"
                } ${favoriteLoading[course.id] ? "opacity-50" : ""}`}
                title={token && favoriteCourseIds.includes(course.id) ? t("favorites.removeFromFavorites") || "إزالة من المفضلة" : t("favorites.addToFavorites") || "إضافة للمفضلة"}
              >
                <FiHeart className={`w-5 h-5 ${token && favoriteCourseIds.includes(course.id) ? "fill-current" : ""}`} />
              </motion.button>
              <motion.img
                src={course.image_url || ImageNotFound}
                alt={course.title}
                className="w-full h-48 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 text-xs font-medium px-2.5 py-0.5 rounded">
                    {course.level}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {course.language}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{course.title}</h3>
                <div className="flex items-center mb-3">
                  {renderStars(course.avg_rating)}
                  <span className="text-gray-600 dark:text-gray-300 text-sm ml-2">
                    {course.avg_rating ? `${course.avg_rating}/5` : ""}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {course.description}
                </p>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <FaClock
                      className={`text-red-500 dark:text-red-400 ${
                        i18next.language === "ar" ? "ml-1" : "mr-1"
                      }`}
                    />
                    {course.duration_hours} {t("cardCourse.hours")}
                  </span>
                  <span>
                    {course.lessons_count} {t("cardCourse.lessons")}
                  </span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t("cardCourse.instructor")}: {course.instructor_name}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      {location.pathname === "/courses" && meta && meta.last_page > 1 && (
        <Pagination page={page} setPage={setPage} pageCount={meta.last_page} />
      )}
    </>
  );
}

export default CardCourse;
