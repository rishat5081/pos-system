import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const onSubmit = async (values: LoginForm): Promise<void> => {
    await login(values.username, values.password);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />

      <div className="z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden rounded-3xl border border-white/40 bg-slate-950/90 p-10 text-white shadow-2xl lg:block">
          <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Smart Retail Suite
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Run POS, inventory, and finance from one command center.</h1>
          <p className="mt-5 max-w-md text-sm text-slate-300">
            Fast checkout, clean operations, and full store visibility without switching systems.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Session Speed</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-200">&lt;100ms</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Store Mode</p>
              <p className="mt-2 text-2xl font-semibold text-amber-200">Offline-first</p>
            </div>
          </div>
        </section>

        <Card className="w-full border-white/70 bg-white/85 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Sign In</CardTitle>
            <CardDescription className="text-base">Enter credentials to access the POS system.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Username
                </label>
                <Input
                  id="username"
                  autoComplete="username"
                  className="h-12 rounded-xl border-slate-200 bg-white text-lg shadow-sm"
                  {...register('username')}
                />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-slate-200 bg-white text-lg shadow-sm"
                  {...register('password')}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-destructive">{error}</p>}
              <Button type="submit" className="h-12 w-full rounded-xl bg-sky-600 text-lg hover:bg-sky-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <p className="text-center text-sm text-slate-600">
                Need system overview first?{' '}
                <Link to="/" className="font-semibold text-cyan-700 hover:text-cyan-900">
                  Go to Home
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
