import { useLocation } from 'wouter';
import { ArrowLeft, ExternalLink, Sun, MapPin, Github, Mail, Twitter, Coffee } from 'lucide-react';

export default function About() {
  const [, navigate] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate("/")}
          className="mr-3 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">About SunSpotter</h1>
      </div>
      
      <div className="space-y-8">
        {/* App description */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-md">
              <Sun className="h-12 w-12 text-amber-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-amber-800 mb-2">SunSpotter</h2>
          <p className="text-center text-amber-800">
            Version 1.0.0
          </p>
          <p className="text-center text-amber-700 mt-4">
            Find the sunniest spots in your city with SunSpotter. 
            Discover restaurants, cafés, bars, and parks where you can enjoy the sunshine.
          </p>
        </div>
        
        {/* Features */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Sun className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="font-semibold">Sun Rating System</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Find locations with the best sunshine based on our 5-star sun rating system
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="font-semibold">Interactive Map</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Explore sunny locations around you with our interactive map
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Coffee className="h-5 w-5 text-amber-700 mr-2" />
                <h3 className="font-semibold">Venue Database</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Comprehensive database of restaurants, cafés, bars, and parks
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Sun className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="font-semibold">Sun Prediction</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Advanced algorithms to predict sun exposure at different times of day
              </p>
            </div>
          </div>
        </div>
        
        {/* How it works */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="bg-white border border-gray-200 p-5 rounded-lg space-y-4">
            <p className="text-gray-700">
              SunSpotter uses advanced sun position calculations to determine when a location receives direct sunlight. 
              We analyze:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Geographic location and orientation</li>
              <li>Building heights and their shadow patterns</li>
              <li>Time of day and seasonal variations</li>
              <li>Real-time weather conditions</li>
            </ul>
            <p className="text-gray-700">
              Our sun rating system (1-5) is calculated based on the total hours of direct sunlight a venue receives and the quality of the sun exposure.
            </p>
          </div>
        </div>
        
        {/* Contact & Links */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Connect With Us</h2>
          <div className="bg-white border border-gray-200 p-5 rounded-lg space-y-4">
            <a 
              href="mailto:contact@sunspotter.com" 
              className="flex items-center py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <Mail className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-gray-700">contact@sunspotter.com</span>
            </a>
            
            <a 
              href="https://twitter.com/sunspotter" 
              className="flex items-center py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-5 w-5 text-blue-400 mr-3" />
              <span className="text-gray-700">@sunspotter</span>
              <ExternalLink className="h-3.5 w-3.5 ml-2 text-gray-400" />
            </a>
            
            <a 
              href="https://github.com/sunspotter/app" 
              className="flex items-center py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5 text-gray-700 mr-3" />
              <span className="text-gray-700">GitHub Repository</span>
              <ExternalLink className="h-3.5 w-3.5 ml-2 text-gray-400" />
            </a>
          </div>
        </div>
        
        {/* Legal */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} SunSpotter. All rights reserved.
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}