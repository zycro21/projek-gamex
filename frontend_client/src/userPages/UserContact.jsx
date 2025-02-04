import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../userStyle/userContact.css";
import Navbar from "../userComponents/navbar";
import Footer from "../userComponents/footer";

const UserContact = () => {

    const [activeFAQ, setActiveFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setActiveFAQ(activeFAQ === index ? null : index);
    };

    const faqs = [
        { question: "What services do you provide?", answer: "We specialize in gaming consultancy, publishing, and development." },
        { question: "Where is your office located?", answer: "Our headquarters is located at 1234 Gaming Street, Playland." },
        { question: "How can I contact customer support?", answer: "You can contact us via email at support@gamingwebsite.com or through our hotline." },
    ];

    return (
        <div className="contact-page">
            <ToastContainer />
            <Navbar />

            {/* Hero Section */}
            <div className="contact-hero">
                <h1>Get in Touch</h1>
                <p>
                    Have questions or need support? Reach out through the following
                    channels, or browse our FAQ section below.
                </p>
            </div>

            {/* Contact Info Section */}
            <div className="contact-info">
                <div className="contact-card">
                    <h2>📍 Head Office</h2>
                    <p>1234 Gaming Street, Game City, Playland 56789</p>
                </div>
                <div className="contact-card">
                    <h2>📞 Phone</h2>
                    <p>+1 800-123-GAME (4263)</p>
                </div>
                <div className="contact-card">
                    <h2>📧 Email</h2>
                    <p>
                        <a href="mailto:info@gamingwebsite.com">info@gamingwebsite.com</a>
                    </p>
                </div>
                <div className="contact-card">
                    <h2>⏰ Business Hours</h2>
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`faq-item ${activeFAQ === index ? "active" : ""}`}
                            onClick={() => toggleFAQ(index)}
                        >
                            <h3>{faq.question}</h3>
                            <p>{activeFAQ === index && faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social Media Section */}
            <div className="social-media">
                <h2>Follow Us</h2>
                <div className="social-icons">
                    <a href="#" className="social-icon" title="Facebook">
                        🌐 Facebook
                    </a>
                    <a href="#" className="social-icon" title="Twitter">
                        🐦 Twitter
                    </a>
                    <a href="#" className="social-icon" title="Instagram">
                        📸 Instagram
                    </a>
                    <a href="#" className="social-icon" title="LinkedIn">
                        💼 LinkedIn
                    </a>
                </div>
            </div>

            {/* Map Section */}
            <div className="contact-map">
                <h2>Find Us</h2>
                <iframe
                    title="Google Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126912.62879060944!2d106.82261875998343!3d-6.261141676307372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f2d148fbe713%3A0x6e667d52ebedf5a9!2sEast%20Jakarta%2C%20East%20Jakarta%20City%2C%20Jakarta!5e0!3m2!1sen!2sid!4v1737790055543!5m2!1sen!2sid"
                    width="100%"
                    height="300px"
                    style={{ border: 0, borderRadius: "10px", marginTop: "20px" }}
                    allowFullScreen=""
                    loading="lazy"
                ></iframe>
            </div>

            <Footer />
        </div>
    )
}

export default UserContact;