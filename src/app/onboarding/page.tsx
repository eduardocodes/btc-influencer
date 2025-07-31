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
    selectedNiches: [] as string[],
  });

  useEffect(() => {
    const savedOnboardingData = localStorage.getItem("onboardingData");
    if (savedOnboardingData) {
      const data = JSON.parse(savedOnboardingData);
      setFormData({
        companyName: data.companyName || "",
        productName: data.productName || "",
        productUrl: data.productUrl || "",
        productDescription: data.productDescription || "",
        selectedNiches: data.selectedNiches || []
      });
    }
  }, []);

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      await saveOnboardingData();
      // Redirect to search loading page
      window.location.href = '/search/loading';
    }
  };

  const saveOnboardingData = async () => {
    try {
      const onboardingData = {
        companyName: formData.companyName,
        productName: formData.productName,
        productUrl: formData.productUrl,
        productDescription: formData.productDescription,
        completedAt: new Date().toISOString()
      };
      localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("onboarding")
          .upsert({
            user_id: user.id,
            company_name: formData.companyName,
            product_name: formData.productName,
            product_url: formData.productUrl,
            product_description: formData.productDescription,
        selected_niches: formData.selectedNiches
          }, { onConflict: "user_id" });
        if (error) {
          console.log("Supabase save failed (table may not exist):", error.message);
          console.log("Data saved to localStorage instead");
        } else {
          console.log("Onboarding data saved to Supabase successfully");
        }
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
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
      case 4: return true; // Step 4 validation
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
            {[1, 2, 3, 4].map((step) => (
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
                <p className="text-white/70">What does BTC do and who does it help? Be specific and highlight the main thing.</p>
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
          {currentStep === 4 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Target Niches</h2>
                <p className="text-white/70">Select the niches that best match your product to find suitable creators</p>
              </div>
              <div className="text-left mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { id: 'tech', label: 'Technology', emoji: '💻' },
                    { id: 'education', label: 'Education', emoji: '📚' },
                    { id: 'news', label: 'News', emoji: '📰' },
                    { id: 'mining', label: 'Mining', emoji: '⛏️' },
                    { id: 'podcast', label: 'Podcast', emoji: '🎙️' },
                    { id: 'macro-research', label: 'Macro Research', emoji: '📊' },
                    { id: 'trading', label: 'Trading', emoji: '📈' },
                    { id: 'defi', label: 'DeFi', emoji: '🏦' },
                    { id: 'nft', label: 'NFT', emoji: '🖼️' },
                  ].map((niche) => (
                    <button
                      key={niche.id}
                      type="button"
                      onClick={() => {
                        const isSelected = formData.selectedNiches.includes(niche.id);
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            selectedNiches: formData.selectedNiches.filter(n => n !== niche.id)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedNiches: [...formData.selectedNiches, niche.id]
                          });
                        }
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        formData.selectedNiches.includes(niche.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/10 border-white/20 text-white hover:border-white/40'
                      }`}
                    >
                      <div className="text-xl mb-1">{niche.emoji}</div>
                      <div className="text-sm">{niche.label}</div>
                    </button>
                  ))}
                </div>

                {formData.selectedNiches.length > 0 && (
                  <div>
                    <h3 className="text-white text-sm font-medium mb-2">
                      Selected niches ({formData.selectedNiches.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedNiches.map((nicheId) => {
                        const niche = [
                          { id: 'tech', label: 'Technology' },
                          { id: 'education', label: 'Education' },
                          { id: 'news', label: 'News' },
                          { id: 'mining', label: 'Mining' },
                          { id: 'podcast', label: 'Podcast' },
                          { id: 'macro-research', label: 'Macro Research' },
                          { id: 'trading', label: 'Trading' },
                          { id: 'defi', label: 'DeFi' },
                          { id: 'nft', label: 'NFT' },
                        ].find(n => n.id === nicheId);
                        return (
                          <span
                            key={nicheId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                          >
                            {niche?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
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
              {currentStep < 4 ? 'Next' : 'Finish'}
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