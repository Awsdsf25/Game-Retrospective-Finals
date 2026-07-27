// client/src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", formData);
      login(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-md py-xl">
      {/* Background Montage[cite: 2] */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 z-10 game-art-overlay"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 opacity-30 grayscale transition-all duration-700 h-full">
          <div
            className="aspect-[2/3] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAzfI9HGDPibKkXGTKS4foY35xTS0PsEwjxia1bPDZlBOrgSTkIVVtq9Q7aoFVAePchVfBvlY0zCi84YI0ZmS9A7EVWw6Z0GhY5dQ7QtVROpfo6TuTaEiyYt1ic-fVXP3dsCo3CBSXCKrbb_4mjlXr_8I8QGW4DdRg64x6nQDV7FDttzYLOqpJIQ5gX9rneFgRRYQsk_LO_m0WrkHJibWUmAfWvmZ3ALom-bqnGQrhPvKQ5GpYjjqVeQxYz9cDPFp-EBh0UYoehVqA')",
            }}
          ></div>
          <div
            className="aspect-[2/3] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3T77FcsrjbhaQJLhmHnKlGL9rpEdxCdeYp5HtXJJ9c_r65zqpI3uENYObElKIuMmVwXjTvpMsK8mSEkVEOQh5sb18om-oQTzWkm9za1FIcWZws5x4H0L_hhAoZAm8PD8dwmHdE2tcGqkzT46L0g_o7kLA-Kjda3sCs6qkFa4P1ejcg8lZ32cxFz3gYjlcdhelth_3Y9l5d8oeT9yNx0d0suFVuk3vykg6rWsHxPqM3LTP5_nDUOtRZ6XxZLRak32Ep6e7Vd5a9Uw')",
            }}
          ></div>
          <div
            className="aspect-[2/3] bg-cover bg-center hidden md:block"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZG01yXMJtoC26VRqRL-Ktp45tNjoIjqigOuSyk94HSBySciM6go2pQMRUnzHCPz1fqegmYPtN2oWQ6HgwbyT2tG4sFOpuqGeZtSi9yt6K5PI69oq68vhfqcnDFXoK_8scwWl-CITfwH0gtbDBbAi1IOSilA1GlMMPUtmamDaHjQwh5SwkieeH_qiADJUhgjGR2cSlLbMRbkpf0SuomV8AGnDMIqgjo-BSKlnCpKVTkHPQpB67V0DZl10QmftyV8dn2tFEcXNjm60')",
            }}
          ></div>
          <div
            className="aspect-[2/3] bg-cover bg-center hidden md:block"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjBHWhHtWHulMKe6LFihQQWgwv43vkc6bOU6tpmBUI9w-dQeKhn1wbz3UIc701RWKq6QFoH8Is2NXmHGroKf3edmI32q3TNwDAq2EU3yXq-MDHcqUFXUjaNZ6lKaCRa61st_nE3iZmRJdaUAAta9DztAjVoz6z9SQq19oDP9AZeHebk_PcZJJopDYLsNe_0Y4jL13A7tHFI9cfSTbWN3MJZb6jfe6P86ti8x4NpWsJlmADnURxuiy0BVXAG8yHHLZ1BCAI7iJSYt8')",
            }}
          ></div>
          <div
            className="aspect-[2/3] bg-cover bg-center hidden lg:block"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDWAivD_-p02YoaS1jN7q3kloMc26Fper8W6O2ukt8PbAseHSZV4ggycgsHqi2bSlsKAbAqeeiM80vR3m6GmBFmn-9nqp_jRnnEFhqS032i5h_06X5LQnIPBbqRF1U04Q0wNj_ejkm3u-ilX5dmUW6LboAuQsnQK5elmC0sXQGZ8XV02ddZHDZy_7RKMmlMqQgvdDJ9Agap6oOHTgy7oQF_mCDYqyMUwbsukS6hx4TqGp1dnc711zBFW6AxfLMF_pkn3gZFbD65obQ')",
            }}
          ></div>
          <div
            className="aspect-[2/3] bg-cover bg-center hidden lg:block"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD2N7mWt8xvfdQi3TvboU_T_nv0gErQaiGgiQwioEB6Quj3IMuW8wf937WKLc6Y-kvQT_ox6o0y4JF0fQPnjcdlc4WslltpSg429wqay75Dz45o17tyov91ImbxLEq5SrzxjW0oUxr9M96fRySyCpzcyMBqs2cMd2TfYDjXkNsb5foPxB-UzQdxu_Lxus23atop9f_bgUuPhib1L_bjFBFQvJs4XJ47lOWynK5hQIMs5z5-6I8Mm1bSeDlcuxuH0bgt46wUoWWLx_k')",
            }}
          ></div>
        </div>
      </div>

      <main className="relative z-20 w-full max-w-[440px] flex flex-col items-center">
        {/* Brand Identity[cite: 2] */}
        <div className="mb-lg text-center">
          <h1 className="font-display text-[48px] font-bold text-primary tracking-tighter mb-xs">
            QuestLog
          </h1>
          <p className="font-label-md text-[14px] text-on-surface-variant uppercase tracking-[0.2em]">
            The Archive of Legends
          </p>
        </div>

        {/* Login Card[cite: 2] */}
        <div className="w-full glass-panel rounded-xl p-md md:p-lg flex flex-col gap-md shadow-2xl">
          <div className="text-center md:text-left">
            <h2 className="font-display text-[24px] font-semibold text-on-surface">
              Welcome Back
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Continue your chronicle.
            </p>
          </div>

          {error && (
            <p className="text-red-400 bg-red-900/30 p-2 rounded text-sm">
              {error}
            </p>
          )}

          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-outline px-xs">
                USERNAME
              </label>
              <div className="relative group duration-200">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  person
                </span>
                <input
                  type="text"
                  name="username"
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-outline/50 input-focus-effect transition-all"
                  placeholder="ArisenHunter99"
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center px-xs">
                <label className="font-label-sm text-outline">PASSWORD</label>
                <Link
                  to="/forgot-password"
                  className="font-label-sm text-primary hover:text-[#a078ff] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-outline/50 input-focus-effect transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-lg vapor-shadow vapor-shadow-active active:scale-[0.98] transition-all duration-200 mt-base"
            >
              SIGN IN
            </button>
          </form>

          <p className="text-center font-body-md text-on-surface-variant mt-sm">
            New to the Archive?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
