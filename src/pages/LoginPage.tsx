import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { api } from '../lib/api';
import type { UserRole } from '../types/api';
import { Building2, Sparkles, User, ShieldCheck, UserCheck, Hotel, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateRegister, onLoginSuccess }) => {
  const { login, switchRolePreset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.data.token, res.data.data.user);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = async (role: UserRole) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await switchRolePreset(role);
      onLoginSuccess();
    } catch (err) {
      setErrorMsg('Failed to log in with preset account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={onLoginSuccess}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl glow-blue">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">StayHub</h1>
          <p className="text-xs text-slate-400">Guest House & Student Hostel Portal</p>
        </div>
      </div>

      <Card className="w-full max-w-md border-slate-800 shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Sign In to Your Account</CardTitle>
          <CardDescription>Enter your credentials to manage room stays and reservations</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 text-sm font-semibold">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Preset Accounts */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Demo Role Presets:
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('GUEST')}
                className="justify-start gap-2 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
              >
                <User className="w-3.5 h-3.5" /> Guest User
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('STUDENT')}
                className="justify-start gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                <Hotel className="w-3.5 h-3.5" /> Student User
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('RECEPTIONIST')}
                className="justify-start gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                <UserCheck className="w-3.5 h-3.5" /> Reception Desk
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('ADMIN')}
                className="justify-start gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin User
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-800/60 pt-4">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button
              onClick={onNavigateRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4"
            >
              Create an Account
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
