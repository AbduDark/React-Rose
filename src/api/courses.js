const API_BASE = import.meta.env.VITE_API_BASE;

// Helper: pick localized message with better fallback support
const getMessage = (data, lang = "en") => {
  if (!data) return null;
  
  // Handle direct string messages
  if (typeof data.message === "string") return data.message;
  
  // Handle localized message objects
  if (typeof data.message === "object" && data.message !== null) {
    const message = data.message[lang] || data.message.ar || data.message.en || Object.values(data.message)[0];
    return typeof message === "string" ? message : JSON.stringify(message);
  }
  
  // Handle error messages
  if (data.error) {
    if (typeof data.error === "string") return data.error;
    if (typeof data.error === "object" && data.error !== null) {
      const error = data.error[lang] || data.error.ar || data.error.en || Object.values(data.error)[0];
      return typeof error === "string" ? error : JSON.stringify(error);
    }
  }
  
  // Handle validation errors
  if (data.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors)[0];
    if (Array.isArray(firstError)) {
      return firstError[0];
    }
    return typeof firstError === "string" ? firstError : JSON.stringify(firstError);
  }
  
  return null;
};

// Helper: extract success message from response
const getSuccessMessage = (data, lang = "en") => {
  if (!data) return null;
  
  // Check for success message in response
  if (data.message) {
    if (typeof data.message === "string") return data.message;
    if (typeof data.message === "object") {
      return data.message[lang] || data.message.ar || data.message.en || Object.values(data.message)[0];
    }
  }
  
  return null;
};

// Fetch wrapper with i18n error handling
const fetchJson = async (url, options = {}, lang = "en") => {
  // Add language header to request
  const headers = {
    'Accept-Language': lang,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(`Server error (${res.status}): ${text.substring(0, 200)}`);
  }

  if (!res.ok) {
    const message = getMessage(data, lang) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
};

// Courses
export const getCourses = (page = 1, perPage = 6, lang = "en") =>
  fetchJson(`${API_BASE}/courses?page=${page}&per_page=${perPage}`, {}, lang);

export const getCourseById = (id, lang = "en") =>
  fetchJson(`${API_BASE}/courses/${id}`, {}, lang);

// Admin course endpoints
export const createAdminCourse = async (courseData, token, lang = "en") => {
  const formData = new FormData();

  const toIsActiveInt = (value) => {
    if (value === 1 || value === "1" || value === true || value === "true")
      return 1;
    if (value === 0 || value === "0" || value === false || value === "false")
      return 0;
    return value ? 1 : 0;
  };

  if (courseData.title) formData.append("title", String(courseData.title));
  if (courseData.description)
    formData.append("description", String(courseData.description));
  if (courseData.price != null) {
    const priceNum = parseFloat(courseData.price);
    formData.append(
      "price",
      isNaN(priceNum) ? String(courseData.price) : String(priceNum)
    );
  }
  if (courseData.grade) formData.append("grade", String(courseData.grade));
  if (courseData.image) formData.append("image", courseData.image);
  if (courseData.is_active != null)
    formData.append("is_active", String(toIsActiveInt(courseData.is_active)));

  const res = await fetch(`${API_BASE}/admin/courses`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": lang,
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
    throw new Error(`Server error (${res.status}): ${text.substring(0, 200)}`);
  }

  if (!res.ok) {
    const message = getMessage(data, lang) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  
  return {
    ...data,
    successMessage: getSuccessMessage(data, lang)
  };
};

export const updateAdminCourse = async (id, courseData, token, lang = "en") => {
  const formData = new FormData();

  const toIsActiveInt = (value) => {
    if (value === 1 || value === "1" || value === true || value === "true")
      return 1;
    if (value === 0 || value === "0" || value === false || value === "false")
      return 0;
    return value ? 1 : 0;
  };

  if (courseData.title) formData.append("title", String(courseData.title));
  if (courseData.description)
    formData.append("description", String(courseData.description));
  if (courseData.price != null) {
    const priceNum = parseFloat(courseData.price);
    formData.append(
      "price",
      isNaN(priceNum) ? String(courseData.price) : String(priceNum)
    );
  }
  if (courseData.grade) formData.append("grade", String(courseData.grade));
  if (courseData.image) formData.append("image", courseData.image);
  if (courseData.is_active != null)
    formData.append("is_active", String(toIsActiveInt(courseData.is_active)));

  const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Accept-Language": lang,
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
    throw new Error(`Server error (${res.status}): ${text.substring(0, 200)}`);
  }

  if (!res.ok) {
    const message = getMessage(data, lang) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  
  return {
    ...data,
    successMessage: getSuccessMessage(data, lang)
  };
};

export const deleteAdminCourse = (id, token, lang = "en") =>
  fetchJson(
    `${API_BASE}/admin/courses/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
    lang
  );

export const getCourseRatings = (courseId = 1, lang = "en") =>
  fetchJson(
    `${API_BASE}/courses/${courseId}/ratings`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
    lang
  );

export const RatingsCourse = async (id, rating, comment, token, lang = "en") => {
  if (!id || !rating || !comment || !token) {
    throw new Error(
      getMessage({ message: { en: "Missing fields", ar: "حقول ناقصة" } }, lang)
    );
  }

  if (rating < 1 || rating > 5) {
    throw new Error(
      getMessage(
        { message: { en: "Rating must be 1-5", ar: "التقييم يجب أن يكون بين 1 و 5" } },
        lang
      )
    );
  }

  if (comment.trim().length === 0) {
    throw new Error(
      getMessage(
        { message: { en: "Comment cannot be empty", ar: "التعليق لا يمكن أن يكون فارغًا" } },
        lang
      )
    );
  }

  const requestBody = {
    course_id: parseInt(id),
    rating: parseInt(rating),
    comment: comment.trim(),
  };

  return fetchJson(
    `${API_BASE}/ratings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    },
    lang
  );
};
