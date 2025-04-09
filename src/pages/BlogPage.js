import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.js';
import Button from '../components/Button.js';
import PublicFooter from '../components/PublicFooter.js';
import PublicHero from '../components/PublicHero.js';
import { 
  FaCoffee, FaClock, FaSearch, FaTags, FaUser, 
  FaCalendarAlt, FaComment, FaArrowRight, 
  FaLinkedin, FaTwitter, FaFacebookF
} from 'react-icons/fa/index.js';
import '../styles/backgrounds.css';

// Blog post card component
const BlogPostCard = ({ post, featured = false }) => {
  return (
    <div className={`group relative overflow-hidden rounded-xl shadow-coffee hover:shadow-coffee-hover transition-all duration-300 bg-white ${featured ? 'lg:flex' : ''}`}>
      <div className={`overflow-hidden ${featured ? 'lg:w-1/2' : 'h-48 sm:h-56'}`}>
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/600x400?text=Daily+Grind+Blog';
          }}
        />
      </div>
      <div className={`p-6 ${featured ? 'lg:w-1/2' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
          {post.categories.map((category, idx) => (
            <span 
              key={idx} 
              className="text-xs font-medium px-2 py-1 rounded-full bg-coffee-light text-coffee-dark"
            >
              {category}
            </span>
          ))}
        </div>
        <h3 className={`${featured ? 'text-2xl' : 'text-xl'} font-bold font-display tracking-tight text-coffee-espresso mb-2`}>
          {post.title}
        </h3>
        <p className="text-coffee-medium mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-coffee-medium flex items-center justify-center text-white font-medium mr-2">
              {post.author.name.charAt(0)}
            </div>
            <span className="text-sm text-coffee-dark">{post.author.name}</span>
          </div>
          <span className="text-xs text-coffee-medium flex items-center">
            <FaCalendarAlt className="mr-1" /> {post.date}
          </span>
        </div>
        {featured && (
          <div className="mt-4">
            <Button
              variant="secondary"
              size="small"
              className="group-hover:bg-coffee-dark group-hover:text-white transition-colors duration-300"
            >
              Read more <FaArrowRight className="ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Blog category tag component
const CategoryTag = ({ name, active, onClick }) => {
  return (
    <button
      onClick={() => onClick(name)}
      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
        active 
        ? 'bg-coffee-medium text-white' 
        : 'bg-coffee-light/20 text-coffee-dark hover:bg-coffee-light'
      }`}
    >
      {name}
    </button>
  );
};

