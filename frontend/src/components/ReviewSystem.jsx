import React from "react";

const reviews = [
  {
    name: "Sara Khan",
    role: "Product Manager",
    text: "TaskHub helped us find the perfect freelancer quickly — communication and delivery were excellent.",
  },
  {
    name: "Liam Chen",
    role: "Founder",
    text: "Great platform for hiring vetted talent. Milestones made payments safe and predictable.",
  },
  {
    name: "Maya Patel",
    role: "Designer",
    text: "I found meaningful freelance work and built long-term client relationships through TaskHub.",
  },
];

const ReviewCard = ({ review }) => (
  <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
    <p className="text-gray-700 mb-4">“{review.text}”</p>
    <div className="flex items-center">
      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
        <span className="text-teal-600 font-bold">{review.name.charAt(0)}</span>
      </div>
      <div>
        <div className="font-semibold text-gray-900">{review.name}</div>
        <div className="text-sm text-gray-500">{review.role}</div>
      </div>
    </div>
  </div>
);

const ReviewSystem = () => {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-8">What people say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSystem;
