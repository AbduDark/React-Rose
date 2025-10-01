import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUnreadCount } from "../api/notifications";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!token || !user || isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const count = await getUnreadCount(token);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, user, isLoading]);

  useEffect(() => {
    if (token && user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [token, user, fetchUnreadCount]);

  const value = {
    unreadCount,
    setUnreadCount,
    fetchUnreadCount,
    isLoading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = (newCount) => {
    setUnreadCount(newCount);
  };

  const decrementUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchUnreadCount();

    if (user) {
      // Set up interval to refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    unreadCount,
    loading,
    fetchUnreadCount,
    updateUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
