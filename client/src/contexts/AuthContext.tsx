import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, loginUser, logoutUser, registerUser, LoginCredentials, RegisterData, loginWithGoogle, handleGoogleAuthRedirect } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initial load - check if user is already logged in
  useEffect(() => {
    async function loadUser() {
      try {
        // Check if redirected from Google OAuth
        const isGoogleAuth = handleGoogleAuthRedirect();

        // Get current user from session
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Show success message if redirected from Google auth
        if (isGoogleAuth && currentUser) {
          toast({
            title: "Google login successful",
            description: `Welcome, ${currentUser.fullName || currentUser.username}!`,
          });
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [toast]);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await loginUser(credentials);
      setUser(loggedInUser);
      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.username}!`,
      });
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const googleLogin = () => {
    setLoading(true);
    setError(null);
    loginWithGoogle();
    // The rest of the process is handled by the OAuth flow and the useEffect hook
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await logoutUser();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const newUser = await registerUser(data);
      setUser(newUser);
      toast({
        title: "Registration successful",
        description: `Welcome, ${newUser.username}!`,
      });
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Create context value
  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle: googleLogin,
    logout,
    register,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}