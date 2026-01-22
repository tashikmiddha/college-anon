import { useSelector } from 'react-redux';
import { FiStar, FiImage, FiAward, FiClock, FiMail, FiCheck, FiUsers, FiTrendingUp } from 'react-icons/fi';
import qrCodeImage from '../assets/qr-code.jpeg';

const Premium = () => {
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
        { icon: FiClock, text: 'Validity: Optional / Lifetime' },
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
        { icon: FiStar, text: 'Highlighted premium badge (optional)' },
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
        { icon: FiImage, text: 'Image uploads: Unlimited or 25' },
        { icon: FiAward, text: 'Competitions: Unlimited or 15' },
        { icon: FiUsers, text: 'Featured placement (optional)' },
        { icon: FiAward, text: '"Elite" badge (optional)' },
      ],
      benefits: [
        'Premium feel',
        'Few users, high engagement',
        'Covers server + admin effort'
      ]
    }
  ];

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <FiStar className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Upgrade to Premium</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Unlock exclusive features and enhance your anonymous college experience
        </p>
      </div>

      {/* Already Premium Banner */}
      {isPremium && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FiStar className="w-6 h-6" />
                You're a Premium Member!
              </h2>
              <p className="mt-1 opacity-90">
                Your premium access is valid until {new Date(user.premiumExpiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Image Uploads</div>
              <div className="text-2xl font-bold">
                {user.premiumUsage?.imageUploads || 0} / {user.premiumLimits?.imageUploads || 10}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Plans Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h2>
        <p className="text-gray-600 text-center mb-8">Select the perfect premium plan for your needs</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {premiumPlans.map((plan) => {
            const Icon = plan.icon;
            const isGreen = plan.color === 'green';
            const isBlue = plan.color === 'blue';
            const isPurple = plan.color === 'purple';
            
            return (
              <div 
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-xl' 
                    : 'border border-gray-200 shadow-lg'
                } ${isGreen ? 'bg-gradient-to-b from-green-50 to-white' : isBlue ? 'bg-gradient-to-b from-blue-50 to-white' : 'bg-gradient-to-b from-purple-50 to-white'}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ⭐ Most Popular
                  </div>
                )}
                
                {/* Plan Header */}
                <div className={`p-6 text-center border-b ${
                  isGreen ? 'border-green-100' : isBlue ? 'border-blue-100' : 'border-purple-100'
                }`}>
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
                    isGreen ? 'bg-green-100' : isBlue ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <Icon className={`w-7 h-7 ${
                      isGreen ? 'text-green-600' : isBlue ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${
                    isGreen ? 'text-green-700' : isBlue ? 'text-blue-700' : 'text-purple-700'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>
                  
                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    {plan.priceMax && (
                      <span className="text-lg text-gray-400 line-through ml-2">{plan.priceMax}</span>
                    )}
                  </div>
                </div>
                
                {/* Target Audience */}
                <div className="px-6 py-4 bg-white/50">
                  <p className="text-sm text-gray-600 text-center">
                    <strong>Who it's for:</strong> {plan.targetAudience}
                  </p>
                </div>
                
                {/* Limits */}
                <div className="p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Limits</p>
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
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Why this works</p>
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
                  <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                      : isGreen
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl'
                  }`}>
                    Select {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Feature 1 */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiImage className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Image Uploads in Posts</h3>
              <p className="text-gray-600">
                Add images to your anonymous posts to make them more engaging and expressive.
                Share photos, memes, and visual content with your college community.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiAward className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Create Competitions</h3>
              <p className="text-gray-600">
                Launch exciting polls and competitions between two options. Get your
                college peers to vote and see who wins!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">How to Get Premium</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Scan QR Code</h3>
            <p className="text-sm text-gray-600">
              Scan the UPI QR code below to make your payment
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Send Screenshot</h3>
            <p className="text-sm text-gray-600">
              Take a screenshot of your payment confirmation
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Get Approved</h3>
            <p className="text-sm text-gray-600">
              Admin will verify and grant you premium within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Code */}
        <div className="card p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Scan to Pay</h3>
          <div className="bg-white p-4 rounded-lg inline-block shadow-sm border">
            <img 
              src={qrCodeImage} 
              alt="UPI QR Code" 
              className="w-48 h-48 object-contain mx-auto rounded-lg"
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            UPI ID: <span className="font-mono">8824780800@hdfc</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="card p-8">
          <h3 className="text-xl font-semibold mb-4">After Payment</h3>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span className="text-gray-700">
                Take a screenshot of your payment confirmation
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span className="text-gray-700">
                Email the screenshot to <strong>tashikmiddha@gmail.com</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span className="text-gray-700">
                Include your registered email/username in the email
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <span className="text-gray-700">
                Wait for admin verification (within 24 hours)
              </span>
            </li>
          </ol>

          <div className="mt-6 pt-6 border-t">
            <a
              href="mailto:tashikmiddha@gmail.com"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <FiMail className="w-5 h-5" />
              Send Email
            </a>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4 border">
        <div className="flex gap-2">
          <FiClock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Premium is manually verified by the admin for safety.
            Please allow up to 24 hours for verification. Once approved, you'll receive
            a notification and can access all premium features immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;

