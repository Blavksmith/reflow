import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  X,
} from "lucide-react";
import { ReflowCharacter } from "../../components/ReflowCharacter";
import { useAuth } from "./AuthProvider";
import { cn } from "../../lib/utils";

type AuthMode = "sign-in" | "sign-up";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  trailing,
  inputRef,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  icon: typeof Mail;
  trailing?: ReactNode;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-bold uppercase leading-[1.3] tracking-[0.14em] text-ink-800"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <input
          id={id}
          ref={inputRef}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={id === "auth-password" ? "current-password" : id}
          className={cn(
            "h-12 w-full rounded-xl border border-[color:var(--theme-border)] bg-white px-3 pl-10 text-[14px] font-normal leading-[1.55] text-ink-950 outline-none placeholder:text-ink-400 transition-colors focus:border-sky-500 focus:ring-4 focus:ring-sky-100",
            trailing ? "pr-11" : "",
          )}
        />
        {trailing}
      </div>
    </div>
  );
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => emailRef.current?.focus());
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
    setShowPassword(false);
  }

  function validate() {
    if (mode === "sign-up" && !displayName.trim()) {
      return "Enter your name to create an account.";
    }
    if (!isValidEmail(email.trim())) {
      return "Enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const result =
      mode === "sign-in"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, displayName.trim());
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === "sign-up" && !result.data?.session) {
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("sign-in");
      return;
    }

    onClose();
  }

  const isSignIn = mode === "sign-in";

  return (
    <div className="auth-backdrop fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="auth-modal-shell relative my-auto grid max-h-[calc(100vh-32px)] w-full max-w-[840px] overflow-y-auto rounded-[24px] border border-[color:var(--theme-border)] bg-white shadow-soft md:grid-cols-[.78fr_1.22fr]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <section className="relative isolate hidden min-h-[560px] overflow-hidden bg-focus-card-blue p-8 md:flex md:flex-col">
          <div className="relative z-10 flex items-center gap-2">
            <ReflowCharacter size="small" variant="logo" className="h-10 w-10" />
            <span className="text-[18px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink-950">
              Reflow
            </span>
          </div>
          <div className="relative z-10 mt-16 max-w-[210px]">
            <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.04em] text-ink-950">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-3 text-[14px] font-normal leading-[1.55] text-ink-600">
              {isSignIn
                ? "Ready to get back into focus?"
                : "Start building a better focus habit."}
            </p>
          </div>
            <img
              src="/assets/Cheerful%20Blue%20Mascot%20Waving.png"
              alt=""
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-1
                left-1/2
                z-0
                h-auto
                w-[115%]
                max-w-none
                -translate-x-1/2
                object-contain
                object-bottom
              "
            />
        </section>

        <section className="relative p-6 sm:p-8">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="absolute right-5 top-5 rounded-xl p-2 text-ink-600 transition-colors hover:bg-sky-50 hover:text-ink-950 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          >
            <X size={18} />
          </button>

          <div
            className="mb-6 flex rounded-xl bg-sky-50 p-1"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isSignIn}
              onClick={() => switchMode("sign-in")}
              className={cn(
                "flex-1 rounded-xl px-3 py-2.5 text-[12px] font-medium leading-[1.4] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
                isSignIn
                  ? "bg-sky-100 text-sky-500 shadow-soft"
                  : "text-ink-600 hover:text-ink-950",
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isSignIn}
              onClick={() => switchMode("sign-up")}
              className={cn(
                "flex-1 rounded-xl px-3 py-2.5 text-[12px] font-medium leading-[1.4] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
                !isSignIn
                  ? "bg-sky-100 text-sky-500 shadow-soft"
                  : "text-ink-600 hover:text-ink-950",
              )}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6 md:hidden">
            <div className="flex items-center gap-2">
              <ReflowCharacter size="small" variant="logo" className="h-9 w-9" />
              <span className="text-[18px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink-950">
                Reflow
              </span>
            </div>
          </div>

          <div>
            <h1
              id="auth-modal-title"
              className="text-[34px] font-semibold leading-[1.15] tracking-[-0.04em] text-ink-950"
            >
              {isSignIn ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-[14px] font-normal leading-[1.55] text-ink-600">
              {isSignIn
                ? "Ready to get back into focus?"
                : "Start building a better focus habit."}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {!isSignIn && (
              <Field
                id="auth-name"
                label="Your name"
                value={displayName}
                onChange={setDisplayName}
                placeholder="Enter your name"
                icon={UserRound}
                type="text"
              />
            )}
            <Field
              id="auth-email"
              label="Email address"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
              icon={Mail}
              type="email"
              inputRef={emailRef}
            />
            <Field
              id="auth-password"
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder={isSignIn ? "Enter your password" : "Create a password"}
              icon={LockKeyhole}
              type={showPassword ? "text" : "password"}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-ink-400 transition-colors hover:bg-sky-50 hover:text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {isSignIn && (
              <div className="flex items-center justify-between gap-3 text-[12px] font-medium leading-[1.4]">
                <label className="flex items-center gap-2 text-ink-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[color:var(--theme-border)] accent-sky-500"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="font-semibold text-sky-500 transition-colors hover:text-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
                  onClick={() => setNotice("Password recovery will be available soon.")}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p
                className="rounded-xl border border-danger/25 bg-danger-soft px-3 py-2.5 text-[12px] font-medium leading-[1.4] text-danger"
                role="alert"
              >
                {error}
              </p>
            )}
            {notice && (
              <p
                className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-[12px] font-medium leading-[1.4] text-ink-600"
                role="status"
              >
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary-cta-gradient px-5 py-3 text-[14px] font-semibold leading-[1.55] text-white shadow-control transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            >
              {isSubmitting ? "Please wait…" : isSignIn ? "Sign In" : "Create Account"}
              {!isSubmitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] font-medium leading-[1.4] text-ink-600">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignIn ? "sign-up" : "sign-in")}
              className="font-semibold text-sky-500 transition-colors hover:text-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            >
              {isSignIn ? "Create Account" : "Sign In"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
