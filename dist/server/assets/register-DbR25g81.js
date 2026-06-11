import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { r as register } from "./router-DLih9N2T.js";
import "@tanstack/react-query";
import "lucide-react";
function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 4) {
      setError("Password should be at least 4 characters.");
      return;
    }
    try {
      register(name, email, password);
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      setError(err.message);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-md", children: /* @__PURE__ */ jsxs("div", { className: "glass-strong rounded-3xl p-8", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Create your account" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Free forever. Start practicing in seconds." }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsx(Field, { label: "Full name", value: name, onChange: setName }),
      /* @__PURE__ */ jsx(Field, { label: "Email", type: "email", value: email, onChange: setEmail }),
      /* @__PURE__ */ jsx(Field, { label: "Password", type: "password", value: password, onChange: setPassword }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsx("button", { className: "w-full rounded-xl px-4 py-3 btn-gradient btn-gradient-hover", children: "Create account" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-5 text-center text-sm text-muted-foreground", children: [
      "Already have an account? ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-[var(--brand-cyan)] hover:underline", children: "Login" })
    ] })
  ] }) });
}
function Field({
  label,
  type = "text",
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("span", { className: "mb-1.5 block text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("input", { type, value, onChange: (e) => onChange(e.target.value), required: true, className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none transition focus:border-[var(--brand-cyan)] focus:bg-white/10" })
  ] });
}
export {
  RegisterPage as component
};
