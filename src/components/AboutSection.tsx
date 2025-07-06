
import { Button } from "@/components/ui/button";

const AboutSection = () => {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            About Ethereal Diary
          </h2>
          <div className="w-20 h-1 bg-diary-purple mx-auto"></div>
        </div>

        <div className="prose prose-lg dark:prose-invert mx-auto text-gray-300">
          <p className="text-lg md:text-xl mb-6">
            Ethereal Diary was born from a simple idea: in a world filled with noise and distraction, we all need a private sanctuary to reflect, process, and grow.
          </p>
          
          <p className="text-lg md:text-xl mb-6">
            Our journey began when we realized how powerful journaling can be for mental clarity, emotional processing, and personal growth. However, traditional paper diaries have limitations - they can be lost, damaged, or difficult to search through.
          </p>
          
          <p className="text-lg md:text-xl mb-6">
            We created Ethereal Diary to combine the therapeutic benefits of journaling with modern technology. By leveraging AI analysis, we help you gain deeper insights from your entries while maintaining absolute privacy and security.
          </p>
          
          <p className="text-lg md:text-xl mb-6">
            Our mission is to help you capture your journey authentically, reflect meaningfully, and grow intentionally through the power of private, enhanced journaling.
          </p>
          
          <div className="flex justify-center mt-10">
            <Button className="bg-diary-purple text-white hover:bg-diary-purple/90 px-8 py-6 text-lg rounded-full">
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
