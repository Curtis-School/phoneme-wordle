type ApiErrorNoticeProps = {
  title: string;
  message: string;
  hint?: string;
};

export function ApiErrorNotice({ title, message, hint }: ApiErrorNoticeProps) {
  return (
    <section
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-7"
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-xl bg-surface-muted text-primary"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.01" />
        </svg>
      </span>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-prose text-sm leading-6 text-muted">{message}</p>
      {hint ? (
        <p className="max-w-prose rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm leading-6 text-muted">
          {hint}
        </p>
      ) : null}
    </section>
  );
}
