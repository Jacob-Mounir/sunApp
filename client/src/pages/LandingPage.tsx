import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { SunIcon } from '@/components/SunIcon';
import { Sun, MapPin, Globe, Users, Star } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-amber-50 flex flex-col">
      {/* Header/Navigation */}
      <nav className="container mx-auto py-6 px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SunIcon size={32} rating={85} type="sun" />
          <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">SunSpotter</span>
        </div>

        <div className="hidden md:flex gap-8">
          <a href="#about" className="text-gray-600 hover:text-amber-500 transition-colors">About</a>
          <a href="#features" className="text-gray-600 hover:text-amber-500 transition-colors">Features</a>
          <a href="#contact" className="text-gray-600 hover:text-amber-500 transition-colors">Contact</a>
        </div>

        <Link href="/home">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Column - Text Content */}
          <div className="md:w-1/2 space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
              Find sun <br />
              <span className="text-amber-500">wherever</span> <br />
              you want
            </h1>

            <p className="text-xl text-gray-600 max-w-lg">
              Discover and track sunny spots in your city. Choose the perfect time and place for your outdoor activities.
            </p>

            <div className="flex gap-4">
              <Link href="/home">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 text-lg">
                  Get Started
                </Button>
              </Link>
              <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-50 px-8 py-6 text-lg">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Column - Phone Mockup */}
          <div className="md:w-1/2 relative">
            <div className="relative z-10">
              <img
                src="/images/app-mockup.png"
                alt="SunSpotter App"
                className="w-full max-w-[300px] mx-auto drop-shadow-2xl"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 sm:px-6 py-24">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Use SunSpotter everywhere you go</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Sun className="w-8 h-8" />, title: "Real-time tracking" },
            { icon: <MapPin className="w-8 h-8" />, title: "Location-based search" },
            { icon: <Users className="w-8 h-8" />, title: "Community reviews" },
            { icon: <Globe className="w-8 h-8" />, title: "Available everywhere" },
          ].map((feature, index) => (
            <div key={index} className="bg-white/80 rounded-xl p-6 hover:bg-white transition-colors shadow-lg hover:shadow-xl">
              <div className="bg-amber-100 p-4 rounded-lg w-fit mb-4">
                <div className="text-amber-600">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">Find the perfect sunny spot for your next outdoor activity.</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 sm:px-6 py-24">
        <div className="flex items-center gap-2 mb-12 justify-center">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <h2 className="text-3xl font-bold text-gray-900">Users love SunSpotter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="bg-white/80 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">&ldquo;SunSpotter has completely changed how I plan my outdoor activities. I always know where to find the best sunny spots!&rdquo;</p>
              <div className="text-sm text-gray-500">Sarah K.</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Logos */}
      <div className="container mx-auto px-4 sm:px-6 py-24">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Find sun at your favorite places</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
            <div key={index} className="bg-white/80 rounded-xl aspect-video flex items-center justify-center shadow-lg">
              <div className="w-16 h-16 bg-amber-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">Ready to find your perfect sunny spot?</h2>
        <Link href="/home">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 text-lg">
            Get Started Now
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SunIcon size={24} rating={85} type="sun" />
                <span className="font-bold text-xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  SunSpotter
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Find the perfect sunny spot for your outdoor activities, anytime and anywhere.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-600 hover:text-amber-500 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">API</a></li>
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">Integration</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">Guides</a></li>
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#about" className="text-gray-600 hover:text-amber-500 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">Careers</a></li>
                <li><a href="#contact" className="text-gray-600 hover:text-amber-500 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-amber-500 transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} SunSpotter. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="text-gray-500 hover:text-amber-500 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-amber-500 text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-amber-500 text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;