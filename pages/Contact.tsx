import React, { useState } from 'react';
import { Send, MessageSquare, Mail, Loader2, CheckCircle, TicketCheck } from 'lucide-react';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// Map subject to ticket category
const SUBJECT_TO_CATEGORY: Record<string, string> = {
  'Issue with a Purchase': 'delivery_issue',
  'Billing Question': 'refund_request',
  'Creator Inquiry': 'clarification',
  'Bug Report': 'technical',
  'Other': 'other'
};

const Contact: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Issue with a Purchase',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create a ticket instead of contact_message for unified tracking
      const ticketData: any = {
        subject: `[Contact] ${formData.subject}`,
        category: SUBJECT_TO_CATEGORY[formData.subject] || 'other',
        source: 'contact_us',
        involves_admin: true,
        status: 'open',
        priority: 'normal'
      };

      // If user is logged in, link to their profile
      if (isAuthenticated && user) {
        ticketData.created_by = user.id;
        ticketData.buyer_id = user.id;
      } else {
        // For anonymous users, store contact info
        ticketData.contact_email = formData.email;
        ticketData.contact_name = `${formData.firstName} ${formData.lastName}`.trim();
        // We need a temp user for created_by - use the system/admin account
        // For now, we'll use RLS bypass or handle in the backend
        // This requires the contact_email to be the identifier
      }

      // Insert ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select('id, ticket_number')
        .single();

      if (ticketError) {
        // If anonymous user can't create ticket (RLS), fall back to contact_messages
        // This is a graceful degradation
        if (ticketError.code === '42501' || ticketError.message.includes('RLS')) {
          const { error: contactError } = await supabase
            .from('contact_messages')
            .insert({
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email,
              subject: formData.subject,
              message: formData.message,
              status: 'unread'
            });
          if (contactError) throw contactError;
          setSubmitted(true);
          return;
        }
        throw ticketError;
      }

      // Create initial message in the ticket
      if (ticket) {
        const messageData: any = {
          ticket_id: ticket.id,
          content: `**From:** ${formData.firstName} ${formData.lastName}\n**Email:** ${formData.email}\n\n${formData.message}`,
          is_internal: false,
          sender_role: isAuthenticated ? 'buyer' : 'buyer', // Anonymous treated as buyer
          visibility: 'all'
        };

        if (isAuthenticated && user) {
          messageData.sender_id = user.id;
        }

        await supabase.from('ticket_messages').insert(messageData);

        setTicketNumber(ticket.ticket_number);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-accent-primary/20 text-accent-primary rounded-full flex items-center justify-center mb-6">
          <TicketCheck size={32} />
        </div>
        <h2 className="text-3xl font-display font-bold text-textMain mb-4">
          {ticketNumber ? 'Ticket Created' : 'Message Sent'}
        </h2>
        {ticketNumber && (
          <div className="mb-4 px-4 py-2 bg-surface border border-border rounded-lg">
            <span className="text-textMuted text-sm">Ticket Number: </span>
            <span className="font-mono font-bold text-textMain">{ticketNumber}</span>
          </div>
        )}
        <p className="text-textSecondary mb-8">
          {ticketNumber
            ? 'Your support ticket has been created. You can track its status in your dashboard.'
            : 'Thanks for reaching out. Our support team generally replies within 24 hours.'
          }
        </p>
        {isAuthenticated && ticketNumber && (
          <Button onClick={() => window.location.href = '/tickets'} variant="primary" className="mb-3">
            View My Tickets
          </Button>
        )}
        <Button onClick={() => { setSubmitted(false); setTicketNumber(null); }} variant="outline">Send Another</Button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

        {/* Info Side */}
        <div className="animate-slide-up">
          <h1 className="text-4xl font-display font-bold text-textMain mb-6">Contact Support</h1>
          <p className="text-textSecondary text-lg mb-8 leading-relaxed">
            Need help with a purchase? Found a bug in a kit? Or just want to partner with us? Fill out the form and we'll get back to you ASAP.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-surface border border-border rounded-xl">
              <MessageSquare className="text-accent-primary mt-1" size={24} />
              <div>
                <h3 className="text-textMain font-bold mb-1">Product Support</h3>
                <p className="text-textSecondary text-sm">For questions about specific kits, please try messaging the creator directly from the listing page first.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-surface border border-border rounded-xl">
              <Mail className="text-accent-primary mt-1" size={24} />
              <div>
                <h3 className="text-textMain font-bold mb-1">Email Us</h3>
                <p className="text-textSecondary text-sm">khnnabubakar786@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-textMain uppercase">First Name</label>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-textMain uppercase">Last Name</label>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-textMain uppercase">Email</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-textMain uppercase">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
              >
                <option>Issue with a Purchase</option>
                <option>Billing Question</option>
                <option>Creator Inquiry</option>
                <option>Bug Report</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-textMain uppercase">Message</label>
              <textarea
                required
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none resize-none"
                placeholder="Describe your issue..."
              ></textarea>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
