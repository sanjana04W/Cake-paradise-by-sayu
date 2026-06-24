import React from 'react';
import { Helmet } from 'react-helmet-async';

const Returns = () => {
  return (
    <div className="pt-28 pb-16 min-h-screen bg-champagne">
      <Helmet>
        <title>Returns & Refunds | Cake Paradise</title>
      </Helmet>
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate text-center mb-12">Returns & Refunds</h1>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-rose-gold/20 text-charcoal/80">
          <p className="mb-6">
            At Cake Paradise, we take immense pride in our baked goods. If you are not satisfied with your order, please let us know immediately so we can make things right.
          </p>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mt-8 mb-4">Cancellations</h2>
          <p className="mb-4">
            For standard online orders, cancellations must be made at least 48 hours prior to the scheduled pickup or delivery time to receive a full refund. Cancellations made within 48 hours are non-refundable.
          </p>
          <p className="mb-6">
            For custom cakes and large event orders, a non-refundable deposit is required. If you need to cancel a custom order, please notify us at least one week in advance.
          </p>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mt-8 mb-4">Refunds & Replacements</h2>
          <p className="mb-4">
            Due to the perishable nature of our products, we do not accept returns. However, if there is a quality issue or an error with your order on our part, we will offer a replacement or a refund.
          </p>
          <p className="mb-6">
            To request a refund or replacement, you must contact us within 24 hours of receiving your order and provide photographic evidence of the issue. We may require the remaining portion of the cake to be returned to us for quality assessment.
          </p>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mt-8 mb-4">Damages During Transport</h2>
          <p>
            If you choose to pick up your cake, Cake Paradise is not responsible for any damage that occurs during transport or setup. If you opt for delivery, we guarantee the cake will arrive in perfect condition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Returns;
