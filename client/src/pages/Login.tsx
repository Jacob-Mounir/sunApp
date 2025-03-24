import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Player } from '@lottiefiles/react-lottie-player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple mock login - in real app, this would call an API
    setTimeout(() => {
      setIsLoading(false);
      setLocation('/');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Shader Gradient Background - this is an iframe that loads the shadergradient.co website */}
      <div className="absolute inset-0 z-0">
        <iframe 
          src="https://www.shadergradient.co/preset/warm-sunset?animate=on&brightness=1.2&cameraPosition=0%2C0%2C5&cameraZoom=9.1&color1=%23ff4e00&color2=%23ec9f05&color3=%23ff4500&density=0.7&grain=on&type=plane" 
          className="w-full h-full border-0"
          title="Shader Gradient"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="w-full bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              SunSpotter
            </CardTitle>
            <CardDescription>
              Find the sunniest spots to enjoy your day
            </CardDescription>
            
            {/* Lottie Animation */}
            <div className="w-32 h-32 my-2">
              <Player
                autoplay
                loop
                src="https://cdn.lottielab.com/l/2cbcq574A5eiJG.json"
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="Enter your username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Would navigate to signup page in a real app
                  alert('Signup not implemented yet');
                }}
                className="text-orange-600 hover:underline"
              >
                Sign up
              </a>
            </div>
            
            <div className="text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}