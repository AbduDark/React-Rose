import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import studyImage from "../../assets/images/study.svg";

const Login = () => {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isRTL = i18n.language === 'ar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message?.en || t("auth.login.loginFailed"));
      }
    } catch (error) {
      setError(error.message || t("auth.login.loginFailed"));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className={`flex flex-col lg:flex-row items-center gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
        {/* Form Section */}
        <div className="w-full lg:w-1/2">
          <div className="w-full max-w-[450px] mx-auto p-8 rounded-lg bg-white dark:bg-gray-700 shadow-xl border border-gray-200 dark:border-gray-600">
            <div className="w-full">
              <header className="text-3xl font-semibold text-gray-800 dark:text-white text-center mb-8">
                {t("auth.login.title")}
              </header>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative h-12 w-full">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder={t("auth.login.email")}
                    className="h-full w-full text-base font-normal rounded-md outline-none px-4 border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:border-primary dark:focus:border-primary transition-colors"
                  />
                </div>

                <div className="relative h-12 w-full">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.login.password")}
                    className="password h-full w-full text-base font-normal rounded-md outline-none px-4 pr-12 border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:border-primary dark:focus:border-primary transition-colors"
                  />
                  <i 
                    className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} eye-icon absolute top-1/2 ${isRTL ? 'left-3' : 'right-3'} transform -translate-y-1/2 text-xl text-gray-500 dark:text-gray-400 cursor-pointer p-1 hover:text-primary transition-colors`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>

                <div className="text-center">
                  <Link
                    to="/auth/forgot-password"
                    className="text-primary text-sm font-normal no-underline hover:underline"
                  >
                    {t("auth.login.forgotPassword")}
                  </Link>
                </div>

                {error && (
                  <div className="mt-4 text-red-500 text-sm text-center">{error}</div>
                )}

                <div className="relative h-12 w-full">
                  <button
                    type="submit"
                    className="h-full w-full border-none text-base font-medium rounded-md text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
                  >
                    {t("auth.login.loginButton")}
                  </button>
                </div>
              </form>

              <div className="text-center mt-6">
                <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
                  {t("auth.login.noAccount")}{" "}
                  <Link
                    to="/auth/register"
                    className="text-primary dark:text-primary cursor-pointer no-underline hover:underline signup-link font-semibold"
                  >
                    {t("auth.login.signup")}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 hidden lg:flex items-center justify-center">
          <img 
            src={studyImage} 
            alt="Login illustration" 
            className="w-full max-w-md h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
