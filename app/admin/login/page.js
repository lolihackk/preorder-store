import LoginForm from "@/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="max-w-sm mx-auto px-5 py-20">
      <h1 className="font-display text-2xl text-ink text-center mb-1">Admin login</h1>
      <p className="text-ink-soft text-sm text-center mb-8">Sign in to manage products and pre-orders.</p>
      <LoginForm />
    </div>
  );
}
