import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SunIcon } from '@/components/SunIcon';
import { Sun, MapPin, Globe, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-amber-50 flex flex-col overflow-hidden">
      {/* Header/Navigation */}
      <nav className="container mx-auto py-6 px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SunIcon size={32} rating={85} type="sun" />
          <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">SunSpotter</span>
        </div>

        <div className="hidden md:flex gap-8">
          <a href="#about" className="text-gray-700 hover:text-amber-500 transition-colors">About</a>
          <a href="#features" className="text-gray-700 hover:text-amber-500 transition-colors">Features</a>
          <a href="#team" className="text-gray-700 hover:text-amber-500 transition-colors">Team</a>
          <a href="#contact" className="text-gray-700 hover:text-amber-500 transition-colors">Contact</a>
        </div>

        <Link href="/home">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto flex-1 flex flex-col md:flex-row items-center px-4 sm:px-6 py-10 md:py-16">
        {/* Left Column - Text Content */}
        <div className="md:w-1/2 md:pr-12 z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Find the <span className="text-amber-500">sunniest</span> spots<br />
              in your city, <span className="text-amber-500">anywhere</span><br />
              and <span className="text-amber-500">anytime</span>.
            </h1>

            <p className="text-lg text-gray-700 max-w-lg">
              Never miss the sun again. SunSpotter helps you locate cafes, restaurants, and parks with the best sun exposure at any time of the day.
            </p>
          </div>

          {/* Email Form */}
          <div className="flex max-w-md gap-2 bg-white/40 p-1 rounded-full">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-full border-0 bg-white shadow-sm"
            />
            <Link href="/home">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full">
                Join Waitlist
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="pt-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <Sun className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-700">Real-time sunlight tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-700">Location-based search</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-700">Community reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <Globe className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-700">Available in 10+ cities</span>
            </div>
          </div>
        </div>

        {/* Right Column - Phone Mockup */}
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center md:justify-end">
          <div className="relative">
            {/* Phone mockup */}
            <div className="bg-gray-100 rounded-[40px] p-3 shadow-2xl border-8 border-gray-900 transform md:translate-y-6 md:rotate-3">
              <div className="bg-white rounded-[28px] overflow-hidden h-[600px]">
                {/* App Interface Mock - SunSpotter UI */}
                <div className="p-4 bg-amber-500 flex justify-between items-center">
                  <div className="text-white">9:41</div>
                  <div className="flex items-center gap-1 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-signal"><path d="M2 20h.01"></path><path d="M7 20v-4"></path><path d="M12 20v-8"></path><path d="M17 20V8"></path></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-battery-charging"><path d="M7 7H3.5a2.5 2.5 0 0 0-2.5 2.5v5A2.5 2.5 0 0 0 3.5 17H7"></path><path d="M10 7h4"></path><path d="M17 7h3.5a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5H17"></path><line x1="12" x2="9" y1="3" y2="7"></line><polyline points="14 17 12 21 9 17"></polyline></svg>
                  </div>
                </div>

                {/* App header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-3">
                    <SunIcon size={28} rating={90} type="sun" />
                    <span className="font-bold text-xl text-amber-500">SunSpotter</span>
                    <span className="ml-auto text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-1">Sun Mode</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Göteborg, Sweden</span>
                    <span className="ml-auto text-sm text-gray-500">23°C · Sunny</span>
                  </div>

                  {/* Search bar */}
                  <div className="bg-gray-100 rounded-full p-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search text-gray-400 ml-2 mr-1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" placeholder="Search venues" className="bg-transparent border-none focus:outline-none text-sm w-full" />
                  </div>
                </div>

                {/* Category filter */}
                <div className="p-3 overflow-x-auto">
                  <div className="flex space-x-2">
                    <div className="bg-amber-100 text-amber-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                      <Sun className="h-4 w-4" />
                      <span>All</span>
                    </div>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">Restaurants</div>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">Cafés</div>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">Bars</div>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">Parks</div>
                  </div>
                </div>

                {/* Venue cards */}
                <div className="p-4 space-y-4">
                  {/* Card 1 */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-36 bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Sun className="h-3 w-3" fill="white" />
                        <span>4.8</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-white/90 text-amber-600 text-xs font-medium px-2 py-1 rounded-full">
                        Sunny until 5 PM
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-gray-900">Rosenkaféet</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <span>Café</span>
                        <span>•</span>
                        <span>Haga</span>
                        <span>•</span>
                        <span>1.2 km</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="bg-amber-100 w-1.5 h-1.5 rounded-full"></div>
                        <span className="text-xs text-gray-600">Terrace faces south-west</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-36 bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Sun className="h-3 w-3" fill="white" />
                        <span>4.5</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-white/90 text-amber-600 text-xs font-medium px-2 py-1 rounded-full">
                        Sunny all day
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-gray-900">Trägårn</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <span>Bar & Restaurant</span>
                        <span>•</span>
                        <span>Tredje Långgatan</span>
                        <span>•</span>
                        <span>0.8 km</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="bg-amber-100 w-1.5 h-1.5 rounded-full"></div>
                        <span className="text-xs text-gray-600">Large garden with heaters</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Nav */}
                <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-around">
                  <div className="p-2 rounded-md bg-amber-100 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </div>
                  <div className="p-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </div>
                  <div className="p-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                  </div>
                  <div className="p-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 right-[-40px] top-1/4 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute -z-10 left-[-60px] bottom-1/4 w-60 h-60 bg-sky-100 rounded-full blur-3xl opacity-70"></div>

            {/* Background Line/Curve Element */}
            <svg className="hidden md:block absolute top-0 left-0 -z-20 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,30 Q30,10 45,30 T90,30" stroke="#f59e0b" strokeWidth="0.5" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;