import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Heart, Star, Award, Coffee, Check, ArrowRight, ChefHat } from 'lucide-react';
import { Link } from 'react-router';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Cake Paradise by Sayu</title>
      </Helmet>

      {/* Hero */}
      <div className="bg-champagne pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate mb-4">About Us</h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto text-lg">
            Baking memories, one slice at a time since 2020, with love, passion, and the finest ingredients.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-24">
          <div className="lg:w-1/2 relative pl-4 pb-4 pr-4 w-full max-w-lg mx-auto">
            {/* Background offset layer */}
            <div className="absolute -left-2 -bottom-2 top-6 right-6 bg-[#eaddce] rounded-[2rem] z-0"></div>
            
            {/* Main image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-[10px] border-white shadow-sm z-10 bg-white">
               <img src="/images/about_baker.png" alt="Sayu Baking" className="w-full h-full object-cover" />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-8 -right-4 bg-white px-8 py-5 rounded-[2rem] shadow-xl z-20 flex items-center gap-4">
              <div className="bg-[#f8eeee] p-4 rounded-full text-[#b46d75]">
                <ChefHat size={28} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-display font-bold text-dark-chocolate text-2xl leading-none mb-1">100%</span>
                <span className="text-charcoal/50 text-base font-medium leading-none">Handcrafted</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 space-y-6">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-rose-gold/10 text-rose-gold px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
               <Heart size={14} className="fill-current" /> Our Story
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-bold text-dark-chocolate leading-tight">
              From a Small Home Kitchen to Your Celebrations
            </h2>
            
            <div className="text-charcoal/80 leading-relaxed space-y-4">
              <p>
                What started as a passionate hobby in a small home kitchen has blossomed into Cake Paradise. Sayu's love for baking began when she was young, watching her grandmother craft traditional sweets.
              </p>
              <p>
                Today, we blend that treasured family heritage with modern baking techniques to craft custom cakes and desserts that are as delicious as they are beautiful. Every creation is made with premium ingredients, free from preservatives, and prepared with a commitment to quality and freshness. — <span className="font-bold text-dark-chocolate">100% premium ingredients, freshly baked goodness, no compromises.</span>
              </p>
            </div>
            
            {/* Checkmark list */}
            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <div className="bg-rose-gold text-white rounded-full p-1 mt-0.5">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-charcoal/80 font-medium">Founded with a passion for bringing premium-quality baked goods to every celebration</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-rose-gold text-white rounded-full p-1 mt-0.5">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-charcoal/80 font-medium">Every cake is baked fresh from scratch using the finest local and imported ingredients</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-rose-gold text-white rounded-full p-1 mt-0.5">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-charcoal/80 font-medium">We create edible works of art that become the centerpiece of your special moments</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-rose-gold text-white rounded-full p-1 mt-0.5">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-charcoal/80 font-medium">No preservatives, no shortcuts—just authentic flavors and exceptional craftsmanship</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-rose-gold text-white rounded-full p-1 mt-0.5">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-charcoal/80 font-medium">Dedicated to making every celebration sweeter, one cake at a time</span>
              </li>
            </ul>

            {/* Button */}
            <div className="pt-6">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-rose-gold text-white px-6 py-3 rounded-md font-bold hover:bg-dark-chocolate transition-colors">
                Explore Our Cakes <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-dark-chocolate mb-4">Our Core Values</h2>
          <p className="text-charcoal/70 max-w-2xl mx-auto">The principles that guide everything we bake.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-champagne-light p-8 rounded-3xl text-center border border-champagne shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-rose-gold/10 text-rose-gold rounded-full flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:bg-rose-gold group-hover:text-white transition-all duration-300">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-display font-bold text-dark-chocolate mb-3">Baked with Love</h3>
            <p className="text-charcoal/70">Every order is treated with the utmost care, baked fresh just for you.</p>
          </div>
          <div className="group bg-champagne-light p-8 rounded-3xl text-center border border-champagne shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-rose-gold/10 text-rose-gold rounded-full flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:bg-rose-gold group-hover:text-white transition-all duration-300">
              <Award size={32} />
            </div>
            <h3 className="text-xl font-display font-bold text-dark-chocolate mb-3">Premium Quality</h3>
            <p className="text-charcoal/70">We never compromise on ingredients. Only the finest butter, chocolate, and fresh produce.</p>
          </div>
          <div className="group bg-champagne-light p-8 rounded-3xl text-center border border-champagne shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-rose-gold/10 text-rose-gold rounded-full flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:bg-rose-gold group-hover:text-white transition-all duration-300">
              <Star size={32} />
            </div>
            <h3 className="text-xl font-display font-bold text-dark-chocolate mb-3">Attention to Detail</h3>
            <p className="text-charcoal/70">From the crumb coat to the final sugar flower, perfection is our standard.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
