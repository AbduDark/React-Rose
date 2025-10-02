const API_BASE = import.meta.env.VITE_API_BASE;

export const addToFavorites = async (token, courseId) => {
  try {
    const res = await fetch(`${API_BASE}/favorite/${courseId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (token, courseId) => {
  try {
    const res = await fetch(`${API_BASE}/favorite/${courseId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const getFavoriteSubscriptions = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching favorite subscriptions:", error);
    throw error;
  }
};

export const checkIfFavorite = async (token, courseId) => {
  try {
    const favorites = await getFavoriteSubscriptions(token);
    const favoriteCourseIds = favorites?.data?.subscriptions?.map(sub => sub.course_id) || [];
    return favoriteCourseIds.includes(courseId);
  } catch (error) {
    console.error("Error checking if course is favorite:", error);
    return false;
  }
};

export const toggleFavorite = async (token, courseId, isFavorite) => {
  try {
    if (isFavorite) {
      return await removeFromFavorites(token, courseId);
    } else {
      return await addToFavorites(token, courseId);
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};