// Newsletter form component
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, we would send this to an API
    setSubmitted(true);
  };
  
  return (
    <div className="bg-coffee-cream/20 rounded-xl p-8 shadow-coffee">
      <div className="flex items-center mb-4">
        <FaCoffee className="text-coffee-accent mr-3 h-6 w-6" />
        <h3 className="font-bold font-display text-xl text-coffee-dark">The Daily Pour</h3>
      </div>
      <p className="text-coffee-medium mb-6">
        Subscribe to our newsletter for productivity tips, agile insights, and product updates.
      </p>
      
      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
          <p className="text-center">Thanks for subscribing! ☕</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-grow px-4 py-2 border border-coffee-cream rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-medium"
            />
            <Button 
              type="submit"
              variant="primary"
              className="bg-coffee-accent text-white hover:bg-coffee-dark"
            >
              Subscribe
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

// BlogPage component - main page
const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Dummy data for blog posts
  const blogPosts = [
    {
      id: 1,
      title: "Brewing Better Sprints: 5 Tips for Effective Planning",
      excerpt: "Learn how to keep your team focused and productive with these five essential sprint planning techniques that have helped our customers increase team velocity by 30% on average.",
      imageUrl: "/images/feature-placeholder.svg",
      author: { name: "Alex Morgan", role: "Product Specialist" },
      date: "April 5, 2025",
      categories: ["Agile", "Productivity"],
      featured: true
    },
    {
      id: 2,
      title: "From Chaos to Clarity: Organizing Your Backlog Like a Pro",
      excerpt: "A disorganized backlog can derail even the most talented teams. Discover how to structure and prioritize your tasks to maximize efficiency and deliver what matters most.",
      imageUrl: "/images/feature-placeholder.svg",
      author: { name: "Jamie Chen", role: "Scrum Master" },
      date: "March 28, 2025",
      categories: ["Backlog", "Organization"]
    },
    {
      id: 3,
      title: "The Ultimate Guide to Meaningful Sprint Retrospectives",
      excerpt: "Retrospectives should be more than just a formality. Learn how to run engaging retrospectives that lead to continuous improvement and stronger team dynamics.",
      imageUrl: "/images/feature-placeholder.svg",
      author: { name: "Taylor Singh", role: "Agile Coach" },
      date: "March 22, 2025",
      categories: ["Retrospectives", "Team Building"]
    },
    {
      id: 4,
      title: "Metrics That Matter: Measuring Team Performance Beyond Story Points",
      excerpt: "Story points are just the beginning. Explore the key metrics that can give you deeper insights into your team's performance and help you make data-driven decisions.",
      imageUrl: "/images/feature-placeholder.svg",
      author: { name: "Morgan Wilson", role: "Analytics Lead" },
      date: "March 15, 2025",
      categories: ["Analytics", "Team Performance"]
    },
    {
      id: 5,
      title: "Cross-Functional Collaboration: Breaking Down Team Silos",
      excerpt: "When development, design, and product teams work in isolation, projects suffer. Here's how to foster collaboration across disciplines for better outcomes.",
      imageUrl: "/images/feature-placeholder.svg",
      author: { name: "Casey Williams", role: "Product Manager" },
      date: "March 9, 2025",
      categories: ["Collaboration", "Team Building"]
    },
    {
      id: 6,
      title: "Automating Workflows: Save Time with Daily Grind's Integration Features",
      excerpt: "Learn how our integration capabilities can automate repetitive tasks and help your team focus on what they do best - creating great products.",
      imageUrl: "/images/feature-placeholder.svg",
      author: { name: "Jordan Lee", role: "Technical Writer" },
      date: "March 3, 2025",
      categories: ["Automation", "Integrations"]
    },
  ];
  
  // Extract unique categories
  const categories = ['All', ...new Set(blogPosts.flatMap(post => post.categories))];
  
  // Filter posts based on search query and active category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || post.categories.includes(activeCategory);
    
    return matchesSearch && matchesCategory;
  });
  
  // Separate featured post from regular posts
  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <PublicHero
        title="The Daily Grind Blog"
        subtitle="Fresh insights on productivity, agile methodologies, and team management"
      />

      {/* Blog Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Category Filter */}
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
            {/* Search bar */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute left-0 top-0 h-full pl-3 flex items-center justify-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-coffee-medium" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white border border-coffee-cream rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-coffee-medium focus:border-transparent"
                placeholder="Search articles..."
              />
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-coffee-dark">
                <FaTags className="inline-block mr-2" /> Categories:
              </span>
              {categories.map((category, index) => (
                <CategoryTag 
                  key={index} 
                  name={category} 
                  active={category === activeCategory}
                  onClick={setActiveCategory}
                />
              ))}
            </div>
          </div>
          
          {/* Main Content - Two Columns on larger screens */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Blog Posts - Larger Column */}
            <div className="lg:col-span-2 space-y-8">
              {filteredPosts.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-coffee text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-coffee-light/20 rounded-full flex items-center justify-center">
                    <FaCoffee className="h-8 w-8 text-coffee-medium" />
                  </div>
                  <h3 className="text-xl font-bold text-coffee-dark mb-2">No posts found</h3>
                  <p className="text-coffee-medium">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              ) : (
                <>
                  {/* Featured Post */}
                  {featuredPost && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold font-display mb-4 flex items-center">
                        <FaCoffee className="mr-2 text-coffee-accent" /> Featured Article
                      </h2>
                      <BlogPostCard post={featuredPost} featured={true} />
                    </div>
                  )}
                  
                  {/* Regular Posts Grid */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {regularPosts.map(post => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {regularPosts.length > 0 && (
                    <div className="flex justify-center pt-8">
                      <div className="flex shadow-sm rounded-md">
                        <button className="px-4 py-2 border border-coffee-cream bg-white text-coffee-medium rounded-l-md hover:bg-coffee-light/20">
                          Previous
                        </button>
                        <button className="px-4 py-2 border-t border-b border-coffee-cream bg-coffee-medium text-white">
                          1
                        </button>
                        <button className="px-4 py-2 border-t border-b border-coffee-cream bg-white text-coffee-dark hover:bg-coffee-light/20">
                          2
                        </button>
                        <button className="px-4 py-2 border-t border-b border-coffee-cream bg-white text-coffee-dark hover:bg-coffee-light/20">
                          3
                        </button>
                        <button className="px-4 py-2 border border-coffee-cream bg-white text-coffee-dark rounded-r-md hover:bg-coffee-light/20">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Sidebar - Smaller Column */}
            <div className="space-y-8">
              {/* Newsletter Signup */}
              <NewsletterForm />
              
              {/* Popular Tags */}
              <div className="bg-white rounded-xl p-6 shadow-coffee">
                <h3 className="font-bold font-display text-xl text-coffee-dark mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['Productivity', 'Agile', 'Sprint Planning', 'Workflow', 'Team Management', 'Retrospectives', 'Product Development', 'Analytics'].map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs font-medium px-3 py-1 rounded-full bg-coffee-light/20 text-coffee-dark hover:bg-coffee-light cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* About Blog */}
              <div className="bg-white rounded-xl p-6 shadow-coffee">
                <h3 className="font-bold font-display text-xl text-coffee-dark mb-4">About The Blog</h3>
                <p className="text-coffee-medium mb-4">
                  The Daily Grind Blog is where we share insights, tips, and best practices to help your team reach its full potential through effective agile methodologies.
                </p>
                <p className="flex items-center text-coffee-medium">
                  <FaClock className="mr-2 text-coffee-accent" /> Updated weekly
                </p>
              </div>
              
              {/* Social Media Links */}
              <div className="bg-white rounded-xl p-6 shadow-coffee">
                <h3 className="font-bold font-display text-xl text-coffee-dark mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-coffee-light/20 flex items-center justify-center text-coffee-dark hover:bg-coffee-medium hover:text-white transition-colors">
                    <FaTwitter />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-coffee-light/20 flex items-center justify-center text-coffee-dark hover:bg-coffee-medium hover:text-white transition-colors">
                    <FaLinkedin />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-coffee-light/20 flex items-center justify-center text-coffee-dark hover:bg-coffee-medium hover:text-white transition-colors">
                    <FaFacebookF />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter currentPage="/blog" />
    </div>
  );
};

export default BlogPage;