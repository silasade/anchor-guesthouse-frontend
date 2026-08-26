import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { api } from '../lib/api';
import type { UserRole } from '../types/api';
import { Building2, User, Hotel, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateLogin, onRegisterSuccess }) => {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('GUEST');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        studentId: role === 'STUDENT' ? studentId : undefined,
        phoneNumber,
      });

      login(res.data.data.token, res.data.data.user);
      onRegisterSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={onRegisterSuccess}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl glow-blue">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">StayHub</h1>
          <p className="text-xs text-slate-400">Guest House & Student Hostel Portal</p>
        </div>
      </div>

      <Card className="w-full max-w-lg border-slate-800 shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Create New Account</CardTitle>
          <CardDescription>Select your account type to register for room reservations</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Account Category Selector */}
          <div className="space-y-2">
            <Label>Select User Role Category</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('GUEST')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'GUEST'
                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-lg glow-blue'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs">Guest Account</span>
                </div>
                <p className="text-[11px] text-slate-400">Books Single Guest Rooms</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'STUDENT'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-lg glow-emerald'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Hotel className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Student Account</span>
                </div>
                <p className="text-[11px] text-slate-400">Books Double/Triple Bedspaces</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {role === 'STUDENT' && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student Matriculation / ID Number</Label>
                <Input
                  id="studentId"
                  required
                  placeholder="STU/2026/001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-800/60 pt-4">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button
              onClick={onNavigateLogin}
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4"
            >
              Sign In Here
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
