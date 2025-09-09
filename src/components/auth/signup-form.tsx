'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from './auth-provider';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signInWithProvider, isLoading } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, displayName, ...credentials } = data;
    
    const result = await signUp({
      ...credentials,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    
    if (result.success) {
      onSuccess?.();
    } else if (result.error) {
      setError('root', {
        type: 'manual',
        message: (result.error as { message?: string })?.message || 'Failed to create account',
      });
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    const result = await signInWithProvider(provider);
    if (result.success) {
      onSuccess?.();
    }
  };

  const isFormLoading = isSubmitting || isLoading;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="displayName" className="text-sm font-medium leading-none">
            Name
          </label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
            <Input
              id="displayName"
              type="text"
              placeholder="Enter your display name"
              className="pl-10 h-11 focus-visible:ring-offset-1"
              {...register('displayName')}
              disabled={isFormLoading}
            />
          </div>
          {errors.displayName && (
            <p className="text-sm text-destructive mt-1">{errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10 h-11 focus-visible:ring-offset-1"
              {...register('email')}
              disabled={isFormLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="password" className="text-sm font-medium leading-none">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className="pl-10 pr-10 h-11 focus-visible:ring-offset-1"
              {...register('password')}
              disabled={isFormLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent focus-visible:ring-offset-1"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isFormLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
            Confirm Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="pl-10 pr-10 h-11 focus-visible:ring-offset-1"
              {...register('confirmPassword')}
              disabled={isFormLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent focus-visible:ring-offset-1"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isFormLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root && (
          <div className="rounded-md bg-destructive/15 dark:bg-destructive/20 p-3 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">{errors.root.message}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 mt-6"
          disabled={isFormLoading}
        >
          {isFormLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="dark:bg-slate-900 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-11"
          onClick={() => handleOAuthSignIn('google')}
          disabled
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          className="h-11"
          onClick={() => handleOAuthSignIn('github')}
          disabled
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      {onSwitchToLogin && (
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={onSwitchToLogin}
            disabled={isFormLoading}
          >
            Sign in
          </Button>
        </div>
      )}
    </div>
  );
}
