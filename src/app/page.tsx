'use client';

// pages/index.tsx
import { useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function MainPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What I get access to exactly?',
      a: '1) An AI curated list of creators whose audience matches your product\n\n2) Vetted creator database\n\n3) Fresh creator metrics',
    },
    {
      q: 'How many influencers are included?',
      a: 'Currently hundreds of Bitcoin-only and crypto creators — and we add fresh profiles every week.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. Your subscription is month-to-month and you can cancel in one click inside your dashboard.',
    },
  ];

  return (
    <>
      {/* Meta + Tailwind CDN */}
      <Head>
        <title>Bitcoin Influencer – Curated Bitcoin & Crypto Creators</title>
        <meta
          name="description"
          content="Save hours finding Bitcoin influencers. Curated list with fresh metrics and quick CSV export."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="beforeInteractive"
      />

      {/* HERO */}
      <header className="relative flex flex-col items-center justify-center text-center py-32 px-6 bg-black text-white">
        <img
          src="/btc-influencer-icon.svg"
          alt="Bitcoin Influencer logo"
          className="w-16 h-16 mb-6"
        />
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          Find <span className="text-[#F7931A]">Bitcoin Influencers</span> in
          Seconds
        </h1>
        <p className="mt-6 max-w-2xl text-lg md:text-xl opacity-80">
          Bitcoin&nbsp;Influencer gives you a hand-picked list of Bitcoin-only
          and crypto creators — shaving hours off your research.
        </p>
        <a
          href="#pricing"
          className="mt-10 inline-block rounded-xl bg-[#F7931A] px-8 py-4 text-lg font-semibold text-black hover:scale-105 transition"
        >
          View pricing
        </a>
      </header>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center">
            Why Bitcoin&nbsp;Influencer?
          </h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <Feature
              icon="⏱️"
              title="Save Hours of Research"
              desc="Instantly access a vetted database of Bitcoin-only and crypto creators ready for collaboration."
            />
            <Feature
              icon="📈"
              title="Updated Metrics"
              desc="Follower counts, average views and engagement rates consistently refreshed — always fresh data."
            />
            <Feature
              icon="📥"
              title="Transparent CSV Export"
              desc="Download the full list in one click — clear, organized, and ready to explore."
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="py-24 bg-gradient-to-br from-[#F7931A]/10 to-[#F7931A]/5"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center">
            One Subscription. Endless Data.
          </h2>
          <p className="mt-4 text-center max-w-xl mx-auto">
            Unlimited access to the full database, weekly updates and priority
            support.
          </p>

          <div className="mt-16 flex flex-col md:flex-row justify-center gap-12">
            <Plan
              highlighted={false}
              name="Monthly Pass"
              price="$49"
              period="/month"
              perks={[
                'Unlimited CSV export',
                '24 h support',
                'Weekly updates',
              ]}
              link="https://pay.stripe.com"
            />
            <Plan
              highlighted
              name="Lifetime Access"
              price="$299"
              period="one-time"
              perks={[
                'Everything in Monthly',
                'Lifetime access',
                'Priority roadmap votes',
              ]}
              link="https://pay.stripe.com"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <ul className="space-y-4">
            {faqs.map((item, idx) => (
              <li key={item.q} className="border rounded-xl">
                <button
                  className="w-full flex justify-between items-center p-6 text-left"
                  onClick={() =>
                    setOpenIndex(idx === openIndex ? null : idx)
                  }
                >
                  <span className="font-medium">{item.q}</span>
                  <span>{idx === openIndex ? '−' : '+'}</span>
                </button>
                {idx === openIndex && (
                  <p className="px-6 pb-6 text-gray-700 whitespace-pre-line">{item.a}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p>
            © {new Date().getFullYear()} Bitcoin Influencer. All rights
            reserved.
          </p>
          <a
            href="mailto:support@bitcoininfluencer.com"
            className="hover:text-white transition"
          >
            Contact us
          </a>
        </div>
      </footer>
    </>
  );
}

/* ---------- Helper Components ---------- */

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6">
      <span className="text-5xl">{icon}</span>
      <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
      <p className="mt-4 opacity-80">{desc}</p>
    </div>
  );
}

function Plan({
  highlighted,
  name,
  price,
  period,
  perks,
  link,
}: {
  highlighted: boolean;
  name: string;
  price: string;
  period: string;
  perks: string[];
  link: string;
}) {
  return (
    <div
      className={`w-full md:w-96 rounded-2xl p-8 shadow-lg ${
        highlighted
          ? 'border-4 border-[#F7931A] shadow-xl'
          : 'border border-gray-200'
      }`}
    >
      <h3 className="text-2xl font-semibold text-center mb-4">{name}</h3>
      <p className="text-center text-4xl font-bold mb-6">
        {price}{' '}
        <span className="text-lg font-normal">{period}</span>
      </p>
      <ul className="space-y-3 mb-8">
        {perks.map((p) => (
          <li key={p}>✔️ {p}</li>
        ))}
      </ul>
      <a
        href={link}
        className={`block text-center rounded-xl py-3 font-semibold transition ${
          highlighted
            ? 'bg-black text-white hover:bg-gray-800'
            : 'bg-[#F7931A] text-black hover:opacity-90'
        }`}
      >
        {highlighted ? 'Get Lifetime' : 'Subscribe now'}
      </a>
    </div>
  );
}
