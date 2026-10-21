import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success('Thank you! Your message has been sent to our bakery team.');
    setSubmitted(true);
  };

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-12 lg:py-20">
      <div className="container-main max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-brand-primary-dark)] mb-3 block">
            Get in Touch
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[var(--color-brand-chocolate)] mb-4">
            We'd Love to Hear from You
          </h1>
          <p className="text-base text-[var(--color-brand-muted)] max-w-xl mx-auto">
            Have questions about customized cakes, corporate orders, party dessert boxes, or delivery? Reach out directly!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-elevated p-6 border border-[var(--color-brand-primary-light)]/20">
              <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] mb-5">
                Bakery Hotline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)] flex items-center justify-center flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-brand-muted)] block">Call or WhatsApp</span>
                    <a href="tel:+918428855444" className="text-sm font-semibold text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary-dark)] transition-colors block">
                      +91 84288 55444
                    </a>
                    <a href="tel:+916379603744" className="text-sm font-semibold text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary-dark)] transition-colors block">
                      +91 63796 03744
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)] flex items-center justify-center flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-brand-muted)] block">Email Support</span>
                    <a href="mailto:hello@yoyocakes.in" className="text-sm font-semibold text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary-dark)] transition-colors">
                      hello@yoyocakes.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)] flex items-center justify-center flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-brand-muted)] block">Bakery Operating Hours</span>
                    <p className="text-sm font-semibold text-[var(--color-brand-chocolate)]">
                      Mon – Sun: 9:00 AM – 10:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)] flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-brand-muted)] block">Fulfillment Options</span>
                    <p className="text-sm font-semibold text-[var(--color-brand-chocolate)]">
                      Local City Delivery & Kitchen Pickup
                    </p>
                    <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                      (Configurable in Admin Settings)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="bg-gradient-to-br from-[var(--color-brand-chocolate)] to-[var(--color-brand-primary-dark)] text-white p-6 rounded-2xl shadow-elevated">
              <h4 className="font-heading font-bold text-base mb-2">Bulk & Custom Orders</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Planning a birthday party, anniversary celebration, or corporate event? Call our hotline for personalized pastry selections and custom box packings!
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-elevated p-8 border border-[var(--color-brand-primary-light)]/20">
              <h2 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)] mb-6 flex items-center gap-2">
                <MessageSquare size={22} className="text-[var(--color-brand-primary-dark)]" />
                Send us a Message
              </h2>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-2">
                    Message Received!
                  </h3>
                  <p className="text-sm text-[var(--color-brand-muted)] max-w-md mx-auto mb-6">
                    Our team will review your inquiry and get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="btn-secondary text-xs px-6 py-2.5"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Priya Sharma"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="priya@example.com"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                        Subject
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="input-field"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Custom Cake Order">Custom Cake Order</option>
                        <option value="Bulk / Party Boxes">Bulk / Party Boxes</option>
                        <option value="Feedback / Suggestion">Feedback / Suggestion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you'd like to know or customize..."
                      className="input-field resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto px-8 py-3 text-sm flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Send Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
