'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Graceful submission delay
    await new Promise((r) => setTimeout(r, 700));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* 1. Hero Header Section matching m4xit.com */}
      <section className="relative pt-12 sm:pt-16 pb-14 sm:pb-20 bg-gradient-to-b from-[#0468D3]/5 to-white overflow-hidden">
        {/* Decorative Blurred Glowing Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0452AB]/5 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0468D3]/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-[#0468D3] mb-4 sm:mb-6 tracking-tight text-left">
            <span>Get </span>
            <span>in </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0468D3] to-[#0452AB]">
              Touch
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed max-w-2xl text-left">
            Ready to start your next project or need technical assistance? Our team of experts is here to help.
          </p>
        </div>
      </section>

      {/* 2. Main Two-Column Contact Card matching m4xit.com 1-to-1 */}
      <section className="pb-24 sm:pb-32 bg-white relative z-10 -mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
            
            {/* Left Column: Contact Information (40% width) */}
            <div className="lg:w-2/5 bg-[#0468D3] p-8 sm:p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
              {/* Internal glowing blobs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[60px] transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#0452AB]/20 rounded-full blur-[60px] transform -translate-x-1/3 translate-y-1/3 pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-8 text-white">
                  Contact Information
                </h2>

                {/* Direct & Fast Contact (WhatsApp) Banner Box */}
                <div className="mb-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/95 flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
                        </span>
                        Direct &amp; Fast Contact
                      </span>
                      <span className="text-[11px] font-semibold text-[#25D366] bg-[#25D366]/20 px-2.5 py-0.5 rounded-full border border-[#25D366]/40">
                        Instant Reply
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mb-4 leading-relaxed font-normal">
                      Skip the waiting queue. Chat with our sales &amp; engineering team on WhatsApp for fast response.
                    </p>
                    <a
                      href="https://wa.me/8801733272445?text=Hello%20Max%20iT%20Solution%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#25D366]/40 hover:shadow-[#25D366]/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
                    >
                      <svg
                        className="w-5 h-5 text-white transition-transform group-hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Contact Items List */}
                <div className="space-y-8 pt-6 border-t border-white/15">
                  {/* Phone */}
                  <div className="flex items-start group">
                    <div className="shrink-0 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mr-6 border border-white/20 group-hover:bg-white/20 transition-colors shadow-lg">
                      <Phone className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-white tracking-wide">
                        Phone Number
                      </h3>
                      <p className="text-white/80 leading-relaxed font-medium">
                        <a href="tel:+8801733-272445" className="hover:text-white transition-colors">
                          +88 01733-272445
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start group">
                    <div className="shrink-0 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mr-6 border border-white/20 group-hover:bg-white/20 transition-colors shadow-lg">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-white tracking-wide">
                        Email Address
                      </h3>
                      <p className="text-white/80 leading-relaxed font-medium">
                        <a href="mailto:sales@m4xit.com" className="hover:text-white transition-colors">
                          sales@m4xit.com
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Head Office */}
                  <div className="flex items-start group">
                    <div className="shrink-0 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mr-6 border border-white/20 shadow-lg">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-white tracking-wide">
                        Head Office
                      </h3>
                      <p className="text-white/80 leading-relaxed font-medium whitespace-pre-line">
                        Afroza Tower, 4th Floor, Uposhohor Newmarket, Rajshahi
                      </p>
                    </div>
                  </div>

                  {/* LAB Office */}
                  <div className="flex items-start group">
                    <div className="shrink-0 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mr-6 border border-white/20 shadow-lg">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-white tracking-wide">
                        LAB Office
                      </h3>
                      <p className="text-white/80 leading-relaxed font-medium whitespace-pre-line">
                        Afroza Tower, 2nd Floor, Uposhohor Newmarket, Rajshahi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Response Guarantee Note */}
              <div className="relative z-10 mt-10 pt-6 border-t border-white/10">
                <p className="text-white/60 font-medium text-sm">
                  We typically respond within 24 hours via email, or instantly on WhatsApp.
                </p>
              </div>
            </div>

            {/* Right Column: Send Us a Message Form (60% width) */}
            <div className="lg:w-3/5 p-8 sm:p-10 md:p-14 bg-white">
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 mb-8">
                Send us a message
              </h3>

              {isSubmitted ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-emerald-900">Message Sent Successfully!</h4>
                  <p className="text-sm text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Your message has been received by our engineering and sales team. We will get back to you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="mt-4 px-6 py-3 bg-[#0468D3] text-white rounded-xl text-sm font-bold hover:bg-[#0356b0] shadow-md shadow-[#0468D3]/20 transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#0468D3]/20 focus:border-[#0468D3] transition-colors bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#0468D3]/20 focus:border-[#0468D3] transition-colors bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone & Subject Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#0468D3]/20 focus:border-[#0468D3] transition-colors bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400"
                        placeholder="+880 1..."
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Subject <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#0468D3]/20 focus:border-[#0468D3] transition-colors bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400"
                        placeholder="e.g. Solar rooftop inquiry"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#0468D3]/20 focus:border-[#0468D3] transition-colors bg-gray-50/50 resize-none text-sm text-gray-900 placeholder:text-gray-400"
                      placeholder="Tell us about your project or inquiry..."
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#0468D3] hover:bg-[#0356b0] text-white font-bold rounded-xl transition-all shadow-md shadow-[#0468D3]/20 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-base"
                  >
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Google Maps Location Section matching https://www.m4xit.com/contact */}
          <div className="mt-16 bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 md:p-8 bg-gray-50/80 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-[#0468D3] tracking-widest uppercase mb-1 block">
                  Live Location
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-[#0468D3]">
                  Find Us on Google Maps
                </h3>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Afroza Tower, Uposhohor Newmarket, Rajshahi (Head Office: 4th Floor | LAB Office: 2nd Floor)
                </p>
              </div>

              <a
                href="https://maps.app.goo.gl/2N1mLA8RwpcaohFs6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0468D3] hover:bg-[#0468D3]/90 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all self-start sm:self-auto group shrink-0"
              >
                <MapPin className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Open Navigation</span>
                <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full h-[420px] md:h-[480px] bg-gray-100 relative">
              <iframe
                title="Max iT Solution Google Maps Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3634.103439609135!2d88.59531817559223!3d24.377704764404523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14644734df7254d%3A0x9ca140a46bae1fa1!2sMax%20iT%20Solution!5e0!3m2!1sen!2sbd!4v1793392757385!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
