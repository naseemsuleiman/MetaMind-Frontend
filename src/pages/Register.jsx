// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiBook } from 'react-icons/fi';
import { GiThink } from 'react-icons/gi';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    learningStyle: 'balanced',
    neurodiversityProfile: 'none'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ FIXED: Changed 'register' to 'registerUser' to match AuthContext
  const { registerUser } = useAuth(); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const userData = {
    user: {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName
    },
    learning_style: formData.learningStyle,
    // Try sending just the string if your model isn't set up for nested JSON objects
    neurodiversity_profile: JSON.stringify({ profile: formData.neurodiversityProfile }), 
    preferred_study_times: []
  };

    // ✅ FIXED: Calling the correct function name
    const result = await registerUser(userData);

    if (result.success) {
      navigate('/login'); // Redirect to login after successful registration
    } else {
      const errorMsg =
        result.error?.detail ||
        result.error?.user?.username?.[0] ||
        result.error?.user?.password?.[0] ||
        result.error?.learning_style?.[0] ||
        result.error?.neurodiversity_profile?.[0] ||
        'Registration failed';
      setError(errorMsg);
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-light to-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Left Side - Info */}
          <div className="md:w-2/5 bg-gradient-to-b from-mindful-blue to-cognitive-teal p-8 text-white">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <GiThink className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold ml-4">MetaMind</h1>
            </div>
            
            <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold">1</span>
                </div>
                <p>Tell us about yourself</p>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold">2</span>
                </div>
                <p>Set your learning preferences</p>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold">3</span>
                </div>
                <p>Start your metacognitive journey</p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <p className="text-sm italic">
                "MetaMind doesn't just teach subjects—it teaches you how you learn best."
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-3/5 p-8">
            <h2 className="text-3xl font-bold text-metacognitive-gray mb-2">
              Join MetaMind
            </h2>
            <p className="text-gray-600 mb-8">
              Create your account to start optimizing your learning process
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-2" />
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-2" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="johndoe_learner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiLock className="inline mr-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiLock className="inline mr-2" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiBook className="inline mr-2" />
                    Learning Style
                  </label>
                  <select
                    name="learningStyle"
                    value={formData.learningStyle}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="visual">Visual Learner</option>
                    <option value="auditory">Auditory Learner</option>
                    <option value="kinesthetic">Kinesthetic Learner</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GiThink className="inline mr-2" />
                    Neurodiversity Profile
                  </label>
                  <select
                    name="neurodiversityProfile"
                    value={formData.neurodiversityProfile}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="none">None</option>
                    <option value="adhd_traits">ADHD traits</option>
                    <option value="autism_spectrum">Autism spectrum</option>
                    <option value="dyslexia">Dyslexia</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-mindful-blue focus:ring-mindful-blue border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-mindful-blue hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-mindful-blue hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-mindful-blue font-semibold hover:underline">
                    Sign in
                  </Link>
                  
<Link to="/" className="text-mindful-blue hover:underline">
  ← Back to Home
</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;