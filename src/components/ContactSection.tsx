
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const ContactSection = () => {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
          Contact Us
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Have questions or feedback? We'd love to hear from you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-6 text-white">Get In Touch</h3>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-diary-purple/20 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-diary-purple" />
              </div>
              <div>
                <h4 className="font-medium text-white">Our Location</h4>
                <p className="text-gray-300">123 Creativity Lane, Imagination City, 98765</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-diary-purple/20 p-3 rounded-full">
                <Mail className="h-6 w-6 text-diary-purple" />
              </div>
              <div>
                <h4 className="font-medium text-white">Email Us</h4>
                <p className="text-gray-300">support@etherealdiary.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-diary-purple/20 p-3 rounded-full">
                <Phone className="h-6 w-6 text-diary-purple" />
              </div>
              <div>
                <h4 className="font-medium text-white">Call Us</h4>
                <p className="text-gray-300">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="font-medium text-white mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 rounded-full">
                <Facebook className="h-5 w-5 text-white" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 rounded-full">
                <Instagram className="h-5 w-5 text-white" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 rounded-full">
                <Twitter className="h-5 w-5 text-white" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 rounded-full">
                <Linkedin className="h-5 w-5 text-white" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-6 text-white">Send a Message</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-white">Name</label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="bg-white/20 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-white">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="bg-white/20 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-white">Subject</label>
              <Input
                id="subject"
                placeholder="How can we help?"
                className="bg-white/20 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-white">Message</label>
              <Textarea
                id="message"
                placeholder="Your message..."
                className="bg-white/20 border-white/10 text-white placeholder:text-gray-400 min-h-[120px]"
              />
            </div>
            <Button type="submit" className="w-full bg-diary-purple hover:bg-diary-purple/90">
              Send Message
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-16 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Ethereal Diary. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ContactSection;
