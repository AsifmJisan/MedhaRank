import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { d as login } from "./router-DLih9N2T.js";
import "@tanstack/react-query";
import "lucide-react";
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);
    try {
      login(email, password);
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      setError(err.message);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-md", children: /* @__PURE__ */ jsxs("div", { className: "glass-strong rounded-3xl p-8", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Welcome back" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Login to continue your prep journey." }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsx(Field, { label: "Email", type: "email", value: email, onChange: setEmail }),
      /* @__PURE__ */ jsx(Field, { label: "Password", type: "password", value: password, onChange: setPassword }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsx("button", { className: "w-full rounded-xl px-4 py-3 btn-gradient btn-gradient-hover", children: "Login" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-5 text-center text-sm text-muted-foreground", children: [
      "New here? ",
      /* @__PURE__ */ jsx(Link, { to: "/register", className: "text-[var(--brand-cyan)] hover:underline", children: "Create an account" })
    ] })
  ] }) });
}
function Field({
  label,
  type,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("span", { className: "mb-1.5 block text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("input", { type, value, onChange: (e) => onChange(e.target.value), required: true, className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none transition focus:border-[var(--brand-cyan)] focus:bg-white/10" })
  ] });
}
export {
  LoginPage as component
};
