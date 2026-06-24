import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    { id: 1, name: "Amaya P.", text: "The custom birthday cake for my daughter was absolutely stunning. Not only did it look perfect, but the chocolate mud flavor was the best we've ever had!", rating: 5 },
    { id: 2, name: "Dilshan S.", text: "Ordered our anniversary cake from Sayu. She was incredibly helpful with the design and it was delivered right on time. Highly recommended.", rating: 5 },
    { id: 3, name: "Natasha W.", text: "The cupcakes for our office party were a hit! The buttercream is so light and not overly sweet. Will definitely be ordering again.", rating: 5 },
    { id: 4, name: "Kavindu M.", text: "Exceeded my expectations! I sent a very vague idea of what I wanted and Sayu created a masterpiece.", rating: 5 },
    { id: 5, name: "Shenali R.", text: "Best red velvet cake in Colombo, hands down. The cream cheese frosting is perfection.", rating: 5 },
    { id: 6, name: "Ruwan T.", text: "Professional service and a truly premium product. The packaging was also beautiful.", rating: 5 },
  ];

  return (
    <>
      <Helmet>
        <title>Testimonials | Cake Paradise by Sayu</title>
      </Helmet>

      <div className="bg-champagne pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate mb-4">Sweet Words</h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto text-lg">
            Don't just take our word for it. Here's what our wonderful customers have to say about their Cake Paradise experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-3xl border border-cream shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex text-rose-gold mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-charcoal/80 italic mb-6 flex-grow leading-relaxed">
                "{review.text}"
              </p>
              <div className="font-display font-bold text-dark-chocolate border-t border-cream pt-4">
                - {review.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Testimonials;
