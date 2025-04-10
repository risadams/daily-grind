import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import PublicFooter from '../components/PublicFooter.js';
import PublicHero from '../components/PublicHero.js';
import { 
  FaCoffee, FaCheck, FaTimes, FaQuestion, 
  FaShieldAlt, FaUsers, FaChartLine, FaCode,
  FaClock, FaSyncAlt, FaHeadset, FaServer, FaClipboardList
} from 'react-icons/fa/index.js';
import '../styles/backgrounds.css';

// Pricing toggle component for monthly/annual billing
const PricingToggle = ({ isAnnual, onChange }) => {
  return (
    <div className="flex items-center justify-center space-x-3 mb-12">
      <span className={`text-lg ${!isAnnual ? 'text-coffee-dark font-medium' : 'text-coffee-medium'}`}>
        Monthly
      </span>
      <button
        onClick={() => onChange(!isAnnual)}
        className={`relative rounded-full w-16 h-8 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-coffee-light ${isAnnual ? 'bg-coffee-dark' : 'bg-coffee-medium'}`}
      >
        <div 
          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transform transition-transform duration-200 ${isAnnual ? 'translate-x-8' : ''}`}
        ></div>
      </button>
      <span className={`text-lg ${isAnnual ? 'text-coffee-dark font-medium' : 'text-coffee-medium'}`}>
        Annual <span className="text-coffee-accent text-sm font-medium">Save 20%</span>
      </span>
    </div>
  );
};

// Feature check component
const FeatureCheck = ({ included, feature }) => {
  return (
    <div className="flex items-start mb-4">
      <div className="flex-shrink-0">
        {included ? (
          <FaCheck className="h-5 w-5 text-coffee-accent" />
        ) : included === false ? (
          <FaTimes className="h-5 w-5 text-coffee-medium" />
        ) : (
          <FaQuestion className="h-5 w-5 text-coffee-medium" />
        )}
      </div>
      <p className="ml-3 text-coffee-dark">{feature}</p>
    </div>
  );
};

// Individual price card component
const PriceCard = ({ 
  title, 
  description, 
  price, 
  annualPrice,
  isAnnual,
  features, 
  isPopular = false,
  icon,
  buttonText = "Start free trial"
}) => {
  const navigate = useNavigate();
  
  const displayPrice = isAnnual 
    ? Math.floor(annualPrice) 
    : price;
  
  const pricePeriod = isAnnual ? "/user/month, billed annually" : "/user/month";
  
  return (
    <div className={`relative h-full flex flex-col rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-1 
      ${isPopular 
        ? 'border-2 border-coffee-accent shadow-coffee-hover' 
        : 'border border-coffee-light shadow-coffee'}`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0">
          <div className="text-xs font-bold text-white px-3 py-1 bg-coffee-accent transform rotate-0 translate-x-8 translate-y-3 -rotate-45">
            Popular
          </div>
        </div>
      )}
      
      <div className="p-6 bg-white flex-grow">
        <div className="flex items-center mb-4">
          <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-coffee-medium to-coffee-dark text-white">
            {icon}
          </div>
          <h3 className="text-2xl font-bold font-display text-coffee-espresso">{title}</h3>
        </div>
        <p className="text-coffee-medium mb-6">{description}</p>
        
        <div className="mb-8">
          <span className="text-4xl font-bold font-display text-coffee-dark">${displayPrice}</span>
          <span className="text-coffee-medium ml-2">{pricePeriod}</span>
        </div>
        
        <div className="space-y-4">
          {features.map((feature, i) => (
            <FeatureCheck key={i} included={feature.included} feature={feature.text} />
          ))}
        </div>
      </div>
      
      <div className="px-6 pb-6 pt-4 bg-white">
        <Button
          variant={isPopular ? "primary" : "secondary"}
          size="large"
          fullWidth
          className={`transition-all hover:shadow-md ${isPopular ? "bg-coffee-accent hover:bg-coffee-dark" : ""}`}
          onClick={() => navigate('/register')}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  // Pricing data
  const pricingPlans = [
    {
      title: "Espresso",
      description: "Perfect for individuals and small teams just getting started",
      price: 0,
      annualPrice: 0,
      icon: <FaCoffee className="h-6 w-6" />,
      buttonText: "Start for free",
      features: [
        { included: true, text: "Up to 10 tasks" },
        { included: true, text: "Basic task management" },
        { included: true, text: "Personal dashboard" },
        { included: false, text: "Sprint planning" },
        { included: false, text: "Team collaboration" },
        { included: false, text: "Advanced analytics" },
        { included: false, text: "API access" },
        { included: false, text: "Priority support" }
      ]
    },
    {
      title: "Americano",
      description: "Ideal for growing teams that need core agile features",
      price: 12,
      annualPrice: 9.6,
      icon: <FaUsers className="h-6 w-6" />,
      isPopular: true,
      features: [
        { included: true, text: "Unlimited tasks" },
        { included: true, text: "Advanced task management" },
        { included: true, text: "Team dashboards" },
        { included: true, text: "Sprint planning & execution" },
        { included: true, text: "Team collaboration tools" },
        { included: true, text: "Basic analytics" },
        { included: false, text: "API access" },
        { included: false, text: "Priority support" }
      ]
    },
    {
      title: "Macchiato",
      description: "For organizations that need premium features and support",
      price: 29,
      annualPrice: 23.2,
      icon: <FaChartLine className="h-6 w-6" />,
      features: [
        { included: true, text: "Everything in Americano" },
        { included: true, text: "Advanced analytics & reporting" },
        { included: true, text: "Custom fields & workflows" },
        { included: true, text: "Automated retrospectives" },
        { included: true, text: "Time tracking" },
        { included: true, text: "API access" },
        { included: true, text: "Priority support" },
        { included: true, text: "Dedicated account manager" }
      ]
    },
    {
      title: "Enterprise",
      description: "Custom solutions for large organizations with specific needs",
      price: null,
      annualPrice: null,
      icon: <FaServer className="h-6 w-6" />,
      buttonText: "Contact sales",
      features: [
        { included: true, text: "Everything in Macchiato" },
        { included: true, text: "Custom user roles & permissions" },
        { included: true, text: "Advanced security features" },
        { included: true, text: "Single sign-on (SSO)" },
        { included: true, text: "Dedicated hosting options" },
        { included: true, text: "SLA guarantees" },
        { included: true, text: "Custom integration development" },
        { included: true, text: "24/7 premium support" }
      ]
    }
  ];

  // Feature comparison for the detailed section
  const detailedFeatures = {
    taskManagement: {
      title: "Task Management",
      icon: <FaClipboardList className="h-6 w-6" />,
      features: [
        { name: "Custom task fields", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Bulk task operations", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Custom workflows", espresso: false, americano: false, macchiato: true, enterprise: true },
        { name: "Automated task routing", espresso: false, americano: false, macchiato: true, enterprise: true }
      ]
    },
    sprintPlanning: {
      title: "Sprint Planning",
      icon: <FaClock className="h-6 w-6" />,
      features: [
        { name: "Sprint boards", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Story point estimation", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Sprint backlog management", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Sprint analytics", espresso: false, americano: false, macchiato: true, enterprise: true }
      ]
    },
    collaboration: {
      title: "Team Collaboration",
      icon: <FaUsers className="h-6 w-6" />,
      features: [
        { name: "Team member assignment", espresso: true, americano: true, macchiato: true, enterprise: true },
        { name: "Comments & discussions", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "File attachments", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Integrated retrospectives", espresso: false, americano: false, macchiato: true, enterprise: true }
      ]
    },
    analytics: {
      title: "Analytics & Reports",
      icon: <FaChartLine className="h-6 w-6" />,
      features: [
        { name: "Basic dashboard stats", espresso: true, americano: true, macchiato: true, enterprise: true },
        { name: "Burndown charts", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Velocity tracking", espresso: false, americano: false, macchiato: true, enterprise: true },
        { name: "Custom reports", espresso: false, americano: false, macchiato: true, enterprise: true }
      ]
    },
    security: {
      title: "Security & Support",
      icon: <FaShieldAlt className="h-6 w-6" />,
      features: [
        { name: "Data encryption", espresso: true, americano: true, macchiato: true, enterprise: true },
        { name: "Role-based permissions", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Single sign-on (SSO)", espresso: false, americano: false, macchiato: false, enterprise: true },
        { name: "Dedicated support", espresso: false, americano: false, macchiato: true, enterprise: true }
      ]
    },
    api: {
      title: "API & Integrations",
      icon: <FaCode className="h-6 w-6" />,
      features: [
        { name: "REST API access", espresso: false, americano: false, macchiato: true, enterprise: true },
        { name: "Webhook support", espresso: false, americano: false, macchiato: true, enterprise: true },
        { name: "Third-party integrations", espresso: false, americano: true, macchiato: true, enterprise: true },
        { name: "Custom integrations", espresso: false, americano: false, macchiato: false, enterprise: true }
      ]
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <PublicHero
        title="Simple, Transparent Pricing"
        subtitle="Choose the plan that fits your team's needs with no hidden costs"
      />

      {/* Pricing Toggle and Cards */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingToggle isAnnual={isAnnual} onChange={setIsAnnual} />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <PriceCard
                key={index}
                title={plan.title}
                description={plan.description}
                price={plan.price}
                annualPrice={plan.annualPrice}
                isAnnual={isAnnual}
                features={plan.features}
                isPopular={plan.isPopular}
                icon={plan.icon}
                buttonText={plan.buttonText || "Start free trial"}
              />
            ))}
          </div>
          
          <div className="text-center mt-8 text-coffee-medium">
            <p>All plans come with a 30-day free trial. No credit card required.</p>
          </div>
        </div>
      </div>
      
      {/* Animated coffee beans divider */}
      <div className="relative h-24 bg-coffee-light/10">
        <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-dark rounded-full transform rotate-45 opacity-10 animate-bounce"></div>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-medium rounded-full transform rotate-45 opacity-10 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2">
          <div className="w-8 h-16 bg-coffee-accent rounded-full transform rotate-45 opacity-10 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>

      {/* Detailed Feature Comparison */}
      <div className="py-16 bg-coffee-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-display text-coffee-espresso text-center mb-12">
            Detailed Feature Comparison
          </h2>
          
          <div className="space-y-12">
            {Object.values(detailedFeatures).map((section, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-coffee overflow-hidden">
                <div className="bg-coffee-dark p-4 text-white flex items-center">
                  <div className="p-2 bg-white/10 rounded-lg mr-3">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold font-display">{section.title}</h3>
                </div>
                
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-coffee-light/20">
                          <th scope="col" className="py-3 px-4 text-left text-sm font-medium text-coffee-dark">Feature</th>
                          <th scope="col" className="py-3 px-4 text-center text-sm font-medium text-coffee-dark">Espresso</th>
                          <th scope="col" className="py-3 px-4 text-center text-sm font-medium text-coffee-dark">Americano</th>
                          <th scope="col" className="py-3 px-4 text-center text-sm font-medium text-coffee-dark">Macchiato</th>
                          <th scope="col" className="py-3 px-4 text-center text-sm font-medium text-coffee-dark">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.features.map((feature, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-coffee-light/5' : 'bg-white'}>
                            <td className="py-3 px-4 text-sm font-medium text-coffee-dark">
                              {feature.name}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {feature.espresso ? <FaCheck className="h-5 w-5 text-coffee-accent mx-auto" /> : <FaTimes className="h-5 w-5 text-coffee-medium mx-auto" />}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {feature.americano ? <FaCheck className="h-5 w-5 text-coffee-accent mx-auto" /> : <FaTimes className="h-5 w-5 text-coffee-medium mx-auto" />}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {feature.macchiato ? <FaCheck className="h-5 w-5 text-coffee-accent mx-auto" /> : <FaTimes className="h-5 w-5 text-coffee-medium mx-auto" />}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {feature.enterprise ? <FaCheck className="h-5 w-5 text-coffee-accent mx-auto" /> : <FaTimes className="h-5 w-5 text-coffee-medium mx-auto" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-display text-coffee-espresso text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
              },
              {
                question: "Is there a limit on users per plan?",
                answer: "Our pricing is per-user, so you can add as many team members as you need. Each user counts toward your subscription cost."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal for payment."
              },
              {
                question: "Do you offer discounts for non-profits or educational institutions?",
                answer: "Yes! We offer special pricing for non-profits, educational institutions, and open source projects. Contact our sales team for details."
              },
              {
                question: "How secure is my data?",
                answer: "We take data security very seriously. All data is encrypted both in transit and at rest, and we perform regular security audits."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-coffee-light/10 rounded-lg p-6">
                <h3 className="text-lg font-bold text-coffee-dark mb-2">{faq.question}</h3>
                <p className="text-coffee-medium">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-coffee-dark to-coffee-medium overflow-hidden">
        <div className="absolute inset-0 coffee-pattern-bg opacity-5"></div>
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display tracking-tight text-white sm:text-4xl mb-6">
            Ready to get started with Daily Grind?
          </h2>
          <p className="text-lg text-coffee-light/80 max-w-3xl mx-auto mb-8">
            Join thousands of teams who have already discovered how Daily Grind can transform their productivity.
            Try it free for 30 days, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              variant="primary"
              size="large"
              className="hover:shadow-coffee-hover transform hover:-translate-y-1 transition-all duration-200 bg-coffee-cream text-coffee-dark hover:bg-white/80 hover:text-coffee-espresso"
            >
              <FaCoffee className="w-5 h-5 mr-2" />
              Start Your Free Trial
            </Button>
            <Button
              variant="secondary"
              size="large"
              className="border-white text-white hover:bg-white/10 transition-all duration-200"
            >
              <Link to="/about" className="flex items-center">
                Learn More About Us
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <PublicFooter currentPage="/pricing" />
    </div>
  );
};

export default PricingPage;