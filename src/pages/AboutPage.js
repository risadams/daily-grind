import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import PageHeader from '../components/PageHeader.js';
import PublicFooter from '../components/PublicFooter.js';
import PublicHero from '../components/PublicHero.js';
import { FaCoffee, FaHeart, FaLightbulb, FaUsers, FaHistory, FaLeaf, FaStar } from 'react-icons/fa/index.js';
import '../styles/backgrounds.css';

const TeamMember = ({ name, role, bio, initial }) => (
  <div className="flex flex-col items-center bg-white rounded-xl shadow-coffee p-6 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-coffee-hover">
    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-coffee-medium to-coffee-dark flex items-center justify-center text-white text-2xl font-bold mb-4">
      {initial}
    </div>
    <h3 className="text-xl font-bold text-coffee-espresso font-display">{name}</h3>
    <p className="text-coffee-medium font-medium mb-2">{role}</p>
    <p className="text-coffee-dark/80 text-center">{bio}</p>
  </div>
);

const ValueCard = ({ icon, title, description }) => (
  <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-coffee hover:shadow-coffee-hover transition-all duration-300 border border-coffee-light/20">
    <div className="p-3 bg-gradient-to-br from-coffee-medium to-coffee-dark rounded-xl text-white mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-coffee-dark font-display mb-2">{title}</h3>
    <p className="text-coffee-medium text-center">{description}</p>
  </div>
);

