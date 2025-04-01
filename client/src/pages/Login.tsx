import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Sun, Cloud, CloudRain } from 'lucide-react';
import { SunIcon } from '@/components/SunIcon';
import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { useLocation as useGeoLocation } from '@/hooks/useLocation';

export default function Login() {
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');

  const [activeTab, setActiveTab] = useState('login');
  const [, setLocation] = useLocation();

  // Get location and weather
  const geoLocation = useGeoLocation();
  const { data: weather, isLoading: weatherLoading } = useWeather(
    geoLocation.latitude,
    geoLocation.longitude
  );

  // Determine if it's sunny based on API or manual toggle
  const actualWeather = weather ? isSunnyWeather(weather.weatherCondition, weather.icon) : true;
  const [manualToggle, setManualToggle] = useState<boolean | null>(null);
  const isSunny = manualToggle !== null ? manualToggle : actualWeather;

  // Handler for toggling weather mode
  const toggleWeatherMode = () => {
    setManualToggle(prev => {
      // If null (using actual weather), set to opposite of actual weather
      if (prev === null) return !actualWeather;
      // Otherwise toggle the manual setting
      return !prev;
    });
  };

  // Generate random positions for decorative elements
  const [decorations, setDecorations] = useState<{ clouds: Array<{top: string, left: string, size: string, delay: string}>, raindrops: number }>({
    clouds: [],
    raindrops: 0
  });

  // Set up decorative elements on mount and when weather changes
  useEffect(() => {
    const clouds = Array.from({ length: 6 }, () => ({
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 80}%`,
      size: `${Math.random() * 60 + 80}px`,
      delay: `${Math.random() * 60}s`
    }));

    setDecorations({
      clouds,
      raindrops: isSunny ? 0 : 40
    });
  }, [isSunny]);

  // Get auth context
  const { login, register, loading, error, user, clearError, loginWithGoogle } = useAuth();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      setLocation('/home');
    }
  }, [user, setLocation]);

  // Clear error when changing tabs
  useEffect(() => {
    clearError();
  }, [activeTab, clearError]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login({ username, password });
      // Redirect will happen automatically due to useEffect
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await register({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        fullName: registerFullName || undefined
      });
      // Redirect will happen automatically due to useEffect
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Registration error:', error);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-1000 relative overflow-hidden ${
      isSunny
        ? 'bg-gradient-to-br from-sky-100 via-amber-50 to-orange-50'
        : 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400'
    }`}>
      {/* Dynamic weather background effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Sun background for sunny weather */}
        {isSunny && (
          <>
            <div className="absolute top-10 left-10 w-64 h-64 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-200 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100 rounded-full opacity-20 blur-3xl"></div>
          </>
        )}

        {/* Clouds for rainy/cloudy weather */}
        {!isSunny && decorations.clouds.map((cloud, i) => (
          <div
            key={`cloud-${i}`}
            className="absolute bg-white opacity-60 rounded-full cloud-animation"
            style={{
              top: cloud.top,
              left: cloud.left,
              width: cloud.size,
              height: `calc(${cloud.size} * 0.6)`,
              animationDelay: cloud.delay,
              boxShadow: '0 0 20px 10px rgba(255, 255, 255, 0.3)',
              filter: 'blur(8px)'
            }}
          />
        ))}

        {/* Rain for rainy weather */}
        {!isSunny && weather?.weatherCondition === 'Rain' && (
          <div className="rain-container absolute top-0 left-0 w-full h-full">
            {Array.from({ length: decorations.raindrops }).map((_, i) => (
              <div
                key={`raindrop-${i}`}
                className="rain-drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 1 + 0.5}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className={`w-full backdrop-blur-sm shadow-xl border ${
          isSunny
            ? 'bg-white/80 border-amber-100'
            : 'bg-white/90 border-slate-200'
        }`}>
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <SunIcon size={32} rating={85} type="sun" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                SunSpotter
              </CardTitle>
            </div>
            <CardDescription className="text-center text-gray-600">
              Find the sunniest spots to enjoy your day
            </CardDescription>

            {/* Weather indicator */}
            <div className="mt-2 flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full">
              {weatherLoading ? (
                <span className="text-gray-500">Loading weather...</span>
              ) : (
                <>
                  {isSunny ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span className="text-gray-700">Sunny mode</span>
                    </>
                  ) : (
                    <>
                      <CloudRain className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-700">Rainy mode</span>
                    </>
                  )}
                  {manualToggle !== null && (
                    <span className="text-xs text-gray-500 ml-1">(manual)</span>
                  )}
                </>
              )}
            </div>

            {/* Custom Sun/Rain Animation (clickable for toggling) */}
            <div
              className="w-24 h-24 my-4 flex items-center justify-center cursor-pointer group"
              onClick={toggleWeatherMode}
              title="Click to toggle between sunny and rainy mode"
            >
              <div className="relative weather-toggle-container">
                <div className={`w-16 h-16 rounded-full shadow-lg animate-spin-slow group-hover:scale-110 transition-transform ${
                  isSunny
                    ? 'bg-gradient-to-br from-amber-400 to-orange-400'
                    : 'bg-gradient-to-br from-gray-400 to-slate-500'
                }`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isSunny ? (
                    <Sun className="h-10 w-10 text-white animate-pulse-slow" />
                  ) : weather?.weatherCondition === 'Rain' ? (
                    <CloudRain className="h-10 w-10 text-white animate-pulse-slow" />
                  ) : (
                    <Cloud className="h-10 w-10 text-white animate-pulse-slow" />
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-2">Click icon to toggle mode</p>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-50 border border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full grid-cols-2 mb-6 ${
                isSunny ? 'bg-amber-50' : 'bg-slate-50'
              }`}>
                <TabsTrigger
                  value="login"
                  className={`data-[state=active]:bg-white ${
                    isSunny
                      ? 'data-[state=active]:text-amber-600'
                      : 'data-[state=active]:text-slate-600'
                  }`}
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className={`data-[state=active]:bg-white ${
                    isSunny
                      ? 'data-[state=active]:text-amber-600'
                      : 'data-[state=active]:text-slate-600'
                  }`}
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="grid gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-700">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className={`bg-white focus:ring-2 ${
                          isSunny
                            ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                            : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`bg-white focus:ring-2 ${
                          isSunny
                            ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                            : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
                        }`}
                      />
                    </div>

                    <Button
                      type="submit"
                      className={`w-full shadow-md text-white py-2 ${
                        isSunny
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                          : 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className={`w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 ${
                        isSunny
                          ? 'border-amber-200'
                          : 'border-slate-200'
                      }`}
                      onClick={() => loginWithGoogle()}
                    >
                      <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-gray-700">Username</Label>
                      <Input
                        id="register-username"
                        placeholder="Choose a username"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        required
                        className={`bg-white focus:ring-2 ${
                          isSunny
                            ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                            : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-700">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className={`bg-white focus:ring-2 ${
                          isSunny
                            ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                            : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-fullname" className="text-gray-700">Full Name (Optional)</Label>
                      <Input
                        id="register-fullname"
                        placeholder="Enter your full name"
                        value={registerFullName}
                        onChange={(e) => setRegisterFullName(e.target.value)}
                        className={`bg-white focus:ring-2 ${
                          isSunny
                            ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                            : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-700">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        className={`bg-white focus:ring-2 ${
                          isSunny
                            ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                            : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'
                        }`}
                      />
                    </div>

                    <Button
                      type="submit"
                      className={`w-full shadow-md text-white py-2 mt-2 ${
                        isSunny
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                          : 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-xs text-gray-500 pt-0">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}