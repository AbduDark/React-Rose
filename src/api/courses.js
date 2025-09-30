const API_BASE = import.meta.env.VITE_API_BASE;

export const getCourses = async (page = 1, perPage = 6) => {
  const res = await fetch(
    `${API_BASE}/courses?page=${page}&per_page=${perPage}`
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch courses.");
  }

  return data;
};

export const getCourseById = async (id) => {
  const res = await fetch(`${API_BASE}/courses/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch course.");
  }

  return data;
};

// Admin course endpoints
export const createAdminCourse = async (courseData, token) => {
  const formData = new FormData();

  const toIsActiveInt = (value) => {
    if (value === 1 || value === "1") return 1;
    if (value === 0 || value === "0") return 0;
    if (value === true || value === "true") return 1;
    if (value === false || value === "false") return 0;
    return value ? 1 : 0;
  };

  if (courseData.title != null)
    formData.append("title", String(courseData.title));
  if (courseData.description != null)
    formData.append("description", String(courseData.description));
  if (courseData.price != null) {
    const priceNum = parseFloat(courseData.price);
    formData.append(
      "price",
      isNaN(priceNum) ? String(courseData.price) : String(priceNum)
    );
  }
  if (courseData.grade != null)
    formData.append("grade", String(courseData.grade));
  if (courseData.image) formData.append("image", courseData.image);
  if (courseData.is_active != null)
    formData.append("is_active", String(toIsActiveInt(courseData.is_active)));

  // Debug log of FormData keys (helps when diagnosing 500s)
  try {
    const sentKeys = [];
    for (const [k] of formData.entries()) sentKeys.push(k);
    console.log("[createAdminCourse] Sending fields:", sentKeys);
  } catch {}

  const res = await fetch(`${API_BASE}/admin/courses`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    const snippet = text.substring(0, 300).replace(/\n/g, " ");
    throw new Error(
      `Server error (${res.status}). Non-JSON response: ${snippet}`
    );
  }

  if (!res.ok) {
    let message =
      (data && (data.message || data.error)) || "Failed to create course.";
    if (data && data.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      const firstMsg = Array.isArray(data.errors[firstKey])
        ? data.errors[firstKey][0]
        : String(data.errors[firstKey]);
      message = `${firstKey}: ${firstMsg}`;
    }
    throw new Error(`(${res.status}) ${message}`);
  }

  return data;
};

export const updateAdminCourse = async (id, courseData, token) => {
  const formData = new FormData();

  const toIsActiveInt = (value) => {
    if (value === 1 || value === "1") return 1;
    if (value === 0 || value === "0") return 0;
    if (value === true || value === "true") return 1;
    if (value === false || value === "false") return 0;
    return value ? 1 : 0;
  };

  if (courseData.title != null)
    formData.append("title", String(courseData.title));
  if (courseData.description != null)
    formData.append("description", String(courseData.description));
  if (courseData.price != null) {
    const priceNum = parseFloat(courseData.price);
    formData.append(
      "price",
      isNaN(priceNum) ? String(courseData.price) : String(priceNum)
    );
  }
  if (courseData.grade != null)
    formData.append("grade", String(courseData.grade));
  if (courseData.image) formData.append("image", courseData.image);
  if (courseData.is_active != null)
    formData.append("is_active", String(toIsActiveInt(courseData.is_active)));

  try {
    const sentKeys = [];
    for (const [k] of formData.entries()) sentKeys.push(k);
    console.log("[updateAdminCourse] Sending fields:", sentKeys);
  } catch {}

  const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    const snippet = text.substring(0, 300).replace(/\n/g, " ");
    throw new Error(
      `Server error (${res.status}). Non-JSON response: ${snippet}`
    );
  }

  if (!res.ok) {
    let message =
      (data && (data.message || data.error)) || "Failed to update course.";
    if (data && data.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      const firstMsg = Array.isArray(data.errors[firstKey])
        ? data.errors[firstKey][0]
        : String(data.errors[firstKey]);
      message = `${firstKey}: ${firstMsg}`;
    }
    throw new Error(`(${res.status}) ${message}`);
  }

  return data;
};

export const deleteAdminCourse = async (id, token) => {
  const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message.ar || "Failed to delete course.");
  }

  return { message: "Course deleted successfully." };
};

export const getCourseRatings = async (courseId = 1) => {
  const res = await fetch(`${API_BASE}/courses/${courseId}/ratings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch course ratings.");
  }
  return data;
};

export const RatingsCourse = async (id, rating, comment, token) => {
  if (!id || !rating || !comment || !token) {
    throw new Error(
      "Missing required fields: course_id, rating, comment, or token"
    );
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (comment.trim().length === 0) {
    throw new Error("Comment cannot be empty");
  }

  const requestBody = {
    course_id: parseInt(id),
    rating: parseInt(rating),
    comment: comment.trim(),
  };

  const res = await fetch(`${API_BASE}/ratings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
  const contentType = res.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const htmlText = await res.text();
    const errorSnippet = htmlText.substring(0, 200).replace(/\n/g, " ");
    console.error("Server returned HTML instead of JSON:", {
      status: res.status,
      statusText: res.statusText,
      contentType: contentType,
      htmlSnippet: errorSnippet,
    });
    throw new Error(
      `Server error (${res.status}): Received HTML response instead of JSON. This usually means authentication failed or the endpoint doesn't exist.`
    );
  }

  if (!res.ok) {
    console.error("Rating submission failed:", {
      status: res.status,
      statusText: res.statusText,
      data: data,
    });
    if (res.status === 401) {
      throw new Error("Unauthenticated. Please log in again.");
    }
    const serverMessage =
      (data && typeof data.message === "string" && data.message) ||
      (data && typeof data.error === "string" && data.error) ||
      (data ? JSON.stringify(data) : "Failed to rate course.");
    throw new Error(serverMessage);
  }

  return data;
};
