import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiImage, FiAward, FiClock, FiCheck, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi';
import qrCodeImage from '../assets/qr-code.jpeg';

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();

  const premiumPlans = [
    {
      id: 'basic',
      name: 'Basic',
      subtitle: 'Starter',
      price: '₹49',
      priceMax: '₹79',
      color: 'emerald',
      features: [
        { icon: FiImage, text: '3 image uploads' },
        { icon: FiAward, text: '1 competition' },
        { icon: FiStar, text: 'Premium badge' },
        { icon: FiClock, text: '10 days' },
      ],
      benefits: ['Feels almost free', 'Best for trying']
    },
    {
      id: 'advance',
      name: 'Advance',
      subtitle: 'Most Popular',
      price: '₹149',
      priceMax: '₹199',
      color: 'blue',
      popular: true,
      features: [
        { icon: FiImage, text: '10 image uploads' },
        { icon: FiAward, text: '5 competitions' },
        { icon: FiStar, text: 'Premium badge' },
        { icon: FiClock, text: '30 days' },
      ],
      benefits: ['Best value', 'Most chosen']
    },
    {
      id: 'elite',
      name: 'Elite',
      subtitle: 'Lifetime',
      price: '₹299',
      priceMax: '',
      color: 'violet',
      features: [
        { icon: FiImage, text: '25 image uploads' },
        { icon: FiAward, text: '15 competitions' },
        { icon: FiStar, text: 'Premium badge' },
        { icon: FiTrendingUp, text: 'Lifetime' },
      ],
      benefits: ['One-time payment', 'Forever access']
    }
  ];

  const handlePlanSelect = (planId) => {
    navigate(`/payment/${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-4 shadow-xl shadow-amber-500/20">
            <FiZap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Upgrade to Premium
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Unlock exclusive features and elevate your college anonymous experience
          </p>
        </div>

        {/* Already Premium Banner */}
        {isPremium && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 mb-8 text-white shadow-xl shadow-amber-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiStar className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    You're a Premium Member!
                  </h2>
                  <p className="text-amber-100">
                    Valid until {new Date(user.premiumExpiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 bg-white/10 rounded-xl px-6 py-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.premiumUsage?.imageUploads || 0}</div>
                  <div className="text-xs text-amber-100">Images Used</div>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.premiumLimits?.imageUploads || 10}</div>
                  <div className="text-xs text-amber-100">Limit</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {premiumPlans.map((plan) => {
            const Icon = plan.icon || FiStar;
            const colorMap = {
              emerald: { 
                bg: 'bg-emerald-500', 
                text: 'text-emerald-600', 
                light: 'bg-emerald-50',
                gradient: 'from-emerald-500 to-teal-500',
                shadow: 'shadow-emerald-500/20'
              },
              blue: { 
                bg: 'bg-blue-500', 
                text: 'text-blue-600', 
                light: 'bg-blue-50',
                gradient: 'from-blue-500 to-indigo-500',
                shadow: 'shadow-blue-500/20'
              },
              violet: { 
                bg: 'bg-violet-500', 
                text: 'text-violet-600', 
                light: 'bg-violet-50',
                gradient: 'from-violet-500 to-purple-500',
                shadow: 'shadow-violet-500/20'
              }
            };
            const colors = colorMap[plan.color] || colorMap.blue;
            
            return (
              <div 
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20' 
                    : 'shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-px right-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-b-xl z-10 shadow-lg">
                    ⭐ Most Popular
                  </div>
                )}
                
                {/* Plan Header */}
                <div className={`bg-gradient-to-br ${colors.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    {plan.popular && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Best Value</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-white/80 text-sm">{plan.subtitle}</p>
                </div>
                
                {/* Plan Body */}
                <div className="p-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-slate-800">{plan.price}</span>
                    {plan.priceMax && (
                      <span className="text-lg text-slate-400 line-through">{plan.priceMax}</span>
                    )}
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${colors.light} rounded-lg flex items-center justify-center`}>
                            <FeatureIcon className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <span className="text-slate-600 text-sm">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanSelect(plan.id);
                    }}
                    className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${colors.bg} hover:shadow-lg ${colors.shadow}`}
                  >
                    Get {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Why Go Premium?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <FiImage className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">More Image Uploads</h3>
              <p className="text-slate-500 text-sm">Add visuals to your posts for better engagement</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <FiAward className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Create Competitions</h3>
              <p className="text-slate-500 text-sm">Host polls and competitions for your college</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <FiShield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Premium Badge</h3>
              <p className="text-slate-500 text-sm">Stand out with an exclusive badge</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Priority Access</h3>
              <p className="text-slate-500 text-sm">Get early access to new features</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold text-center mb-8">How to Get Premium</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Select a Plan</h3>
              <p className="text-slate-400 text-sm">Choose the plan that suits you best</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Make Payment</h3>
              <p className="text-slate-400 text-sm">Scan QR code and complete payment</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Screenshot</h3>
              <p className="text-slate-400 text-sm">Upload payment proof on next page</p>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Payment Details</h2>
          
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
            {/* QR Code */}
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 mb-3">Scan with any UPI App</p>
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 inline-block">
                <img 
                  src={qrCodeImage} 
                  alt="UPI QR Code" 
                  className="w-48 h-48 object-contain mx-auto rounded-lg"
                />
              </div>
              <p className="text-sm text-slate-500 mt-3 font-mono bg-slate-100 px-4 py-2 rounded-lg">
                8824780800@hdfc
              </p>
            </div>

            {/* Instructions */}
            <div className="flex-1 max-w-md">
              <h3 className="font-semibold text-slate-800 mb-4 text-lg">After Payment:</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                  <span className="text-slate-600">Take a screenshot of your payment confirmation</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                  <span className="text-slate-600">Click on your desired plan above</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                  <span className="text-slate-600">Upload the screenshot on the next page</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                  <span className="text-slate-600">Wait up to 24 hours for manual verification</span>
                </li>
              </ol>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm flex items-center gap-2">
                  <FiClock className="w-5 h-5" />
                  Premium is manually verified. You'll receive a notification once activated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Questions? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;

