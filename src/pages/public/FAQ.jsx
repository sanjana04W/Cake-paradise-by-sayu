import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { question: "How far in advance should I place my custom cake order?", answer: "We recommend placing custom cake orders at least 1-2 weeks in advance. For wedding cakes or large events, please contact us 1-2 months prior to your date." },
  { question: "Do you offer gluten-free or vegan options?", answer: "Yes! We offer a selection of gluten-free and vegan cakes. Please note that our kitchen processes wheat and dairy, so we cannot guarantee a 100% allergen-free environment." },
  { question: "How should I store my cake?", answer: "Most of our cakes are best stored in the refrigerator. We recommend taking the cake out 1-2 hours before serving so it can come to room temperature, which ensures the best flavor and texture." },
  { question: "Do you deliver?", answer: "Yes, we offer delivery within a 20km radius of Nattandiya. Delivery fees vary based on distance." },
  { question: "Can I make changes to my order after placing it?", answer: "Changes to custom orders must be made at least 5 days before the scheduled pickup or delivery date. Please contact us directly to request modifications." }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="pt-28 pb-16 min-h-screen bg-champagne">
      <Helmet>
        <title>FAQs | Cake Paradise</title>
      </Helmet>
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate text-center mb-4">Frequently Asked Questions</h1>
        <p className="text-center text-charcoal/70 mb-12">Everything you need to know about our cakes, ordering, and delivery.</p>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-rose-gold/20 overflow-hidden">
              <button 
                className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-dark-chocolate">{faq.question}</span>
                {openIndex === index ? <ChevronUp className="text-rose-gold" size={20} /> : <ChevronDown className="text-rose-gold" size={20} />}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-charcoal/70 border-t border-cream/50 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
