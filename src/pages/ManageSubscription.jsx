// src/pages/ManageSubscription.js
import React from 'react';

const ManageSubscription = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900">Manage Subscription</h1>
      <p className="mt-2 text-gray-600">Upgrade or manage your subscription here.</p>
      <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        Subscribe Now
      </button>
    </div>
  );
};

export default ManageSubscription;