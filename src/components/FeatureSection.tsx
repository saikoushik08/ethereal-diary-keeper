
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, Brain, LineChart, Users } from "lucide-react";

const FeatureSection = () => {
  const features = [
    {
      title: "Personal Journal",
      description: "Create unlimited diary entries with rich text editing and image uploads.",
      icon: <BookText className="h-10 w-10 text-diary-purple" />,
    },
    {
      title: "AI Insights",
      description: "Gain valuable insights into your mood patterns and emotional trends.",
      icon: <Brain className="h-10 w-10 text-diary-purple" />,
    },
    {
      title: "Analytics Dashboard",
      description: "Track your journaling habits and view personalized statistics.",
      icon: <LineChart className="h-10 w-10 text-diary-purple" />,
    },
    {
      title: "Community Connection",
      description: "Share selected entries with trusted contacts if desired.",
      icon: <Users className="h-10 w-10 text-diary-purple" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
          Features
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Discover what makes Ethereal Diary the perfect digital sanctuary for your thoughts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 h-full">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <CardTitle className="text-xl md:text-2xl font-medium">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;
