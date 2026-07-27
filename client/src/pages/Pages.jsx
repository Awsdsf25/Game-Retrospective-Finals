// client/src/pages/Landing.jsx
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  const glowRef = useRef(null);

  // Subtle mouse tracking for ambient glow[cite: 4]
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        glowRef.current.style.transform = `translate(calc(-50% + ${x * 40 - 20}px), calc(-50% + ${y * 40 - 20}px))`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md overflow-x-hidden">
      {/* TopNavBar[cite: 4] */}
      <nav className="bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-none fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-gutter max-w-container-max mx-auto h-20">
          <div className="font-display text-display text-primary tracking-tighter">
            QuestLog
          </div>
          <div className="hidden md:flex gap-lg items-center">
            <Link
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 active:scale-95"
              to="/discovery"
            >
              Discovery
            </Link>
            <Link
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 active:scale-95"
              to="/rankings"
            >
              Rankings
            </Link>
            <Link
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 active:scale-95"
              to="/community"
            >
              Community
            </Link>
          </div>
          <div className="flex items-center gap-md">
            {/* Added Login link to match your original Landing.jsx functionality */}
            <Link
              to="/login"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 active:scale-95 mr-4 hidden md:block"
            >
              Login
            </Link>

            <button className="text-on-surface hover:text-primary transition-colors duration-200 active:scale-95">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                search
              </span>
            </button>

            <Link
              to="/login"
              className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-outline-variant cursor-pointer hover:border-primary transition-colors"
            >
              <img
                alt="User profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB33_grVu_sq0f3OEkkWDJY86x3ml36DrY8_VpqPnZrTbTLbaTBaaFqswoDbNi4kBdxJs4iAApx3fOjJTFOrKYx-mjzXFG_74hujV9G7LjC51xT2Hq_SyD5odZ-NQSyP_VcOc90y43jj9-KH-UbyQHVU5WFVXQjQFHxKHZHAcFFzU8BwbTsLjoYnBn1n9Udaxpa5kSDGB_QVX3tMwrqD1v4TsEQ3IHp1gccVSpoH1E7kIPHkZtXsj7YEz8yXzfqKVJDZlvszjTjJZw"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content[cite: 4] */}
      <main className="flex-grow pt-32 pb-xl relative z-10 flex flex-col items-center">
        <div ref={glowRef} className="ambient-glow"></div>

        {/* Hero Section[cite: 4] */}
        <section className="w-full max-w-container-max mx-auto px-gutter min-h-[60vh] flex flex-col justify-center items-center text-center relative z-10 mb-xl">
          <h1 className="font-display text-display md:text-[72px] lg:text-[96px] text-on-surface tracking-tighter leading-tight mb-md">
            The Archive Awaits
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-lg">
            Curate your gaming legacy. Record your triumphs, analyze your
            journeys, and discover your next great adventure in a beautifully
            crafted retrospective space.
          </p>

          {/* Linked "Begin Your Journey" to your original /register route */}
          <Link
            to="/register"
            className="bg-primary text-on-primary font-label-md text-label-md px-lg py-md rounded-lg vapor-shadow hover:bg-primary-container transition-all active:scale-95 flex items-center gap-sm group"
          >
            Begin Your Journey
            <span
              className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              arrow_forward
            </span>
          </Link>
        </section>

        {/* Value Prop Cards[cite: 4] */}
        <section className="w-full max-w-container-max mx-auto px-gutter relative z-10 grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          <div className="glass-panel p-lg rounded-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-md border border-outline-variant">
              <span
                className="material-symbols-outlined text-primary text-headline-lg"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                history_edu
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
              Track
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Log every game you play. Build a comprehensive timeline of your
              digital life across all platforms and generations.
            </p>
          </div>

          <div className="glass-panel p-lg rounded-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-md border border-outline-variant">
              <span
                className="material-symbols-outlined text-primary text-headline-lg"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                rate_review
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
              Review
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Share your thoughts with depth. Score mechanics, narrative, and
              artistry to create your definitive critical archive.
            </p>
          </div>

          <div className="glass-panel p-lg rounded-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-md border border-outline-variant">
              <span
                className="material-symbols-outlined text-primary text-headline-lg"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                explore
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
              Discover
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Find hidden gems recommended by curators with similar tastes.
              Never wonder what to play next.
            </p>
          </div>
        </section>
      </main>

      {/* Footer[cite: 4] */}
      <footer className="bg-surface-dim dark:bg-surface-dim w-full py-xl border-t border-outline-variant relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-md">
          <div className="font-display text-label-md text-on-surface text-center md:text-left">
            QuestLog © 2026
          </div>
          <div className="flex gap-lg font-label-sm text-label-sm">
            <Link
              className="text-outline hover:text-primary transition-colors"
              to="/about"
            >
              About
            </Link>
            <Link
              className="text-outline hover:text-primary transition-colors"
              to="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-outline hover:text-primary transition-colors"
              to="/terms"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
