"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";

const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    productName: "",
    productUrl: "",
    productDescription: "",
  });

  const loadOnboardingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("onboarding_answers")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (data && !error) {
          setFormData({
            companyName: data.company_name || "",
            productName: data.product_name || "",
            productUrl: data.product_url || "",
            productDescription: data.product_description || "",
            // onboarding_answers does not have selected_niches
          });
        }
      }
    } catch (error) {
      console.error("Error loading onboarding data:", error);
    }
  };

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      await saveOnboardingData();
      // Redirect to search loading page
      window.location.href = '/search/loading';
    }
  };

  const saveOnboardingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user already has onboarding data
        const { data: existingData } = await supabase
          .from("onboarding_answers")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        let error;
        if (existingData) {
          // Update existing record
          const result = await supabase
            .from("onboarding_answers")
            .update({
              company_name: formData.companyName,
              product_name: formData.productName,
              product_url: formData.productUrl,
              product_description: formData.productDescription
            })
            .eq("user_id", user.id);
          error = result.error;
        } else {
          // Insert new record
          const result = await supabase
            .from("onboarding_answers")
            .insert({
              user_id: user.id,
              company_name: formData.companyName,
              product_name: formData.productName,
              product_url: formData.productUrl,
              product_description: formData.productDescription
            });
          error = result.error;
        }
        
        if (error) {
          console.error("Error saving onboarding data to Supabase:", error.message);
          throw error;
        } else {
          console.log("Onboarding data saved to Supabase successfully");
          
          // Also save to localStorage for the results page
          const onboardingDataForLocalStorage = {
            companyName: formData.companyName,
            productName: formData.productName,
            productUrl: formData.productUrl,
            productDescription: formData.productDescription,
            keywords: [], // Will be populated by the API analysis
            selectedNiches: [] // Will be populated by the API analysis
          };
          
          localStorage.setItem('onboardingData', JSON.stringify(onboardingDataForLocalStorage));
          console.log("Onboarding data saved to localStorage successfully");
        }
      } else {
        throw new Error("User not authenticated");
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      throw error;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.companyName.trim() !== "";
      case 2: return formData.productName.trim() !== "";
      case 3: return formData.productDescription.trim() !== "";
      default: return false;
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: 'url(/onboard-bg.webp)' }}
    >
      <div className="w-full max-w-2xl">
        {/* Progress Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
        {/* Modal Content */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {currentStep === 1 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome to Bitcoin Influencer</h2>
                <p className="text-white/70">Let's get started by learning about your company</p>
              </div>
              <div className="text-left mb-6">
                <label className="block text-white text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Product Details</h2>
                <p className="text-white/70">Tell us about the product you're promoting.</p>
              </div>
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => updateFormData('productName', e.target.value)}
                    placeholder="Your Product Name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Product URL</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-white/50">🔗</span>
                    <input
                      type="url"
                      value={formData.productUrl}
                      onChange={(e) => updateFormData('productUrl', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <p className="text-white/50 text-xs mt-1">Opcional: Inclua se você tiver uma landing page</p>
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Product Description</h2>
                <p className="text-white/70">What does {formData.productName || 'your product'} do and who does it help? Be specific and highlight the main thing.</p>
              </div>
              <div className="text-left mb-4">
                <label className="block text-white text-sm font-medium mb-2">Product Description (300 chars max.)</label>
                <div className="relative">
                  <textarea
                    value={formData.productDescription}
                    onChange={(e) => updateFormData('productDescription', e.target.value.slice(0, 300))}
                    placeholder="Ex: An AI essay writing app that helps students write essays fast"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none"
                  />
                  <div className="absolute bottom-3 right-3 text-white/50 text-xs">
                    {formData.productDescription.length}/300
                  </div>
                </div>
              </div>
              {formData.productDescription.length > 100 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm">Looking good</span>
                  </div>
                  <div className="text-white/70 text-sm">
                    Great - Detailed description
                  </div>
                </div>
              )}
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((formData.productDescription.length / 300) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isStepValid()
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {currentStep < 3 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  return <OnboardingFlow onComplete={() => router.push("/")} />;
}