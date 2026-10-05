// 墨韵中文 登录/注册页面
// ============================================================
//
// 最简单可用的认证入口,视觉风格与现有学习模块一致:
//   - 米色背景 (#FAF8F5 / paper-texture)
//   - 红色主色 (#B83A2D)
//   - 衬线字体 (font-serif-sc)
//
// 功能:
//   - 切换 登录 / 注册
//   - 用户名 / 密码 (注册可选 昵称)
//   - 加载状态 (pending)
//   - 错误信息显示 (后端 message)
//   - 注册成功后切换到登录 Tab

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type AuthMode = "login" | "register";

export const AuthPage: React.FC = () => {
  const { login, register, pending, error, clearError } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [registerOk, setRegisterOk] = useState<string | null>(null);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    clearError();
    setLocalError(null);
    setRegisterOk(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setRegisterOk(null);

    if (!username.trim()) {
      setLocalError("请输入用户名");
      return;
    }
    if (!password) {
      setLocalError("请输入密码");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setLocalError("密码至少需要 6 个字符");
      return;
    }
    if (mode === "register" && username.trim().length < 3) {
      setLocalError("用户名长度必须为 3-50 个字符");
      return;
    }

    try {
      if (mode === "register") {
        await register({
          username: username.trim(),
          password,
          nickname: nickname.trim() || undefined,
        });
        setRegisterOk("注册成功,请使用新账号登录");
        // 注册成功后自动切到登录 Tab,保留用户名
        setMode("login");
        setPassword("");
        setNickname("");
      } else {
        await login({
          username: username.trim(),
          password,
        });
        // 登录成功后 App 会自动切换到学习首页 (由 isAuthenticated 控制)
      }
    } catch {
      // 错误信息已由 AuthContext 写入 error 状态
      // 此处不需要重复设置
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] paper-texture px-4 py-8">
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif-sc text-[#24292E]">
            墨韵中文
          </h1>
          <p className="text-sm text-[#57606A] mt-2 font-serif-sc">
            全学段语文素养研习平台
          </p>
        </div>

        {/* 卡片 */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#E6E1D8] rounded-lg shadow-sm p-6 sm:p-8">
          {/* Tab 切换 */}
          <div className="flex border-b border-[#E6E1D8] mb-6">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "text-[#B83A2D] border-b-2 border-[#B83A2D] -mb-px"
                  : "text-[#57606A] hover:text-[#24292E]"
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "text-[#B83A2D] border-b-2 border-[#B83A2D] -mb-px"
                  : "text-[#57606A] hover:text-[#24292E]"
              }`}
            >
              注册
            </button>
          </div>

          {/* 成功提示 */}
          {registerOk && mode === "login" && (
            <div className="mb-4 px-3 py-2 rounded border border-[#B83A2D]/30 bg-[#B83A2D]/5 text-sm text-[#B83A2D]">
              {registerOk}
            </div>
          )}

          {/* 错误提示 */}
          {displayError && (
            <div className="mb-4 px-3 py-2 rounded border border-red-200 bg-red-50 text-sm text-red-700">
              {displayError}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-username"
                className="block text-sm font-medium text-[#24292E] mb-1"
              >
                用户名
              </label>
              <input
                id="auth-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={pending}
                placeholder="3-50 个字符"
                className="w-full px-3 py-2 border border-[#E6E1D8] rounded bg-white text-[#24292E] text-sm focus:outline-none focus:border-[#B83A2D] focus:ring-1 focus:ring-[#B83A2D] disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {mode === "register" && (
              <div>
                <label
                  htmlFor="auth-nickname"
                  className="block text-sm font-medium text-[#24292E] mb-1"
                >
                  昵称 (可选)
                </label>
                <input
                  id="auth-nickname"
                  type="text"
                  autoComplete="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={pending}
                  placeholder="留空将使用用户名"
                  className="w-full px-3 py-2 border border-[#E6E1D8] rounded bg-white text-[#24292E] text-sm focus:outline-none focus:border-[#B83A2D] focus:ring-1 focus:ring-[#B83A2D] disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-medium text-[#24292E] mb-1"
              >
                密码
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                placeholder={mode === "register" ? "至少 6 个字符" : "请输入密码"}
                className="w-full px-3 py-2 border border-[#E6E1D8] rounded bg-white text-[#24292E] text-sm focus:outline-none focus:border-[#B83A2D] focus:ring-1 focus:ring-[#B83A2D] disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 px-4 bg-[#B83A2D] hover:bg-[#9F2E22] text-white text-sm font-medium rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {pending
                ? mode === "login"
                  ? "登录中..."
                  : "注册中..."
                : mode === "login"
                  ? "登录"
                  : "注册"}
            </button>
          </form>

          {/* 切换提示 */}
          <div className="mt-4 text-center text-xs text-[#57606A]">
            {mode === "login" ? (
              <>
                还没有账号?
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="ml-1 text-[#B83A2D] hover:underline"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号?
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="ml-1 text-[#B83A2D] hover:underline"
                >
                  返回登录
                </button>
              </>
            )}
          </div>
        </div>

        {/* 底部署名 */}
        <div className="text-center text-xs text-[#8C8273] mt-6 font-serif-sc">
          "博观而约取，厚积而薄发。"
        </div>
      </div>
    </div>
  );
};
