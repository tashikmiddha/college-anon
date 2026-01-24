import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiImage, FiAward, FiClock, FiCheck, FiUsers, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import qrCodeImage from '../assets/qr-code.jpeg';

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();

  // Premium Plans Data
  const premiumPlans = [
    {
      id: 'basic',
      name: 'BASIC',
      subtitle: 'Starter Premium',
      price: '₹49',
      priceMax: '₹79',
      color: 'green',
      icon: FiStar,
      popular: false,
      targetAudience: 'Curious users who just want to try premium',
      features: [
        { icon: FiImage, text: 'Image uploads: 3' },
        { icon: FiAward, text: 'Competitions: 1' },
        { icon: FiStar, text: 'Premium badge ' },
        { icon: FiClock, text: 'Validity: 10 days' },
      ],
      benefits: [
        'Feels almost free',
        'High conversion',
        'Low admin risk'
      ]
    },
    {
      id: 'advance',
      name: 'ADVANCE',
      subtitle: 'Most Popular',
      price: '₹149',
      priceMax: '₹199',
      color: 'blue',
      icon: FiTrendingUp,
      popular: true,
      targetAudience: 'Active users who want visibility & engagement',
      features: [
        { icon: FiImage, text: 'Image uploads: 10' },
        { icon: FiAward, text: 'Competitions: 5' },
        { icon: FiStar, text: 'Premium badge ' },
        { icon: FiClock, text: 'Validity: 30 days' },
      ],
      benefits: [
        'Best value-for-money',
        'Most students will choose this',
        'Easy to recommend'
      ]
    },
    {
      id: 'elite',
      name: 'ELITE',
      subtitle: 'Creator / Power User',
      price: '₹299',
      priceMax: '',
      color: 'purple',
      icon: FiAward,
      popular: false,
      targetAudience: 'Popular users, creators, or seniors',
      features: [
        { icon: FiImage, text: 'Image uploads: 25' },
        { icon: FiAward, text: 'Competitions: 15' },
        { icon: FiStar, text: 'Premium badge ' },
        { icon: FiClock, text: 'Validity: Lifetime' },
      ],
      benefits: [
        'Premium feel',
        'Few users, high engagement',
        'Covers server + admin effort'
      ]
    }
  ];

  const handlePlanSelect = (planId) => {
    navigate(`/payment/${planId}`);
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4 shadow-lg">
          <FiStar className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
          Upgrade to Premium
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Unlock exclusive features and enhance your anonymous college experience
        </p>
      </div>

      {/* Already Premium Banner */}
      {isPremium && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-8 mb-10 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 justify-center md:justify-start">
                <FiStar className="w-8 h-8 animate-pulse" />
                You're a Premium Member!
              </h2>
              <p className="mt-2 text-yellow-100 text-lg">
                Your premium access is valid until {new Date(user.premiumExpiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-6 bg-white/20 rounded-xl px-6 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{user.premiumUsage?.imageUploads || 0}</div>
                <div className="text-sm text-yellow-100">Images Used</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">{user.premiumLimits?.imageUploads || 10}</div>
                <div className="text-sm text-yellow-100">Images Limit</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Plans Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-3">Choose Your Plan</h2>
        <p className="text-gray-600 text-center mb-10 text-lg">Select the perfect premium plan for your needs</p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {premiumPlans.map((plan) => {
            const Icon = plan.icon;
            const isGreen = plan.color === 'green';
            const isBlue = plan.color === 'blue';
            const isPurple = plan.color === 'purple';
            
            return (
              <div 
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer group hover:scale-[1.03] hover:shadow-2xl ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-xl' 
                    : 'border border-gray-200 shadow-lg'
                } ${isGreen ? 'bg-gradient-to-b from-green-50 to-white' : isBlue ? 'bg-gradient-to-b from-blue-50 to-white' : 'bg-gradient-to-b from-purple-50 to-white'}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-4 py-2 rounded-bl-xl z-10">
                    ⭐ Most Popular
                  </div>
                )}
                
                {/* Premium Badge for already premium users */}
                {isPremium && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-4 py-2 rounded-br-xl z-10">
                    ✓ Active
                  </div>
                )}
                
                {/* Plan Header */}
                <div className={`p-6 text-center border-b ${
                  isGreen ? 'border-green-100' : isBlue ? 'border-blue-100' : 'border-purple-100'
                }`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-md transition-transform duration-300 group-hover:scale-110 ${
                    isGreen ? 'bg-gradient-to-br from-green-400 to-green-600' : isBlue ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-purple-600'
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold ${
                    isGreen ? 'text-green-700' : isBlue ? 'text-blue-700' : 'text-purple-700'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{plan.subtitle}</p>
                  
                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    {plan.priceMax && (
                      <span className="text-lg text-gray-400 line-through ml-2">{plan.priceMax}</span>
                    )}
                  </div>
                </div>
                
                {/* Target Audience */}
                <div className="px-6 py-4 bg-white/60">
                  <p className="text-sm text-gray-600 text-center">
                    <strong className="text-gray-700">Who it's for:</strong> {plan.targetAudience}
                  </p>
                </div>
                
                {/* Limits */}
                <div className="p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wider">Features</p>
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <FeatureIcon className={`w-5 h-5 ${
                            isGreen ? 'text-green-500' : isBlue ? 'text-blue-500' : 'text-purple-500'
                          }`} />
                          <span className="text-sm text-gray-700">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Why This Works */}
                <div className={`px-6 py-4 border-t ${
                  isGreen ? 'border-green-100' : isBlue ? 'border-blue-100' : 'border-purple-100'
                }`}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wider">Why this works</p>
                  <ul className="space-y-1">
                    {plan.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCheck className={`w-4 h-4 flex-shrink-0 ${
                          isGreen ? 'text-green-500' : isBlue ? 'text-blue-500' : 'text-purple-500'
                        }`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* CTA Button */}
                <div className="p-6 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanSelect(plan.id);
                    }}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isBlue 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                        : isGreen
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Select {plan.name} Plan
                      <FiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-3">Premium Benefits</h2>
        <p className="text-gray-600 text-center mb-10 text-lg">Everything you need to enhance your college experience</p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Feature 1 */}
          <div className="card p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-md">
                <FiImage className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Image Uploads in Posts</h3>
                <p className="text-gray-600">
                  Add images to your anonymous posts to make them more engaging and expressive.
                  Share photos, memes, and visual content with your college community.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-md">
                <FiAward className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Create Competitions</h3>
                <p className="text-gray-600">
                  Launch exciting polls and competitions between two options. Get your
                  college peers to vote and see who wins!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card p-8 mb-8 bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">How to Get Premium</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-2xl font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2 text-lg">Select a Plan</h3>
            <p className="text-sm text-gray-600">
              Choose the plan that best fits your needs from the options above
            </p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-2xl font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2 text-lg">Make Payment</h3>
            <p className="text-sm text-gray-600">
              Scan the QR code or use UPI ID to make your payment
            </p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-2xl font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2 text-lg">Upload & Get Access</h3>
            <p className="text-sm text-gray-600">
              Upload payment screenshot and get premium within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Payment Details</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="card p-8 text-center hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <span className="bg-green-100 p-2 rounded-lg">📱</span>
              Scan to Pay
            </h3>
            <div className="bg-white p-4 rounded-2xl inline-block shadow-md border border-gray-200 mb-4">
              <img 
                src={qrCodeImage} 
                alt="UPI QR Code" 
                className="w-56 h-56 object-contain mx-auto rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mb-2">UPI ID</p>
            <p className="font-mono text-lg font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg inline-block">
              8824780800@hdfc
            </p>
          </div>

          {/* Instructions */}
          <div className="card p-8 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg">📋</span>
              After Payment
            </h3>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  1
                </span>
                <span className="text-gray-700 pt-1">
                  Take a screenshot of your payment confirmation
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  2
                </span>
                <span className="text-gray-700 pt-1">
                  Upload the screenshot on the next page after selecting a plan
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  3
                </span>
                <span className="text-gray-700 pt-1">
                  Admin will verify and grant you premium within 24 hours
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  4
                </span>
                <span className="text-gray-700 pt-1">
                  You'll receive a notification when premium is activated
                </span>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> Select a plan above to proceed with payment and upload your screenshot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-10 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200 shadow-sm">
        <div className="flex gap-3">
          <FiClock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-900 font-semibold mb-1">Processing Time</p>
            <p className="text-sm text-amber-800">
              Premium is manually verified by the admin for safety. Please allow up to <strong>24 hours</strong> for verification. 
              Once approved, you'll receive a notification and can access all premium features immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;

