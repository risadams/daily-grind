import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.js';
import PublicFooter from '../components/PublicFooter.js';
import PublicHero from '../components/PublicHero.js';
import { 
  FaCoffee, FaQuestion, FaBook, FaVideo, FaSlack, FaUsers,
  FaHeadset, FaComments, FaEnvelope, FaPhone, FaExternalLinkAlt,
  FaCheckCircle, FaExclamationCircle, FaInfo, FaUserAlt, FaLaptop
} from 'react-icons/fa/index.js';
import '../styles/backgrounds.css';

// Contact method card component
const ContactMethodCard = ({ icon, title, description, action, actionText, actionLink }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-coffee hover:shadow-coffee-hover transition-all duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="p-4 bg-coffee-light/20 rounded-full mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold font-display text-coffee-espresso mb-2">{title}</h3>
        <p className="text-coffee-medium mb-4">{description}</p>
        <Link 
          to={actionLink} 
          className="inline-flex items-center text-coffee-accent font-medium hover:text-coffee-dark transition-colors"
        >
          {actionText} <FaExternalLinkAlt className="ml-1 h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

// Support tier component
const SupportTierCard = ({ tier, features, icon }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-coffee hover:shadow-coffee-hover transition-all duration-300">
      <div className="flex items-center mb-4">
        <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-coffee-medium to-coffee-dark text-white">
          {icon}
        </div>
        <h3 className="text-2xl font-bold font-display text-coffee-espresso">{tier}</h3>
      </div>
      
      <ul className="space-y-3 mb-4">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <FaCheckCircle className="h-5 w-5 text-coffee-accent mr-2 mt-0.5" />
            <span className="text-coffee-medium">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// FAQ Accordion component
const FAQItem = ({ question, answer, isOpen, toggleOpen }) => {
  return (
    <div className="border-b border-coffee-cream last:border-b-0">
      <button
        className="w-full text-left py-4 flex justify-between items-center focus:outline-none"
        onClick={toggleOpen}
      >
        <span className="text-lg font-medium text-coffee-dark">{question}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-coffee-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        <p className="text-coffee-medium">{answer}</p>
      </div>
    </div>
  );
};

// Resource card component
const ResourceCard = ({ title, description, icon, link }) => {
  return (
    <Link 
      to={link}
      className="bg-white p-6 rounded-xl shadow-coffee hover:shadow-coffee-hover transition-all duration-300 flex flex-col"
    >
      <div className="mb-4 text-coffee-accent">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display text-coffee-espresso mb-2">{title}</h3>
      <p className="text-coffee-medium mb-4 flex-grow">{description}</p>
      <div className="text-coffee-accent font-medium flex items-center mt-auto">
        Learn more <FaExternalLinkAlt className="ml-2 h-3 w-3" />
      </div>
    </Link>
  );
};

// Support task form
const SupportTaskForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the form data to an API
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-8 text-center">
        <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Support Task Received!</h3>
        <p className="mb-4">
          Thanks for contacting us. Our support team will get back to you within 24 hours.
        </p>
        <p>
          Your reference number: <span className="font-mono font-bold">DG-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-coffee-dark font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-coffee-cream rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-medium"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-coffee-dark font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-coffee-cream rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-medium"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-coffee-dark font-medium mb-1">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-coffee-cream rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-medium"
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-coffee-dark font-medium mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows="5"
          required
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-coffee-cream rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-medium"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="priority" className="block text-coffee-dark font-medium mb-1">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-coffee-cream rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-medium"
        >
          <option value="low">Low - General question</option>
          <option value="medium">Medium - Need help with a feature</option>
          <option value="high">High - Something isn't working</option>
          <option value="urgent">Urgent - Critical issue affecting work</option>
        </select>
      </div>
      
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          size="large"
          className="w-full sm:w-auto"
        >
          <FaEnvelope className="mr-2" /> Submit Support Request
        </Button>
      </div>
    </form>
  );
};

