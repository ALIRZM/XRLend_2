import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Shell from "../components/Shell";
import { BTN } from "../components/ui";

// first page
const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const start = () => {
    if (!user) return navigate("/login");
    navigate(
      user.role === "technician"
        ? "/lab"
        : user.role === "admin"
          ? "/admin/users"
          : "/home",
    );
  };

  return (
    <Shell>
      <div className="flex-1 mx-[17px] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <svg
            viewBox="0 0 24 24"
            className="w-16 h-16"
            fill="none"
            stroke="black"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 8c0-2.4 2.2-4 5-4s5 1.6 5 4" />
            <path d="M4 8h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-4a2 2 0 0 1-1.6-.8l-1.2-1.6a1.5 1.5 0 0 0-2.4 0l-1.2 1.6a2 2 0 0 1-1.6.8H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" />
            <circle cx="7.2" cy="12.2" r="1.6" />
            <circle cx="16.8" cy="12.2" r="1.6" />
          </svg>
          <h1 className="text-black text-[40px] font-semibold tracking-[-1.2px] leading-[48px]">
            XRLend
          </h1>
          <p className="text-[#667085] text-base font-medium tracking-[-0.48px] leading-6">
            Borrow an XR headset from the lab.
            <br />
            Pick your dates, send a request, collect it.
          </p>
        </div>

        <div className="flex flex-col gap-4 pb-10">
          <button type="button" onClick={start} className={BTN}>
            Get Started
          </button>
          {!user && (
            <p className="text-center text-[#98a2b3] text-base font-medium">
              New here?{" "}
              <Link to="/register" className="text-black">
                Create an account &rarr;
              </Link>
            </p>
          )}
        </div>
      </div>
    </Shell>
  );
};
export default Welcome;
