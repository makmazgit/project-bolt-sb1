import { useState, useRef, useEffect } from 'react';
import { Apple, CheckCircle2 } from 'lucide-react';

// Simplified screen types
type Screen = 'landing' | 'registration_form' | 'verify' | 'success';

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
      // Simulate social auth logic
      // In a real app, this would come from the OAuth provider
      setProfile(prev => ({
        ...prev,
        email: 'johndoe@icloud.com',
        firstName: 'John',
        surname: 'Doe'
      }));
      setIsEmailVerified(true);
      setIsViaSocialAuth(true);
      setCurrentScreen('registration_form');
    } catch (error) {
      console.error('Auth failed:', error);
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
                onClick={() => handleSocialAuth('apple')} 
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
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Salutation *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="salutation"
                        value="Mr"
                        checked={profile.salutation === 'Mr'}
                        onChange={(e) => handleProfileChange('salutation', e.target.value)}
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                        required
                      />
                      <span className="ml-2">Mr</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="salutation"
                        value="Mrs"
                        checked={profile.salutation === 'Mrs'}
                        onChange={(e) => handleProfileChange('salutation', e.target.value)}
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                      />
                      <span className="ml-2">Mrs</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="salutation"
                        value="Miss"
                        checked={profile.salutation === 'Miss'}
                        onChange={(e) => handleProfileChange('salutation', e.target.value)}
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                      />
                      <span className="ml-2">Miss</span>
                    </label>
                  </div>
                </div>

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

                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (Optional)</label>
                  <input
                    id="birthday"
                    type="date"
                    value={profile.birthday}
                    onChange={(e) => handleProfileChange('birthday', e.target.value)}
                    className="block w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div className="relative space-y-2" ref={designerInputRef}>
                  <label htmlFor="designers" className="block text-sm font-medium text-gray-700 mb-1">Favorite Luxury Brands (Optional)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {getSelectedBrands().map(brand => (
                      <span
                        key={brand}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                      >
                        {brand}
                        <button
                          onClick={() => removeBrand(brand)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    id="designers"
                    type="text"
                    onChange={handleDesignerInput}
                    onFocus={() => {
                      const suggestions = LUXURY_BRANDS.filter(
                        brand => !getSelectedBrands().includes(brand)
                      );
                      setBrandSuggestions(suggestions);
                      setShowBrandSuggestions(suggestions.length > 0);
                    }}
                    className="block w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="Favorite Designers (Optional)"
                  />
                  {showBrandSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {brandSuggestions.map((brand, index) => (
                        <button
                          key={brand}
                          onClick={() => selectBrand(brand)}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                            index !== brandSuggestions.length - 1 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleVerification}
                className="w-full bg-black text-white py-3 rounded-lg"
              >
                Continue
              </button>
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
              <h1 className="text-4xl text-center font-serif mb-8">LUXURY FASION</h1>
              <p className="text-xs text-center text-gray-500 mb-8">THE DEFINITIVE HOME OF LUXURY</p>
              
              {/* Main Navigation */}
              <nav className="flex justify-center space-x-8 text-sm mb-4">
                <span className="hover:text-gray-600">NEW IN</span>
                <span className="hover:text-gray-600">DESIGNERS</span>
                <span className="hover:text-gray-600">CLOTHING</span>
                <span className="hover:text-gray-600">SHOES</span>
                <span className="hover:text-gray-600">SNEAKERS</span>
                <span className="hover:text-gray-600">ACCESSORIES</span>
                <span className="hover:text-gray-600">GROOMING</span>
                <span className="hover:text-gray-600">GIFTS</span>
                <span className="hover:text-gray-600">BAGS</span>
                <span className="hover:text-gray-600">WATCHES</span>
                <span className="hover:text-gray-600">HOME</span>
                <span className="hover:text-gray-600">THE EDITS</span>
                <span className="text-red-600">SALE</span>
              </nav>
            </div>
          </header>

          {/* Breadcrumb */}
          <div className="bg-gray-100 py-2">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-sm text-gray-600">
                <span className="text-gray-400">Home</span> &gt; <span>My Account</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex gap-8">
              {/* Sidebar */}
              <div className="w-64 flex-shrink-0">
                <nav className="space-y-1">
                  <div className="bg-gray-900 text-white px-4 py-3 rounded">
                    <span>My Account</span>
                  </div>
                  <div className="px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <span>My Orders</span>
                  </div>
                  <div className="px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <span>My Favourite Designers</span>
                  </div>
                  <div className="px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <span>Loyalty Rewards</span>
                  </div>
                  <div className="px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <span>Store Credit</span>
                  </div>
                  <div className="px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <span>My Profile</span>
                  </div>
                  <div className="px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <span>My Address Book</span>
                  </div>
                  <div className="px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <span>Credit / Debit Cards</span>
                  </div>
                  <div className="px-4 py-3 text-gray-600 hover:bg-gray-50">
                    <span>Communication Preferences</span>
                  </div>
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-2xl font-medium">My Account</h2>
                  <div className="text-sm">
                    <span className="text-gray-500">Need help?</span>
                    <button className="ml-4 text-gray-900 font-medium">CALL US</button>
                    <button className="ml-4 text-gray-900 font-medium">WHATSAPP</button>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">YOUR RECENT ORDERS</h3>
                    <span className="text-orange-600 text-sm font-medium">VIEW ALL ORDERS</span>
                  </div>
                  <p className="text-gray-600">
                    You don't have any recent orders. For your purchase history, please visit My Orders.
                  </p>
                </div>

                {/* User Details */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">YOUR DETAILS</h3>
                    <span className="text-orange-600 text-sm font-medium">EDIT</span>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-gray-500 mb-1">First Name:</p>
                      <p className="text-gray-900">{profile.firstName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Last Name:</p>
                      <p className="text-gray-900">{profile.surname}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Email Address:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 group">
                          <p className="text-gray-900">{profile.email}</p>
                          {isEmailVerified && (
                            <div className="relative">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Verified
                              </div>
                            </div>
                          )}
                        </div>
                        {!isEmailVerified && !isViaSocialAuth && (
                          <p className="text-sm text-gray-600">
                            We sent a verification link to your email. Click on it to verify your email, or{' '}
                            <button 
                              onClick={handleEmailVerification}
                              className="text-gray-900 underline hover:text-gray-700"
                            >
                              retry
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Phone Number:</p>
                      <div className="flex items-center gap-2 group">
                        <p className="text-gray-900">{formatPhoneForDisplay(profile.phone)}</p>
                        <div className="relative">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Verified
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">YOUR ADDRESS(ES)</h3>
                    <span className="text-orange-600 text-sm font-medium">EDIT ADDRESS</span>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium mb-2">Delivery Address</h4>
                    <p className="text-gray-500">No addresses saved yet.</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
  }
}

export default App;