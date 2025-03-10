import { useState, useRef, useEffect } from 'react';
import { Apple, CheckCircle2 } from 'lucide-react';

// Simplified screen types
type Screen = 'landing' | 'registration_form' | 'verify' | 'success' | 'apple_signin';

const LUXURY_BRANDS = [
  'Louis Vuitton',
  'Chanel',
  'Gucci',
  'Hermès',
  'Dior',
  'Prada',
  'Burberry',
  'Versace',
  'Balenciaga',
  'Givenchy'
];

// Phone number formatting and validation
const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '');
  
  // Format as 05X XXX XXXX
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
  return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 9)}`;
};

const validateUAEPhone = (phone: string) => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 9 && numbers.startsWith('05');
};

function App() {
  // Simplified state management
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [profile, setProfile] = useState({
    email: '',
    salutation: '',
    firstName: '',
    surname: '',
    phone: '',
    birthday: '',
    favoriteDesigners: ''
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [isViaSocialAuth, setIsViaSocialAuth] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Add ref for designer input container
  const designerInputRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (designerInputRef.current && !designerInputRef.current.contains(event.target as Node)) {
        setShowBrandSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add useRef for OTP inputs
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Add countdown timer effect
  useEffect(() => {
    let timer: number;
    if (currentScreen === 'verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentScreen, countdown]);

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setVerificationError('');

    // Auto-advance to next input
    if (value !== '' && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setVerificationError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentScreen('success');
    } catch (error) {
      setVerificationError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setCanResend(false);
    setCountdown(60);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return `+971 ${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 9)}`;
  };

  // Single verification handler
  const handleVerification = () => {
    if (!profile.salutation || !profile.firstName || !profile.surname || !profile.phone) {
      // Show error for missing required fields
      alert('Please fill in all required fields');
      return;
    }

    if (!validateUAEPhone(profile.phone)) {
      // Show error for invalid phone
      alert('Please enter a valid UAE mobile number');
      return;
    }

    setCurrentScreen('verify');
  };

  // Auto-save profile changes
  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Updated profile change handler for phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setProfile(prev => ({ ...prev, phone: formattedPhone }));
    
    if (!formattedPhone) {
      setPhoneError('');
    } else if (!validateUAEPhone(formattedPhone)) {
      setPhoneError('Please enter a valid UAE mobile number (05X XXX XXXX)');
    } else {
      setPhoneError('');
    }
  };

  // Add email verification handler
  const handleEmailVerification = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEmailVerified(true);
  };

  // Modify social auth handler to set email as verified
  const handleSocialAuth = async (provider: 'apple' | 'google') => {
    try {
      // Simulate social auth data
      // In real app, this would come from the OAuth provider
      const mockSocialAuthData = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Update profile with social auth data
      setProfile(prev => ({
        ...prev,
        email: mockSocialAuthData.email,
        firstName: mockSocialAuthData.firstName,
        surname: mockSocialAuthData.lastName,
        // Reset other fields to empty
        salutation: '',
        phone: '',
        birthday: '',
        favoriteDesigners: ''
      }));

      // Set email as verified since it's verified by the social provider
      setIsEmailVerified(true);
      
      // Mark this as social auth flow
      setIsViaSocialAuth(true);

      // Skip directly to success/profile page
      setCurrentScreen('success');
    } catch (error) {
      console.error('Social auth failed:', error);
    }
  };

  const handleDesignerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleProfileChange('favoriteDesigners', value);

    if (value.length > 0) {
      const suggestions = LUXURY_BRANDS.filter(brand => 
        brand.toLowerCase().includes(value.toLowerCase()) &&
        !getSelectedBrands().includes(brand)
      );
      setBrandSuggestions(suggestions);
      setShowBrandSuggestions(suggestions.length > 0);
    } else {
      setShowBrandSuggestions(false);
    }
  };

  const selectBrand = (brand: string) => {
    const currentBrands = getSelectedBrands();
    if (!currentBrands.includes(brand)) {
      const newBrands = [...currentBrands, brand].join(', ');
      handleProfileChange('favoriteDesigners', newBrands);
    }
    setShowBrandSuggestions(false);
    // Clear the input
    const input = document.querySelector('input[placeholder="Favorite Designers (Optional)"]') as HTMLInputElement;
    if (input) input.value = '';
  };

  const removeBrand = (brandToRemove: string) => {
    const currentBrands = getSelectedBrands();
    const newBrands = currentBrands.filter(brand => brand !== brandToRemove).join(', ');
    handleProfileChange('favoriteDesigners', newBrands);
  };

  const getSelectedBrands = () => {
    return profile.favoriteDesigners
      ? profile.favoriteDesigners.split(',').map(brand => brand.trim())
      : [];
  };

  switch (currentScreen) {
    case 'landing':
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Register to Luxury Fashion</h1>
            
            {/* Social Auth Buttons */}
            <div className="space-y-4 mb-8">
              <button 
                onClick={() => setCurrentScreen('apple_signin')}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Apple size={20} />
                <span>Continue with Apple</span>
              </button>
              <button 
                onClick={() => handleSocialAuth('google')} 
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Add Google icon */}
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="block w-full px-4 py-3 border rounded-lg"
                placeholder="Email address"
                required
              />
              <button
                onClick={() => {
                  if (profile.email) {
                    setCurrentScreen('registration_form');
                  }
                }}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Continue
              </button>

              <div className="flex items-start gap-3 mt-6">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    id="newsletter"
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="newsletter" className="text-base font-medium text-gray-800">
                    Newsletter subscription
                  </label>
                  <p className="text-sm text-gray-600">
                    Receive announcements, recommendations, and updates about Luxury Fashion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'registration_form':
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Complete Registration</h1>
            
            {/* Combined Profile Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Email Section */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="block w-full px-4 py-3 border rounded-lg bg-gray-100"
                    placeholder="Email address"
                    required
                    disabled
                  />
                  {!isEmailVerified && !isViaSocialAuth && (
                    <p className="text-sm text-gray-600 mt-1">
                      We sent a verification link to your email. Click on it to verify your email, or{' '}
                      <button 
                        onClick={handleEmailVerification}
                        className="text-black underline"
                        type="button"
                      >
                        retry
                      </button>
                    </p>
                  )}
                </div>

                {/* Salutation Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Salutation *</label>
                  <div className="flex gap-6">
                    {['Mr', 'Mrs', 'Miss'].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="salutation"
                          value={option}
                          checked={profile.salutation === option}
                          onChange={(e) => handleProfileChange('salutation', e.target.value)}
                          className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                          required
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name Fields */}
                <div className="flex gap-4">
                  <div className="w-full">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      id="firstName"
                      type="text"
                      name="given-name"
                      autoComplete="given-name"
                      value={profile.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      className={`block w-full px-4 py-3 border rounded-lg ${isViaSocialAuth ? 'bg-gray-100' : ''}`}
                      placeholder="First Name"
                      required
                      disabled={isViaSocialAuth}
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      id="lastName"
                      type="text"
                      name="family-name"
                      autoComplete="family-name"
                      value={profile.surname}
                      onChange={(e) => handleProfileChange('surname', e.target.value)}
                      className={`block w-full px-4 py-3 border rounded-lg ${isViaSocialAuth ? 'bg-gray-100' : ''}`}
                      placeholder="Last Name"
                      required
                      disabled={isViaSocialAuth}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-gray-500 text-sm">🇦🇪 +971</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={handlePhoneChange}
                      className="block w-full pl-24 px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="05X XXX XXXX"
                      required
                    />
                  </div>
                  {phoneError && (
                    <p className="text-sm text-red-600">{phoneError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Format: 05X XXX XXXX (UAE mobile number) *
                  </p>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleVerification}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Continue
                </button>

                {/* Back Button */}
                <button
                  onClick={() => {
                    setProfile({
                      email: '',
                      salutation: '',
                      firstName: '',
                      surname: '',
                      phone: '',
                      birthday: '',
                      favoriteDesigners: ''
                    });
                    setIsViaSocialAuth(false);
                    setCurrentScreen('landing');
                  }}
                  className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
                >
                  Use a different registration method
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'verify':
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 relative">
            <button
              onClick={() => setCurrentScreen('registration_form')}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
              Enter OTP / Verify Your Number
            </h1>
            
            <div className="space-y-6">
              <p className="text-center text-gray-600 max-w-md mx-auto">
                Dear customer, to ensure successful delivery, please confirm your contact number by entering the verification code sent to
              </p>

              <p className="text-xl font-medium text-center text-gray-800">
                {formatPhoneForDisplay(profile.phone)}
              </p>

              <div className="flex justify-center gap-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpInputs.current[index] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && digit === '' && index > 0) {
                        otpInputs.current[index - 1]?.focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                ))}
              </div>

              {verificationError && (
                <p className="text-sm text-red-600 text-center">{verificationError}</p>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full bg-black text-white py-3 rounded-lg flex items-center justify-center"
                >
                  {isVerifying ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive a code?{' '}
                    {countdown > 0 ? (
                      <span>Wait {countdown} seconds</span>
                    ) : (
                      <button
                        onClick={handleResendCode}
                        className="text-black font-medium hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </p>

                  <p className="text-sm text-gray-600">
                    Incorrect phone number?{' '}
                    <button
                      onClick={() => setCurrentScreen('registration_form')}
                      className="text-black font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'success':
      return (
        <div className="min-h-screen bg-white">
          {/* Header */}
          <header className="border-b">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-4xl text-center font-mono mb-8">Luxury Fashion</h1>
              <p className="text-xs text-center text-gray-500 mb-8">THE DEFINITIVE HOME OF LUXURY</p>
              
              {/* Main Navigation */}
              <nav className="flex justify-center space-x-8 text-sm mb-4">
                <a href="#" className="hover:text-gray-600">NEW IN</a>
                <a href="#" className="hover:text-gray-600">DESIGNERS</a>
                <a href="#" className="hover:text-gray-600">CLOTHING</a>
                <a href="#" className="hover:text-gray-600">SHOES</a>
                <a href="#" className="hover:text-gray-600">SNEAKERS</a>
                <a href="#" className="hover:text-gray-600">ACCESSORIES</a>
                <a href="#" className="hover:text-gray-600">GROOMING</a>
                <a href="#" className="hover:text-gray-600">GIFTS</a>
                <a href="#" className="hover:text-gray-600">BAGS</a>
                <a href="#" className="hover:text-gray-600">WATCHES</a>
                <a href="#" className="hover:text-gray-600">HOME</a>
                <a href="#" className="hover:text-gray-600">THE EDITS</a>
                <a href="#" className="text-red-600">SALE</a>
              </nav>
            </div>
          </header>

          {/* Breadcrumb */}
          <div className="bg-gray-100 py-2">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-sm font-mono">
                <a href="#" className="text-gray-400">Home</a> &gt; <a href="#" className="text-gray-400">My Account</a> &gt; <span>My Profile</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex gap-8">
              {/* Sidebar */}
              <div className="w-64 flex-shrink-0">
                <nav className="space-y-1 border rounded-lg overflow-hidden">
                  <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <span>My Account</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <span>My Orders</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <span>My Favourite Designers</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <span>Amber Rewards</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <span>Store Credit</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 bg-gray-900 text-white">
                    <span>My Profile</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <span>My Address Book</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <span>Credit / Debit Cards</span>
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <span>Communication Preferences</span>
                  </a>
                </nav>
              </div>

              {/* Profile Form */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-2xl font-mono">My Profile</h2>
                  <div className="text-sm">
                    <span className="text-gray-500">Need help?</span>
                    <button className="ml-4 text-gray-900 font-medium">CALL US</button>
                    <button className="ml-4 text-gray-900 font-medium">WHATSAPP</button>
                  </div>
                </div>

                <form className="space-y-6 max-w-2xl">
                  {/* Salutation */}
                  <div>
                    <label className="block font-mono mb-2">Salutation:</label>
                    <div className="flex gap-6">
                      {['Mr', 'Mrs', 'Miss'].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="salutation"
                            value={option}
                            checked={profile.salutation === option}
                            onChange={(e) => handleProfileChange('salutation', e.target.value)}
                            className="w-4 h-4 border-2 border-gray-300"
                          />
                          <span className="ml-2 font-mono">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono mb-2">First Name:</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                        className="w-full p-2 border-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-mono mb-2">Last Name:</label>
                      <input
                        type="text"
                        value={profile.surname}
                        onChange={(e) => handleProfileChange('surname', e.target.value)}
                        className="w-full p-2 border-2 font-mono"
                      />
                    </div>
                  </div>

                  {/* Email and Phone side by side */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block font-mono">Email:</label>
                        {isEmailVerified && (
                          <span className="text-sm flex items-center gap-1">
                            Verified ✓
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          value={profile.email}
                          className="w-full p-2 border-2 font-mono bg-gray-100"
                          disabled
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 font-mono">click to change</p>
                      {!isEmailVerified && !isViaSocialAuth && (
                        <p className="text-sm text-gray-600 mt-1">
                          We sent a verification link to your email. Click on it to verify your email, or{' '}
                          <button 
                            onClick={handleEmailVerification}
                            className="text-black underline"
                            type="button"
                          >
                            retry
                          </button>
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block font-mono">Phone Number:</label>
                        {!isViaSocialAuth && (
                          <span className="text-sm flex items-center gap-1">
                            Verified ✓
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-24">
                          <input
                            type="text"
                            value="+971"
                            className="w-full p-2 border-2 font-mono bg-gray-100"
                            disabled
                          />
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={handlePhoneChange}
                            className="w-full p-2 border-2 font-mono"
                            placeholder="5X XXX XXXX"
                          />
                        </div>
                      </div>
                      {phoneError ? (
                        <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1 font-mono">click to change</p>
                      )}
                    </div>
                  </div>

                  {/* Birthday */}
                  <div>
                    <label className="block font-mono mb-2">Birthday:</label>
                    <input
                      type="date"
                      value={profile.birthday}
                      onChange={(e) => handleProfileChange('birthday', e.target.value)}
                      className="w-full p-2 border-2 font-mono"
                    />
                  </div>

                  {/* Shopping Preferences */}
                  <div>
                    <label className="block font-mono mb-2">Shopping Preferences:</label>
                    <div className="flex gap-6">
                      {['Women', 'Men', 'Kids', 'Beauty'].map((pref) => (
                        <label key={pref} className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 border-2 border-gray-300"
                          />
                          <span className="ml-2 font-mono">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 font-mono"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      );

    case 'apple_signin':
      return (
        // Semi-transparent overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <img src="/apple-logo.svg" alt="Apple" className="w-5 h-5" />
              <h1 className="text-xl font-medium">Sign in to Apple Account</h1>
              <button 
                onClick={() => setCurrentScreen('landing')}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* App Icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-teal-900 rounded-xl flex items-center justify-center">
                  <span className="text-4xl text-white">F</span>
                </div>
              </div>

              {/* Message */}
              <p className="text-xl text-center">
                Use your Apple Account to sign in to Luxury Fashion.
              </p>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Email or Phone Number</label>
                <input
                  type="text"
                  value="user@example.com"
                  className="w-full p-3 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => {
                    handleSocialAuth('apple');
                  }}
                  className="w-full py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Continue with Password
                </button>
                <button className="w-full py-3 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <span className="text-lg">👤</span> Sign in with Passkey
                </button>
                <p className="text-xs text-center text-gray-500">
                  Requires a device with iOS 17.
                </p>
              </div>

              {/* Forgot Password Link */}
              <div className="text-center">
                <a href="#" className="text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Privacy Notice */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  In setting up Sign in with Apple, information about your
                  interactions with Apple and this device may be used by
                  Apple to help prevent fraud.{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    See how your data is managed...
                  </a>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 text-center text-sm text-gray-600">
              <p>Copyright © 2025 Apple Inc. All rights reserved.</p>
              <a href="#" className="hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      );
  }
}

export default App;