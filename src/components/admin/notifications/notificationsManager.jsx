import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiBell, FiUsers, FiBarChart2 } from "react-icons/fi";
import { getNotificationsStatistics } from "../../../api/notifications";
import CreateNotification from "./Createnotifications";

const NotificationsManager = () => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse] = await Promise.all([
        getNotificationsStatistics(),
      ]);

      setStatistics(statsResponse.data);
      setError("");
    } catch (err) {
      setError(
        t("adminDashboard.notificationsManager.failedToFetch") +
          ": " +
          err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSent = () => {
    setIsCreateModalOpen(false);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">
          {t("adminDashboard.notificationsManager.loadingNotifications")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex justify-between  md:flex-row flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {t("adminDashboard.notificationsManager.title")}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center mt-4 md:mt-0 gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg"
            >
              <FiPlus className="w-4 h-4" />
              {t("adminDashboard.notificationsManager.sendNotification")}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">
                    {t(
                      "adminDashboard.notificationsManager.statistics.totalNotifications"
                    )}
                  </p>
                  <p className="text-2xl font-bold">
                    {statistics.total_notifications}
                  </p>
                </div>
                <FiBell className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">
                    {t(
                      "adminDashboard.notificationsManager.statistics.sentToday"
                    )}
                  </p>
                  <p className="text-2xl font-bold">{statistics.today_notifications}</p>
                </div>
                <FiBarChart2 className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">
                    {t(
                      "adminDashboard.notificationsManager.statistics.readNotifications"
                    )}
                  </p>
                  <p className="text-2xl font-bold">
                    {statistics.read_notifications}
                    {` `}
                    ({Math.ceil(statistics.read_percentage)}%)
                  </p>
                </div>
                <FiUsers className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">
                    {t(
                      "adminDashboard.notificationsManager.statistics.unreadNotifications"
                    )}
                  </p>
                  <p className="text-2xl font-bold">
                    {statistics.unread_notifications}
                  </p>
                </div>
                <FiBell className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">
                    {t(
                      "adminDashboard.notificationsManager.statistics.sentWeek"
                    )}
                  </p>
                  <p className="text-2xl font-bold">{statistics.this_week_notifications}</p>
                </div>
                <FiBarChart2 className="w-8 h-8 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">
                    {t(
                      "adminDashboard.notificationsManager.statistics.sentMonth"
                    )}
                  </p>
                  <p className="text-2xl font-bold">{statistics.this_month_notifications}</p>
                </div>
                <FiBarChart2 className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      <CreateNotification
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onNotificationSent={handleNotificationSent}
      />
    </div>
  );
};

export default NotificationsManager;
