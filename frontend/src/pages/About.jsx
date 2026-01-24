 import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShield, FiHeart, FiAward, FiMessageSquare, FiLock, FiMail, FiEye, FiCheckCircle, FiStar } from 'react-icons/fi';
import FeedbackModal from '../components/FeedbackModal';

const About = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About CollegeAnon</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A safe, anonymous platform for college students to share their thoughts, 
            connect with peers, and build a community based on ideas, not identities.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <FiHeart className="w-6 h-6 text-red-500 mr-2" />
            Our Mission
          </h2>
          <p className="text-gray-600 mb-4">
            CollegeAnon was created to provide college students with a platform where they can 
            express themselves freely without fear of judgment or social consequences. We believe 
            that anonymous expression can foster genuine connections, spark important conversations, 
            and help students feel less alone in their experiences.
          </p>
          <p className="text-gray-600">
            Our goal is to create a supportive community where every student's voice matters, 
            regardless of their background, social status, or popularity.
          </p>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiStar className="w-6 h-6 text-yellow-500 mr-2" />
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Anonymous Posting</h3>
                <p className="text-gray-600 text-sm">Share your thoughts with complete anonymity using your unique Anonymous ID.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiShield className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Content Moderation</h3>
                <p className="text-gray-600 text-sm">All posts go through AI moderation to ensure community guidelines are followed.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FiMessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Anonymous Comments</h3>
                <p className="text-gray-600 text-sm">Engage in discussions without revealing your identity.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FiAward className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">College Competitions</h3>
                <p className="text-gray-600 text-sm">Participate in college-wide competitions and showcase your talents.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FiLock className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Privacy First</h3>
                <p className="text-gray-600 text-sm">Your personal information is never shared with other users.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <FiMail className="w-5 h-5 text-teal-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Email Verification</h3>
                <p className="text-gray-600 text-sm">Verified college emails ensure authentic student participation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiEye className="w-6 h-6 text-indigo-500 mr-2" />
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Sign Up with College Email</h3>
                <p className="text-gray-600 text-sm">Register using your college email address to verify you're a student.</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Get Your Anonymous ID</h3>
                <p className="text-gray-600 text-sm">Receive a unique anonymous ID that represents you on the platform.</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Start Posting</h3>
                <p className="text-gray-600 text-sm">Share posts, stories, and participate in discussions anonymously.</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Engage & Connect</h3>
                <p className="text-gray-600 text-sm">Comment on posts, like content, and join college competitions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiCheckCircle className="w-6 h-6 text-green-500 mr-2" />
            Community Guidelines
          </h2>
          <p className="text-gray-600 mb-4">
            To maintain a safe and supportive environment, we ask all users to follow these guidelines:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Be respectful and kind to other community members</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>No harassment, hate speech, or bullying</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>No sharing of personal information about yourself or others</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>No spam, advertisements, or promotional content</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>No content that promotes violence or self-harm</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Report content that violates community guidelines</span>
            </li>
          </ul>
        </div>

        {/* Moderation Process */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiShield className="w-6 h-6 text-blue-500 mr-2" />
            Moderation Process
          </h2>
          <p className="text-gray-600 mb-4">
            We take content moderation seriously to ensure a safe environment for all users. 
            Here's how our moderation process works:
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">1. AI Pre-Moderation</h3>
              <p className="text-gray-600 text-sm">
                All posts are automatically scanned using AI moderation to detect potentially 
                harmful content before publication.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">2. Pending Review</h3>
              <p className="text-gray-600 text-sm">
                Posts are placed in a pending state until approved by our moderation team. 
                This typically takes a few hours.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">3. User Reporting</h3>
              <p className="text-gray-600 text-sm">
                Users can report posts that violate guidelines. All reports are reviewed 
                by our moderation team.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">4. Action on Violations</h3>
              <p className="text-gray-600 text-sm">
                Violators may have content removed, receive warnings, or face account 
                suspension/termination depending on the severity of the violation.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <FiMessageSquare className="w-6 h-6 text-primary-600 mr-2" />
            Have Feedback or Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            We're always looking for ways to improve CollegeAnon. If you have any suggestions, 
            questions, or concerns, we'd love to hear from you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="btn btn-secondary"
            >
              Submit Feedback
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} CollegeAnon. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for college students everywhere.</p>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
};

export default About;

