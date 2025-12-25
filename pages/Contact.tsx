import React, { useState } from 'react';
import { Send, MessageSquare, Mail } from 'lucide-react';
import Button from '../components/Button';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6">
          <Send size={32} />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-4">Message Sent</h2>
        <p className="text-textMuted mb-8">
          Thanks for reaching out. Our support team generally replies within 24 hours.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">Send Another</Button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Info Side */}
        <div className="animate-slide-up">
          <h1 className="text-4xl font-display font-bold text-white mb-6">Contact Support</h1>
          <p className="text-textMuted text-lg mb-8 leading-relaxed">
            Need help with a purchase? Found a bug in a kit? Or just want to partner with us? Fill out the form and we'll get back to you ASAP.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-surface border border-border rounded-xl">
              <MessageSquare className="text-accent mt-1" size={24} />
              <div>
                <h3 className="text-white font-bold mb-1">Product Support</h3>
                <p className="text-textMuted text-sm">For questions about specific kits, please try messaging the creator directly from the listing page first.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-surface border border-border rounded-xl">
              <Mail className="text-accent mt-1" size={24} />
              <div>
                <h3 className="text-white font-bold mb-1">Email Us</h3>
                <p className="text-textMuted text-sm">support@webcatalog.pro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white uppercase">First Name</label>
                <input required type="text" className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white uppercase">Last Name</label>
                <input required type="text" className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white uppercase">Email</label>
              <input required type="email" className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white uppercase">Subject</label>
              <select className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none">
                <option>Issue with a Purchase</option>
                <option>Billing Question</option>
                <option>Creator Inquiry</option>
                <option>Bug Report</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white uppercase">Message</label>
              <textarea required rows={4} className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none resize-none" placeholder="Describe your issue..."></textarea>
            </div>

            <Button type="submit" size="lg" className="w-full">Send Message</Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
