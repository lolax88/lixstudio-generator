export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out logo generation',
      features: [
        '5 logo generations per day',
        '3 design patterns',
        'SVG download',
        'Basic color palettes',
        'Icon-only variant',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For freelancers and small businesses',
      features: [
        'Unlimited logo generations',
        'All 7 design patterns',
        'SVG + PNG download',
        'All color palettes',
        'All 4 layout variants',
        'Custom color input',
        'Priority generation',
      ],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$49',
      period: '/month',
      description: 'For agencies and design teams',
      features: [
        'Everything in Pro',
        'Brand kit management',
        'Batch generation (10+ logos)',
        'White-label exports',
        'API access',
        'Team collaboration',
        'Dedicated support',
        'Custom design patterns',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-sm text-violet-400 font-medium tracking-wider uppercase">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? 'bg-gradient-to-b from-violet-950/40 to-gray-900/50 border-violet-500/50 shadow-xl shadow-violet-500/10'
                  : 'bg-gray-900/50 border-gray-800/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="mt-3 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25'
                    : 'border border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
