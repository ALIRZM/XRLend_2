import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import BottomNav from "../components/BottomNav";
import Shell from "../components/Shell";
import TopBar from "../components/TopBar";
import {
  BTN,
  BTN_ALT,
  CARD,
  ERRBOX,
  FIELD,
  H2,
  MUTED,
  OKBOX,
  PAGE,
  TITLE,
} from "../components/ui";

const FILTERS = [
  { value: "", label: "All" },
  { value: "student", label: "Students" },
  { value: "technician", label: "Technicians" },
];
const ROLES = ["student", "technician"];
const EMPTY_FORM = { name: "", email: "", password: "", role: "student" };
// A user with a plus sign, drawn like the icons in the bottom nav
const UserPlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
    <path d="M19 8v6M16 11h6" />
  </svg>
);
// Same colours and shape as the main buttons, only smaller so it fits in the top bar
const ADD_BTN =
  "flex items-center gap-1.5 shrink-0 bg-[#04000b] rounded-xl px-3.5 py-2 text-white text-base font-medium leading-6";

// XRH-4, XRH-6, XRH-7: the admin landing page. An admin sees every student and
// technician, or only one role. The server does the filtering.
// XRH-11, XRH-13, XRH-14: an admin can add a user from a sheet on this page.
const Users = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axiosInstance
      .get("/api/users", { params: role ? { role } : {} })
      .then(({ data }) => setUsers(data))
      .catch((err) => {
        setUsers([]);
        setError(err.response?.data?.message || "Could not load the users");
      })
      .finally(() => setLoading(false));
  }, [role, reloadKey]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreateError("");
    setCreating(true);
  };

  const create = async (e) => {
    e.preventDefault();
    setCreateError("");
    try {
      const { data } = await axiosInstance.post("/api/users", form);
      setCreating(false);
      setError("");
      setNotice(`${data.name} was created.`);
      // Ask the server for the list again so the new user shows up in the right place
      setReloadKey((key) => key + 1);
    } catch (err) {
      // For example 400 when the email is already used
      setCreateError(
        err.response?.data?.message || "Could not create the user",
      );
    }
  };

  return (
    <Shell>
      <TopBar
        title="Users"
        action={
          <button type="button" onClick={openCreate} className={ADD_BTN}>
            <UserPlusIcon />
            Add user
          </button>
        }
      />
      <div className={PAGE}>
        {error && (
          <div className={ERRBOX} role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className={OKBOX} role="status">
            {notice}
          </div>
        )}

        <div className="flex w-full bg-white rounded-2xl">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setRole(f.value)}
              aria-pressed={role === f.value}
              className={`flex-1 h-[46px] rounded-2xl px-2 text-base text-center ${
                role === f.value
                  ? "bg-[#343434] text-white"
                  : "bg-white text-[#667085]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* No record message */}
        {!loading && !error && users.length === 0 && (
          <p className={`${MUTED} self-start`}>
            {role ? "No users match this filter." : "No users found."}
          </p>
        )}

        {users.map((u) => (
          <div key={u._id} className={`${CARD} flex items-center gap-2.5`}>
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
              <span className={TITLE}>{u.name}</span>
              <span className={`${MUTED} break-all`}>{u.email}</span>
            </div>
            <div className="bg-[#e7f2eb] rounded-lg px-3 py-[3px]">
              <span className="text-[#1c6440] text-base text-center capitalize">
                {u.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* The create user modal */}
      {creating && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40">
          <form
            onSubmit={create}
            className="w-[390px] bg-white rounded-t-[15px] px-[15px] py-[11px] flex flex-col gap-[11px]"
          >
            <h2 className={H2}>Add a user</h2>
            {createError && (
              <div className={ERRBOX} role="alert">
                {createError}
              </div>
            )}
            <input
              className={FIELD}
              required
              placeholder="Full name"
              value={form.name}
              onChange={set("name")}
            />
            <input
              className={FIELD}
              type="email"
              required
              placeholder="University email"
              value={form.email}
              onChange={set("email")}
            />
            <input
              className={FIELD}
              type="password"
              required
              autoComplete="new-password"
              placeholder="Password"
              value={form.password}
              onChange={set("password")}
            />
            <div className="flex w-full rounded-2xl border border-solid border-[#cdcdcd] bg-white">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  aria-pressed={form.role === r}
                  className={`flex-1 h-[46px] rounded-2xl px-2 text-base text-center capitalize ${
                    form.role === r
                      ? "bg-[#343434] text-white"
                      : "bg-white text-[#667085]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button type="submit" className={BTN}>
              Create user
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className={BTN_ALT}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
      <BottomNav />
    </Shell>
  );
};
export default Users;
