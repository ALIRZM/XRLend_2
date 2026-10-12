import { useNavigate } from "react-router-dom";

const TopBar = ({ title, role, back = false, action }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-white border border-solid border-black px-4 py-3">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {back && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="text-black text-xl leading-none"
            >
              &#8249;
            </button>
          )}
          <h1 className="text-black text-xl font-semibold tracking-[3.00px] leading-[56px] whitespace-nowrap">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {role && (
            <div className="bg-[#e7f2eb] rounded-lg px-3 py-[3px]">
              <span className="text-[#1c6440] text-base text-center capitalize">
                {role}
              </span>
            </div>
          )}
          {action}
        </div>
      </div>
    </div>
  );
};
export default TopBar;