const AboutPage = () => {
  return (
    <div className="bg-coffee-light/10 min-h-screen">
      {/* Hero Section */}
      <PublicHero 
        title="About Daily Grind" 
        subtitle="Brewing productivity solutions for teams since 2023"
      />

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display text-coffee-espresso inline-block relative">
            Our Story
            <span className="absolute bottom-0 left-0 w-full h-1 bg-coffee-accent transform -translate-y-2"></span>
          </h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-coffee p-8 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 coffee-pattern-bg opacity-5 transform rotate-45"></div>
          
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-coffee-accent/10 rounded-lg transform rotate-3"></div>
                <div className="relative bg-coffee-cream/30 p-6 rounded-lg border border-coffee-light">
                  <h3 className="text-2xl font-bold text-coffee-espresso font-display mb-4 flex items-center">
                    <FaHistory className="mr-2 text-coffee-accent" /> 
                    Humble Beginnings
                  </h3>
                  <p className="text-coffee-dark mb-4">
                    Daily Grind was born in 2023 when a team of passionate developers and product managers 
                    found themselves drowning in a sea of tasks, spreadsheets, and confusing agile tools.
                  </p>
                  <p className="text-coffee-dark mb-4">
                    Frustrated by complex interfaces and bloated features they rarely used, 
                    they decided to brew something better – a task tracking system that would 
                    be as smooth and refreshing as their morning coffee.
                  </p>
                  <div className="flex items-center border-l-4 border-coffee-accent pl-4 italic text-coffee-medium">
                    "We wanted a tool that would energize teams, not drain them – just like a perfect cup of coffee."
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h3 className="text-2xl font-bold text-coffee-espresso font-display mb-4 flex items-center">
                <FaLightbulb className="mr-2 text-coffee-accent" /> 
                Our Mission
              </h3>
              <p className="text-coffee-dark mb-6">
                At Daily Grind, we're on a mission to simplify the daily work of agile teams through 
                intuitive, delightful tools that focus on what matters most – delivering great work together.
              </p>
              
              <h3 className="text-2xl font-bold text-coffee-espresso font-display mb-4 flex items-center">
                <FaLeaf className="mr-2 text-coffee-accent" /> 
                What Makes Us Different
              </h3>
              <ul className="space-y-3 text-coffee-dark">
                <li className="flex items-start">
                  <span className="text-coffee-accent mr-2">✓</span>
                  <span>Designed by scrum practitioners who understand your daily challenges</span>
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-accent mr-2">✓</span>
                  <span>Focus on simplicity without sacrificing powerful features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-accent mr-2">✓</span>
                  <span>Built to energize teams, not weigh them down with process</span>
                </li>
                <li className="flex items-start">
                  <span className="text-coffee-accent mr-2">✓</span>
                  <span>Constantly evolving based on real user feedback</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="bg-coffee-cream/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-coffee-espresso inline-block relative">
              Our Values
              <span className="absolute bottom-0 left-0 w-full h-1 bg-coffee-accent transform -translate-y-2"></span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard 
              icon={<FaCoffee className="h-8 w-8" />}
              title="Quality First"
              description="Like a perfect espresso, we believe in doing fewer things exceptionally well rather than many things adequately."
            />
            <ValueCard 
              icon={<FaUsers className="h-8 w-8" />}
              title="Team Focused"
              description="We build tools that help teams work better together, emphasizing collaboration and transparency."
            />
            <ValueCard 
              icon={<FaHeart className="h-8 w-8" />}
              title="User Delight"
              description="We obsess over user experience, creating moments of delight that make work feel less like work."
            />
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display text-coffee-espresso inline-block relative">
            Meet Our Team
            <span className="absolute bottom-0 left-0 w-full h-1 bg-coffee-accent transform -translate-y-2"></span>
          </h2>
          <p className="mt-4 text-coffee-medium max-w-3xl mx-auto">
            A passionate group of coffee-loving productivity enthusiasts dedicated to making your work life better.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <TeamMember 
            name="Alex Rivera" 
            role="Founder & CEO" 
            bio="Former scrum master who believed project management could be both effective and enjoyable."
            initial="A"
          />
          <TeamMember 
            name="Maya Johnson" 
            role="Lead Designer" 
            bio="Passionate about creating interfaces that feel intuitive from the first interaction."
            initial="M"
          />
          <TeamMember 
            name="Raj Patel" 
            role="Lead Developer" 
            bio="Coding wizard who ensures Daily Grind runs as smoothly as a well-oiled espresso machine."
            initial="R"
          />
          <TeamMember 
            name="Sofia Chen" 
            role="Product Manager" 
            bio="Agile enthusiast focused on translating user needs into features that matter."
            initial="S"
          />
        </div>
      </div>

      {/* Growth Timeline */}
      <div className="bg-coffee-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-white inline-block relative">
              Our Growth Journey
              <span className="absolute bottom-0 left-0 w-full h-1 bg-coffee-accent transform -translate-y-2"></span>
            </h2>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-coffee-medium"></div>
            
            {/* Timeline events */}
            <div className="space-y-12 relative">
              {[
                {
                  year: "2023",
                  title: "The First Brew",
                  description: "Daily Grind launches with core task tracking functionality for small teams."
                },
                {
                  year: "2024",
                  title: "Growing Stronger",
                  description: "Added sprint management, retrospectives, and analytics. Reached 10,000 users milestone!"
                },
                {
                  year: "2025",
                  title: "Full Flavor",
                  description: "Expanded with enterprise features, integrations, and mobile apps. Now serving over 100,000 users worldwide."
                }
              ].map((event, index) => (
                <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1 md:text-right p-4 rounded-lg bg-coffee-medium/20 backdrop-blur-sm mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-coffee-accent">{event.title}</h3>
                    <p className="text-coffee-light/80">{event.description}</p>
                  </div>
                  
                  <div className="mx-4 flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-coffee-accent flex items-center justify-center text-coffee-dark font-bold">
                      <FaStar className="h-5 w-5" />
                    </div>
                    <div className="mt-2 font-bold text-coffee-accent">{event.year}</div>
                  </div>
                  
                  <div className="flex-1 p-4 md:invisible"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-coffee-medium to-coffee-dark overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/4">
          <div className="w-96 h-96 rounded-full bg-coffee-light opacity-10 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display tracking-tight text-white sm:text-4xl mb-6">
            Ready to simplify your daily grind?
          </h2>
          <p className="text-lg text-coffee-light/80 max-w-2xl mx-auto mb-8">
            Join thousands of teams who have already brewed better productivity with Daily Grind.
            No credit card required, free trial for 30 days.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="primary"
              size="large"
              onClick={() => {}}
              className="hover:shadow-coffee-hover transform hover:-translate-y-1 transition-all duration-200 bg-coffee-cream text-coffee-dark hover:bg-white/80 hover:text-coffee-espresso"
            >
              <FaCoffee className="w-5 h-5 mr-2" />
              Get started free
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={() => {}}
              className="border-white text-white hover:bg-white/10 transition-all duration-200"
            >
              See pricing
            </Button>
          </div>
        </div>
      </div>

      <PublicFooter currentPage="/about" />
    </div>
  );
};

export default AboutPage;