// SupportPage component - main page
const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('help');
  const [openFaqId, setOpenFaqId] = useState(0);
  
  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };
  
  const faqs = [
    {
      id: 1,
      question: "How do I create my first sprint in Daily Grind?",
      answer: "To create your first sprint, navigate to the Sprint Planning section from your dashboard. Click on 'Create Sprint', set the sprint duration, add tasks from your backlog, and click 'Start Sprint'. You can then manage your sprint from the Sprint Board."
    },
    {
      id: 2,
      question: "Can I integrate Daily Grind with other tools?",
      answer: "Yes! Daily Grind offers integrations with popular tools like Slack, GitHub, GitLab, and Microsoft Teams. You can set up integrations from your workspace settings under the 'Integrations' tab. We also provide an API for custom integrations."
    },
    {
      id: 3,
      question: "How do I invite team members to my workspace?",
      answer: "You can invite team members by going to Settings > Team Members and clicking 'Invite User'. Enter their email address, select their role, and click 'Send Invitation'. They'll receive an email with instructions to join your workspace."
    },
    {
      id: 4,
      question: "What's the difference between the different plans?",
      answer: "Our plans differ in features, the number of projects, and support options. Espresso (Free) is great for individuals or small teams, Americano offers more features for growing teams, Macchiato provides advanced features for larger teams, and Enterprise offers custom solutions for organizations with specific needs."
    },
    {
      id: 5,
      question: "How secure is my data in Daily Grind?",
      answer: "We take security seriously! All data is encrypted both in transit and at rest. We perform regular security audits and follow industry best practices. Enterprise plans include additional security features like SSO, custom data retention policies, and more."
    },
    {
      id: 6,
      question: "Can I export my data from Daily Grind?",
      answer: "Yes, you can export your data at any time. Go to Settings > Data Management and click 'Export Data'. You can choose to export specific projects or all data, and select from formats like JSON, CSV, or Excel."
    }
  ];
  
  return (
    <div className="bg-coffee-light/10 min-h-screen">
      {/* Hero Section */}
      <PublicHero
        title="Support & Resources"
        subtitle="We're here to help you brew the perfect workflow"
      />

      {/* Tab Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'help' 
                ? 'border-coffee-accent text-coffee-dark' 
                : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-light'
              }`}
              onClick={() => setActiveTab('help')}
            >
              <FaQuestion className="inline-block mr-2" />
              Help Center
            </button>
            <button
              className={`py-4 px-6 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'contact' 
                ? 'border-coffee-accent text-coffee-dark' 
                : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-light'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              <FaHeadset className="inline-block mr-2" />
              Contact Support
            </button>
            <button
              className={`py-4 px-6 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'resources' 
                ? 'border-coffee-accent text-coffee-dark' 
                : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-light'
              }`}
              onClick={() => setActiveTab('resources')}
            >
              <FaBook className="inline-block mr-2" />
              Resources
            </button>
            <button
              className={`py-4 px-6 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'plans' 
                ? 'border-coffee-accent text-coffee-dark' 
                : 'border-transparent text-coffee-medium hover:text-coffee-dark hover:border-coffee-light'
              }`}
              onClick={() => setActiveTab('plans')}
            >
              <FaCoffee className="inline-block mr-2" />
              Support Plans
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Help Center Tab */}
          {activeTab === 'help' && (
            <div>
              <h2 className="text-3xl font-bold font-display text-coffee-espresso mb-8">
                Frequently Asked Questions
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-coffee text-center">
                  <div className="inline-flex p-4 rounded-full bg-coffee-light/20 text-coffee-accent mb-4">
                    <FaVideo className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-coffee-dark mb-2">
                    Video Tutorials
                  </h3>
                  <p className="text-coffee-medium mb-4">
                    Learn through our comprehensive video guides on using Daily Grind.
                  </p>
                  <Link
                    to="/resources"
                    className="inline-flex items-center text-coffee-accent font-medium hover:text-coffee-dark transition-colors"
                  >
                    Watch tutorials <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-coffee text-center">
                  <div className="inline-flex p-4 rounded-full bg-coffee-light/20 text-coffee-accent mb-4">
                    <FaBook className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-coffee-dark mb-2">
                    Documentation
                  </h3>
                  <p className="text-coffee-medium mb-4">
                    Explore our detailed documentation for in-depth feature guides.
                  </p>
                  <Link
                    to="/docs"
                    className="inline-flex items-center text-coffee-accent font-medium hover:text-coffee-dark transition-colors"
                  >
                    Read the docs <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-coffee text-center">
                  <div className="inline-flex p-4 rounded-full bg-coffee-light/20 text-coffee-accent mb-4">
                    <FaSlack className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-coffee-dark mb-2">
                    Community
                  </h3>
                  <p className="text-coffee-medium mb-4">
                    Join our community forum to connect, share, and learn from others.
                  </p>
                  <Link
                    to="/community"
                    className="inline-flex items-center text-coffee-accent font-medium hover:text-coffee-dark transition-colors"
                  >
                    Join discussion <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-coffee p-6 md:p-8">
                {faqs.map(faq => (
                  <FAQItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFaqId === faq.id}
                    toggleOpen={() => toggleFaq(faq.id)}
                  />
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-coffee-medium mb-4">
                  Can't find what you're looking for?
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('contact')}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          )}
          
          {/* Contact Support Tab */}
          {activeTab === 'contact' && (
            <div>
              <h2 className="text-3xl font-bold font-display text-coffee-espresso mb-8">
                Contact Our Support Team
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <ContactMethodCard
                  icon={<FaEnvelope className="h-8 w-8 text-coffee-accent" />}
                  title="Email Support"
                  description="Send us an email and we'll get back to you within 24 hours."
                  actionText="support@dailygrind.com"
                  actionLink="mailto:support@dailygrind.com"
                />
                
                <ContactMethodCard
                  icon={<FaComments className="h-8 w-8 text-coffee-accent" />}
                  title="Live Chat"
                  description="Chat with our support team during business hours."
                  actionText="Start a chat"
                  actionLink="#chat"
                />
                
                <ContactMethodCard
                  icon={<FaPhone className="h-8 w-8 text-coffee-accent" />}
                  title="Phone Support"
                  description="For Enterprise customers and urgent issues."
                  actionText="+1 (555) 123-4567"
                  actionLink="tel:+15551234567"
                />
              </div>
              
              <div className="bg-white rounded-xl shadow-coffee p-6 md:p-8">
                <h3 className="text-2xl font-bold font-display text-coffee-espresso mb-6">
                  Submit a Support Task
                </h3>
                <SupportTaskForm />
              </div>
              
              <div className="mt-12 bg-coffee-light/20 rounded-xl p-6 md:p-8">
                <h3 className="text-xl font-bold font-display text-coffee-dark mb-4">
                  Business Hours
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-coffee-dark mb-2">Americas</h4>
                    <p className="text-coffee-medium">Monday - Friday: 6am - 8pm PT</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-dark mb-2">Europe & Asia</h4>
                    <p className="text-coffee-medium">Monday - Friday: 9am - 6pm CET</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div>
              <h2 className="text-3xl font-bold font-display text-coffee-espresso mb-8">
                Learning Resources
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <ResourceCard
                  title="Getting Started Guide"
                  description="Everything you need to know to set up your workspace and get running with Daily Grind."
                  icon={<FaLaptop className="h-6 w-6" />}
                  link="/resources/getting-started"
                />
                
                <ResourceCard
                  title="Video Tutorials"
                  description="Step-by-step video guides for all features and common workflows in Daily Grind."
                  icon={<FaVideo className="h-6 w-6" />}
                  link="/resources/videos"
                />
                
                <ResourceCard
                  title="API Documentation"
                  description="Comprehensive documentation for developers to integrate with Daily Grind's API."
                  icon={<FaBook className="h-6 w-6" />}
                  link="/resources/api"
                />
                
                <ResourceCard
                  title="Best Practices Guide"
                  description="Learn how top teams use Daily Grind to maximize productivity and collaboration."
                  icon={<FaCheckCircle className="h-6 w-6" />}
                  link="/resources/best-practices"
                />
                
                <ResourceCard
                  title="Feature Updates"
                  description="Stay up-to-date with the latest features and improvements to Daily Grind."
                  icon={<FaInfo className="h-6 w-6" />}
                  link="/resources/updates"
                />
                
                <ResourceCard
                  title="Community Forums"
                  description="Connect with other Daily Grind users, share tips, and get help from the community."
                  icon={<FaUserAlt className="h-6 w-6" />}
                  link="/community"
                />
              </div>
              
              <div className="bg-white rounded-xl shadow-coffee p-6 md:p-8">
                <h3 className="text-2xl font-bold font-display text-coffee-espresso mb-4">
                  Monthly Webinars
                </h3>
                <p className="text-coffee-medium mb-6">
                  Join our free monthly webinars to learn new features, ask questions, and connect with our team.
                </p>
                
                <div className="space-y-4">
                  <div className="border border-coffee-cream rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-coffee-dark">Mastering Sprint Planning</h4>
                        <p className="text-coffee-medium">April 15, 2025 • 11:00 AM PT</p>
                      </div>
                      <Button variant="secondary" size="small">Register</Button>
                    </div>
                  </div>
                  
                  <div className="border border-coffee-cream rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-coffee-dark">Advanced Reporting Techniques</h4>
                        <p className="text-coffee-medium">April 29, 2025 • 11:00 AM PT</p>
                      </div>
                      <Button variant="secondary" size="small">Register</Button>
                    </div>
                  </div>
                  
                  <div className="border border-coffee-cream rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-coffee-dark">Integration Showcase</h4>
                        <p className="text-coffee-medium">May 13, 2025 • 11:00 AM PT</p>
                      </div>
                      <Button variant="secondary" size="small">Register</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Support Plans Tab */}
          {activeTab === 'plans' && (
            <div>
              <h2 className="text-3xl font-bold font-display text-coffee-espresso mb-8">
                Support Plans
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <SupportTierCard
                  tier="Espresso"
                  icon={<FaCoffee className="h-6 w-6" />}
                  features={[
                    "Community forum access",
                    "Knowledge base access",
                    "Email support",
                    "Response time: 48 hours"
                  ]}
                />
                
                <SupportTierCard
                  tier="Americano"
                  icon={<FaUsers className="h-6 w-6" />}
                  features={[
                    "Everything in Espresso",
                    "Priority email support",
                    "Live chat support",
                    "Response time: 24 hours"
                  ]}
                />
                
                <SupportTierCard
                  tier="Macchiato"
                  icon={<FaHeadset className="h-6 w-6" />}
                  features={[
                    "Everything in Americano",
                    "Phone support",
                    "Dedicated support contact",
                    "Response time: 8 hours"
                  ]}
                />
                
                <SupportTierCard
                  tier="Enterprise"
                  icon={<FaExclamationCircle className="h-6 w-6" />}
                  features={[
                    "Everything in Macchiato",
                    "24/7 emergency support",
                    "On-boarding assistance",
                    "Response time: 1 hour"
                  ]}
                />
              </div>
              
              <div className="bg-white rounded-xl shadow-coffee overflow-hidden">
                <div className="bg-coffee-dark p-6 text-white">
                  <h3 className="text-2xl font-bold font-display">Support Comparison</h3>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-coffee-cream">
                      <thead>
                        <tr className="bg-coffee-light/10">
                          <th className="px-4 py-3 text-left text-sm font-medium text-coffee-dark">Feature</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-coffee-dark">Espresso</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-coffee-dark">Americano</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-coffee-dark">Macchiato</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-coffee-dark">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-coffee-cream">
                        <tr>
                          <td className="px-4 py-3 text-sm text-coffee-dark">Community Forum</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                        </tr>
                        <tr className="bg-coffee-light/5">
                          <td className="px-4 py-3 text-sm text-coffee-dark">Knowledge Base</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-coffee-dark">Email Support</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                        </tr>
                        <tr className="bg-coffee-light/5">
                          <td className="px-4 py-3 text-sm text-coffee-dark">Live Chat</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-coffee-dark">Phone Support</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                        </tr>
                        <tr className="bg-coffee-light/5">
                          <td className="px-4 py-3 text-sm text-coffee-dark">Response Time</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">48h</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">24h</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">8h</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">1h</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-coffee-dark">Dedicated Contact</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                        </tr>
                        <tr className="bg-coffee-light/5">
                          <td className="px-4 py-3 text-sm text-coffee-dark">24/7 Emergency Support</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-coffee-dark">Custom Training</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✗</td>
                          <td className="px-4 py-3 text-center text-coffee-medium">✓</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 bg-coffee-light/20 rounded-xl p-6 md:p-8 text-center">
                <h3 className="text-xl font-bold font-display text-coffee-dark mb-4">
                  Need a custom support solution?
                </h3>
                <p className="text-coffee-medium mb-6 max-w-2xl mx-auto">
                  Contact our sales team to discuss a support plan tailored to your organization's specific needs.
                </p>
                <Button
                  variant="primary"
                  size="large"
                >
                  <FaPhone className="mr-2" /> Contact Sales
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-coffee-medium to-coffee-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 coffee-pattern-bg opacity-5"></div>
          <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/4">
            <div className="w-96 h-96 rounded-full bg-coffee-light opacity-10 blur-3xl"></div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display tracking-tight text-white sm:text-4xl mb-6">
            Still have questions?
          </h2>
          <p className="text-lg text-coffee-light/80 max-w-2xl mx-auto mb-8">
            Our team is here to help. Reach out to us and we'll be happy to assist you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="primary"
              size="large"
              onClick={() => setActiveTab('contact')}
              className="hover:shadow-coffee-hover transform hover:-translate-y-1 transition-all duration-200 bg-coffee-cream text-coffee-dark hover:bg-white/80 hover:text-coffee-espresso"
            >
              <FaEnvelope className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
            <Button
              variant="secondary"
              size="large"
              className="border-white text-white hover:bg-white/10 transition-all duration-200"
            >
              <Link to="/docs" className="flex items-center">
                <FaBook className="w-5 h-5 mr-2" />
                Browse Documentation
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <PublicFooter currentPage="#" />
    </div>
  );
};

export default SupportPage;