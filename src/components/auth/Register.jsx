import React, { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../../api/auth";
import { useTranslation } from "react-i18next";

function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    passwordsMatch: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limit phone number to 11 digits
    if (name === "phone" && value.length > 11) {
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError("");

    // Real-time password validation
    if (name === "password") {
      setPasswordValidation({
        minLength: value.length >= 8 && /^[a-zA-Z0-9]+$/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasUppercase: /[A-Z]/.test(value),
        passwordsMatch: value === formData.password_confirmation && value !== "",
      });
    }
    
    // Check password confirmation match
    if (name === "password_confirmation") {
      setPasswordValidation(prev => ({
        ...prev,
        passwordsMatch: value === formData.password && value !== "",
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t("auth.register.validation.fullNameRequired"));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t("auth.register.validation.emailRequired"));
      return false;
    }
    if (!formData.email.includes("@")) {
      setError(t("auth.register.validation.validEmail"));
      return false;
    }
    if (!formData.phone || formData.phone.length < 11) {
      setError("Phone number must be exactly 11 digits");
      return false;
    }
    if (!formData.password) {
      setError(t("auth.register.validation.passwordRequired"));
      return false;
    }
    if (formData.password.length < 8 || !/^[a-zA-Z0-9]+$/.test(formData.password)) {
      setError("Password must be at least 8 characters and contain only letters and numbers");
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setError(t("auth.register.validation.passwordsNotMatch"));
      return false;
    }
    if (!formData.gender) {
      setError(t("auth.register.validation.genderRequired"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-[400px] md:max-w-[430px] w-full p-[30px] rounded-lg bg-white dark:bg-gray-700 shadow-xl border border-gray-200 dark:border-gray-600">
        <div className="w-full text-center">
          <div className="text-green-600 dark:text-green-400 text-6xl mb-4">✓</div>
          <header className="text-[28px] font-semibold text-gray-800 dark:text-white mb-4">
            {t("auth.register.success.title")}
          </header>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t("auth.register.success.description")}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {t("auth.register.success.note")}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Link
              to="/auth/login"
              className="text-primary dark:text-primary cursor-pointer no-underline hover:underline login-link font-semibold"
            >
              {t("auth.register.success.goToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[400px] md:max-w-[430px] w-full p-[30px] rounded-lg bg-white dark:bg-gray-700 shadow-xl border border-gray-200 dark:border-gray-600">
      <div className="w-full">
        <header className="text-[28px] font-semibold text-gray-800 dark:text-white text-center">
          {t("auth.register.title")}
        </header>
        {error && (
          <div className="text-red-500 text-center mt-2 text-sm">{error}</div>
        )}
        <form className="mt-[30px]" onSubmit={handleSubmit}>
          <div className="relative h-[50px] w-full mt-[20px] rounded-md">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("auth.register.fullName")}
              className="h-full w-full text-base font-normal rounded-md outline-none px-[15px] border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:border-primary dark:focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="relative h-[50px] w-full mt-[20px] rounded-md">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("auth.register.email")}
              className="h-full w-full text-base font-normal rounded-md outline-none px-[15px] border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:border-primary dark:focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="relative h-[50px] w-full mt-[20px] rounded-md">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setShowPasswordValidation(true)}
              onBlur={() => setShowPasswordValidation(false)}
              placeholder={t("auth.register.createPassword")}
              className="password h-full w-full text-base font-normal rounded-md outline-none px-[15px] pr-[45px] border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:border-primary dark:focus:border-primary transition-colors"
              required
            />
            <i 
              className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} eye-icon absolute top-1/2 right-[10px] transform -translate-y-1/2 text-[18px] text-gray-500 dark:text-gray-400 cursor-pointer p-[5px] hover:text-primary transition-colors`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          {/* Password Validation Feedback */}
          {formData.password && showPasswordValidation && (
            <div className="mt-2 space-y-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("auth.register.passwordRequirements") || "Password Requirements:"}
              </div>
              <div className={`flex items-center gap-2 transition-colors ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="text-lg">{passwordValidation.minLength ? '✅' : '○'}</span>
                <span>At least 8 characters (letters and numbers only)</span>
              </div>
              <div className={`flex items-center gap-2 transition-colors ${passwordValidation.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="text-lg">{passwordValidation.hasLowercase ? '✅' : '○'}</span>
                <span>At least one lowercase letter</span>
              </div>
              <div className={`flex items-center gap-2 transition-colors ${passwordValidation.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="text-lg">{passwordValidation.hasUppercase ? '✅' : '○'}</span>
                <span>At least one uppercase letter</span>
              </div>
            </div>
          )}

          <div className="relative h-[50px] w-full mt-[20px] rounded-md">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder={t("auth.register.confirmPassword")}
              className="password h-full w-full text-base font-normal rounded-md outline-none px-[15px] pr-[45px] border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:border-primary dark:focus:border-primary transition-colors"
              required
            />
            <i 
              className={`bx ${showConfirmPassword ? 'bx-show' : 'bx-hide'} eye-icon absolute top-1/2 right-[10px] transform -translate-y-1/2 text-[18px] text-gray-500 dark:text-gray-400 cursor-pointer p-[5px] hover:text-primary transition-colors`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            ></i>
          </div>

          {/* Password Match Indicator */}
          {formData.password_confirmation && (
            <div className="mt-2">
              <div className={`flex items-center gap-2 text-sm transition-colors ${passwordValidation.passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                <span className="text-lg">{passwordValidation.passwordsMatch ? '✅' : '✗'}</span>
                <span>{passwordValidation.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            </div>
          )}

          <div className="relative h-[50px] w-full mt-[20px] rounded-md">
            <input
              type="tel"
              name="phone"
              maxLength="11"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("auth.register.phone")}
              className="h-full w-full text-base font-normal rounded-md outline-none px-[15px] border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:border-primary dark:focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="flex items-center gap-4 mt-[20px]">
            <label className="text-base font-normal text-gray-700 dark:text-gray-300">
              {t("auth.register.gender")}:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="accent-primary"
                  required
                />
                {t("auth.register.male")}
              </label>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="accent-primary"
                  required
                />
                {t("auth.register.female")}
              </label>
            </div>
          </div>

          <div className="relative h-[50px] w-full mt-[20px] rounded-md">
            <button
              type="submit"
              disabled={loading}
              className={`h-full w-full border-none text-base font-normal rounded-md text-white transition-all duration-300 ease-in-out cursor-pointer ${
                loading
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
              }`}
            >
              {loading
                ? t("auth.register.creatingAccount")
                : t("auth.register.signupButton")}
            </button>
          </div>
        </form>

        <div className="text-center mt-[10px]">
          <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
            {t("auth.register.alreadyHaveAccount")}{" "}
            <Link
              to="/auth/login"
              className="text-primary dark:text-primary cursor-pointer no-underline hover:underline login-link font-semibold"
            >
              {t("auth.register.login")}
            </Link>
          </span>
        </div>
      </div>

      {/* 
      <div className="relative h-[1px] w-full my-[36px] bg-[#d4d4d4]">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-[#8b8b8b] px-[15px]">
          {t("auth.login.or")}
      </div>
      </div>

      <div className="w-full">
        <a
          href="#"
          className="flex items-center justify-center text-white bg-[#4267b2] h-[50px] w-full rounded-md relative"
        >
          <img
            src={facebookImg}
            alt=""
            className="absolute top-1/2 left-[15px] transform -translate-y-1/2 h-[20px] w-[20px] object-cover"
          />
          <span>{t("auth.register.signupWithFacebook")}</span>
        </a>
      </div>

      <div className="w-full mt-4">
        <a
          href="#"
          className="flex items-center justify-center border border-solid border-[#CACACA] h-[50px] w-full rounded-md relative"
        >
          <img
            src={GoogleImg}
            alt="Google"
            className="absolute top-1/2 left-[15px] transform -translate-y-1/2 h-[20px] w-[20px] object-cover"
          />
          <span className="font-medium opacity-60 text-[#232836]">
            {t("auth.register.signupWithGoogle")}
          </span>
        </a>
      </div> 
      */}
    </div>
  );
}

export default Register;