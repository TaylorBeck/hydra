'use client';

import { useState } from 'react';
import { LogIn, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { useAuthContext } from './auth-provider';
import { LoginForm } from './login-form';
import { SignUpForm } from './signup-form';
import { useDisplayName } from '@/stores/auth-store';

type AuthMode = 'login' | 'signup';

export function AuthButton() {
  const { isAuthenticated, user, signOut } = useAuthContext();
  const displayName = useDisplayName();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <Avatar className="h-7 w-7">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </Avatar>
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <div className="flex items-center space-x-3 p-2">
            <Avatar className="h-10 w-10">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => {
              // TODO: Open profile settings
            }}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => {
              // TODO: Open settings modal
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
        onClick={() => setShowAuthDialog(true)}
      >
        <LogIn className="h-4 w-4" />
        <span className="sr-only">Sign in</span>
      </Button>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="invisible">
              {authMode === 'login' ? 'Sign in to Hyra' : 'Create your account'}
            </DialogTitle>
          </DialogHeader>
          
          {authMode === 'login' ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={switchAuthMode}
            />
          ) : (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={switchAuthMode}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
