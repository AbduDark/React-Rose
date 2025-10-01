const API_BASE = import.meta.env.VITE_API_BASE;

export const getMySubscriptions = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/my-subscriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
};

export const subscribeToCourse = async (token, subscriptionData) => {
  try {
    let body;
    let headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    // إذا كانت البيانات تحتوي على FormData أو ملف
    if (subscriptionData instanceof FormData) {
      body = subscriptionData;
      // لا نضع Content-Type للـ FormData
    } else if (subscriptionData.payment_proof instanceof File) {
      body = new FormData();
      Object.keys(subscriptionData).forEach(key => {
        body.append(key, subscriptionData[key]);
      });
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(subscriptionData);
    }

    const res = await fetch(`${API_BASE}/subscribe`, {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error subscribing to course:", error);
    throw error;
  }
};

export const cancelSubscription = async (token, subscriptionId) => {
  try {
    const res = await fetch(
      `${API_BASE}/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    return await res.json();
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
};

export const renewSubscription = async (token, renewalData) => {
  try {
    // Create FormData if payment proof is included
    let body;
    let headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    if (renewalData.payment_proof instanceof File) {
      body = new FormData();
      Object.keys(renewalData).forEach(key => {
        body.append(key, renewalData[key]);
      });
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(renewalData);
    }

    const res = await fetch(`${API_BASE}/subscriptions/renew`, {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    return await res.json();
  } catch (error) {
    console.error("Error renewing subscription:", error);
    throw error;
  }
};

// Get payment proof image
export const getPaymentProof = async (filename) => {
  try {
    const res = await fetch(`${API_BASE}/payment-proofs/${filename}`, {
      method: "GET",
      headers: {
        Accept: "image/*",
      },
    });

    if (!res.ok) {
      throw new Error("Payment proof not found");
    }

    return res.blob();
  } catch (error) {
    console.error("Error fetching payment proof:", error);
    throw error;
  }
};

export const getSubscriptionStatus = async (token, courseId) => {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/status/${courseId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }
    return await res.json();
  } catch (error) {
    console.error("Error getting subscription status:", error);
    throw error;
  }
};

export const getExpiredSubscriptions = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/expired-subscriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching expired subscriptions:", error);
    throw error;
  }
};

// Admin Subscription API Functions
export const getAllSubscriptions = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/admin/subscriptions/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching all subscriptions:", error);
    throw error;
  }
};

export const getPendingSubscriptions = async (token, page = 1) => {
  try {
    const res = await fetch(
      `${API_BASE}/admin/subscriptions/pending?page=${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching pending subscriptions:", error);
    throw error;
  }
};

export const approveSubscription = async (token, subscriptionId) => {
  try {
    const res = await fetch(
      `${API_BASE}/admin/subscriptions/${subscriptionId}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    return await res.json();
  } catch (error) {
    console.error("Error approving subscription:", error);
    throw error;
  }
};

export const rejectSubscription = async (token, subscriptionId) => {
  try {
    const res = await fetch(
      `${API_BASE}/admin/subscriptions/${subscriptionId}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    return await res.json();
  } catch (error) {
    console.error("Error rejecting subscription:", error);
    throw error;
  }
};
