import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import PublicFooter from '../components/PublicFooter.js';
import PublicHero from '../components/PublicHero.js';
import { 
  FaCoffee, FaClipboardList, FaClock, FaUsers, FaChartLine, 
  FaComments, FaCheckCircle, FaMobile, FaCode, FaShieldAlt, 
  FaRocket, FaSearch, FaBell, FaCalendarAlt, FaSyncAlt
} from 'react-icons/fa/index.js';
import '../styles/backgrounds.css';

// Feature section component
const FeatureSection = ({ title, description, image, imageAlt, reverse, children, icon }) => {
  return (
    <div className={`py-12 md:py-24 ${reverse ? 'bg-coffee-light/10' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
          <div className="lg:w-1/2">
            <div className={`p-1 rounded-xl ${reverse ? 'bg-gradient-to-br from-coffee-dark to-coffee-accent' : 'bg-gradient-to-br from-coffee-medium to-coffee-accent'}`}>
              <div className="bg-white p-2 rounded-lg">
                <img
                  src={image || "/images/feature-placeholder.svg"}
                  alt={imageAlt || "Feature illustration"}
                  className="w-full h-auto rounded-md shadow-coffee"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/feature-placeholder.svg';
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="flex items-center mb-4">
              <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-coffee-medium to-coffee-dark text-white">
                {icon || <FaCoffee className="h-6 w-6" />}
              </div>
              <h2 className="text-3xl font-bold font-display text-coffee-espresso">{title}</h2>
            </div>
            <p className="text-coffee-dark text-lg mb-6">{description}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature list component
const FeatureList = ({ features }) => {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start p-4 bg-white rounded-lg border border-coffee-cream shadow-sm hover:shadow-coffee transition-all duration-200">
          <div className="text-coffee-accent mr-4 mt-1">
            <FaCheckCircle />
          </div>
          <div>
            <h4 className="font-bold text-coffee-dark">{feature.title}</h4>
            <p className="text-coffee-medium text-sm">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const FeaturesPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <PublicHero
        title="Powerful Features"
        subtitle="Everything you need to manage your agile workflow and boost team productivity"
      />

      {/* Features Overview */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display text-coffee-espresso mb-6">
            One platform for all your Scrum needs
          </h2>
          <p className="text-coffee-dark text-lg max-w-3xl mx-auto mb-12">
            Daily Grind provides a complete suite of tools designed specifically for agile teams. 
            Focus on delivering value, not managing complicated software.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaClipboardList className="h-8 w-8" />,
                title: "Ticket Management",
                description: "Create, organize, and track tickets through your workflow with ease."
              },
              {
                icon: <FaCalendarAlt className="h-8 w-8" />,
                title: "Sprint Planning",
                description: "Plan and manage sprints with visual boards and automated workflows."
              },
              {
                icon: <FaChartLine className="h-8 w-8" />,
                title: "Analytics & Reporting",
                description: "Gain insights with built-in reports and customizable dashboards."
              },
              {
                icon: <FaComments className="h-8 w-8" />,
                title: "Team Collaboration",
                description: "Built-in comments, mentions, and notifications keep everyone in sync."
              },
              {
                icon: <FaClock className="h-8 w-8" />,
                title: "Time Tracking",
                description: "Track time spent on tasks with integrated timers and reports."
              },
              {
                icon: <FaSyncAlt className="h-8 w-8" />,
                title: "Retrospectives",
                description: "Run effective sprint retrospectives with built-in tools and templates."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-coffee hover:shadow-coffee-hover transition-all duration-300 border border-coffee-light/20 transform hover:-translate-y-1">
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-coffee-medium to-coffee-dark text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-coffee-dark font-display mb-3">{feature.title}</h3>
                <p className="text-coffee-medium">{feature.description}</p>
              </div>
            ))}
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

      {/* Detailed Feature Sections */}
      <FeatureSection
        title="Intuitive Ticket Management"
        description="Create, organize, and prioritize tickets with our intuitive interface. No more complicated setups or confusing workflows."
        image="/images/dashboard-preview.png"
        imageAlt="Ticket management dashboard"
        icon={<FaClipboardList className="h-6 w-6" />}
      >
        <FeatureList features={[
          { 
            title: "Custom Ticket Fields",
            description: "Customize your tickets with fields that match your team's workflow."
          },
          { 
            title: "Drag & Drop Interface",
            description: "Move tickets through your workflow with simple drag and drop actions."
          },
          { 
            title: "Priority Management",
            description: "Set and visualize priorities to focus on what matters most."
          },
          { 
            title: "Rich Text Descriptions",
            description: "Add detailed descriptions with formatting, images, and links."
          }
        ]} />
      </FeatureSection>

      <FeatureSection
        title="Sprint Planning & Execution"
        description="Plan sprints with confidence using our visual planning tools. Track progress and adjust as needed to keep your team on target."
        image="/images/dashboard-preview.png"
        imageAlt="Sprint planning board"
        reverse={true}
        icon={<FaCalendarAlt className="h-6 w-6" />}
      >
        <FeatureList features={[
          { 
            title: "Visual Sprint Boards",
            description: "Plan and manage your sprints with customizable kanban boards."
          },
          { 
            title: "Story Point Estimation",
            description: "Estimate effort with story points and track team velocity over time."
          },
          { 
            title: "Sprint Burndown Charts",
            description: "Track your sprint progress with real-time burndown charts."
          },
          { 
            title: "Sprint Goals",
            description: "Define and track sprint goals to keep the team focused."
          }
        ]} />
      </FeatureSection>

      <FeatureSection
        title="Actionable Analytics"
        description="Get the insights you need to improve with our powerful but simple analytics. Identify bottlenecks and celebrate wins with data-driven insights."
        image="/images/dashboard-preview.png"
        imageAlt="Analytics dashboard"
        icon={<FaChartLine className="h-6 w-6" />}
      >
        <FeatureList features={[
          { 
            title: "Team Velocity Tracking",
            description: "Track your team's velocity across sprints to improve planning."
          },
          { 
            title: "Cycle Time Analysis",
            description: "Identify bottlenecks by analyzing how long tasks spend in each stage."
          },
          { 
            title: "Custom Dashboards",
            description: "Build custom dashboards to visualize the metrics most important to you."
          },
          { 
            title: "Export & Share Reports",
            description: "Export reports as PDFs or share links with stakeholders."
          }
        ]} />
      </FeatureSection>

      <FeatureSection
        title="Team Collaboration Tools"
        description="Keep everyone on the same page with built-in collaboration features. Comments, mentions, and notifications make teamwork seamless."
        image="/images/dashboard-preview.png"
        imageAlt="Collaboration features"
        reverse={true}
        icon={<FaUsers className="h-6 w-6" />}
      >
        <FeatureList features={[
          { 
            title: "Ticket Comments & Discussions",
            description: "Have focused discussions right where the work happens."
          },
          { 
            title: "@mentions & Notifications",
            description: "Bring the right people into conversations with @mentions."
          },
          { 
            title: "File Attachments",
            description: "Attach files, images, and documents to tickets for easy reference."
          },
          { 
            title: "User Assignments",
            description: "Assign tickets to team members with clear ownership."
          }
        ]} />
      </FeatureSection>

      {/* Advanced Features Section */}
      <div className="py-16 bg-coffee-cream/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-coffee-espresso mb-4">
              Advanced Features
            </h2>
            <p className="text-coffee-dark text-lg max-w-3xl mx-auto">
              Take your team's productivity to the next level with these powerful capabilities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FaCode />,
                title: "API Access",
                description: "Connect Daily Grind to your other tools with our comprehensive API."
              },
              {
                icon: <FaShieldAlt />,
                title: "Enterprise Security",
                description: "Keep your data secure with SSO, 2FA, and role-based permissions."
              },
              {
                icon: <FaMobile />,
                title: "Mobile Apps",
                description: "Stay productive on the go with our iOS and Android apps."
              },
              {
                icon: <FaSearch />,
                title: "Advanced Search",
                description: "Find exactly what you need with powerful search capabilities."
              },
              {
                icon: <FaBell />,
                title: "Smart Notifications",
                description: "Get notified about what matters most to you and your role."
              },
              {
                icon: <FaRocket />,
                title: "Automations",
                description: "Automate routine tasks with customizable triggers and actions."
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start p-6 bg-white rounded-xl shadow-coffee hover:shadow-coffee-hover transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-coffee-medium to-coffee-dark text-white rounded-xl mr-4 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-coffee-dark font-display mb-2">{feature.title}</h3>
                  <p className="text-coffee-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-coffee-espresso mb-4">
              How We Compare
            </h2>
            <p className="text-coffee-dark text-lg max-w-3xl mx-auto">
              See how Daily Grind stacks up against other solutions
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-coffee-dark text-white">
                  <th className="p-4 text-left rounded-tl-lg">Feature</th>
                  <th className="p-4 text-center bg-coffee-accent">Daily Grind</th>
                  <th className="p-4 text-center">Generic Tool A</th>
                  <th className="p-4 text-center rounded-tr-lg">Generic Tool B</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Agile-focused", dailyGrind: true, toolA: false, toolB: true },
                  { name: "Custom fields", dailyGrind: true, toolA: true, toolB: true },
                  { name: "Built-in time tracking", dailyGrind: true, toolA: false, toolB: false },
                  { name: "Sprint retrospectives", dailyGrind: true, toolA: false, toolB: true },
                  { name: "No complex setup", dailyGrind: true, toolA: false, toolB: false },
                  { name: "Affordable pricing", dailyGrind: true, toolA: false, toolB: true },
                  { name: "Responsive support", dailyGrind: true, toolA: true, toolB: false }
                ].map((row, index) => (
                  <tr key={index} className={`border-b border-coffee-cream/30 ${index % 2 === 1 ? 'bg-coffee-light/5' : 'bg-white'}`}>
                    <td className="p-4 font-medium text-coffee-dark">{row.name}</td>
                    <td className="p-4 text-center text-coffee-accent font-bold">
                      {row.dailyGrind ? '✓' : '✗'}
                    </td>
                    <td className="p-4 text-center text-coffee-medium">
                      {row.toolA ? '✓' : '✗'}
                    </td>
                    <td className="p-4 text-center text-coffee-medium">
                      {row.toolB ? '✓' : '✗'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-coffee-cream/10">
                  <td className="p-4 font-bold text-coffee-dark rounded-bl-lg">Overall Best For Agile Teams</td>
                  <td className="p-4 text-center text-coffee-accent font-bold bg-coffee-cream/20">
                    ★★★★★
                  </td>
                  <td className="p-4 text-center text-coffee-medium">
                    ★★★☆☆
                  </td>
                  <td className="p-4 text-center text-coffee-medium rounded-br-lg">
                    ★★★★☆
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-coffee-dark to-coffee-medium overflow-hidden">
        <div className="absolute inset-0 coffee-pattern-bg opacity-5"></div>
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display tracking-tight text-white sm:text-4xl mb-6">
            Ready to simplify your workflow?
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

      <PublicFooter currentPage="/features" />
    </div>
  );
};

export default FeaturesPage;