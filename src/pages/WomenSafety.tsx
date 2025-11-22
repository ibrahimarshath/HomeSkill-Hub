import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Users, Lock, AlertCircle, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function WomenSafety() {
  const safetyFeatures = [
    {
      icon: Shield,
      title: "Identity Verification",
      description: "All women-safe verified providers go through thorough identity checks and background screening",
    },
    {
      icon: Users,
      title: "Women-Only Options",
      description: "Filter tasks to only show or accept applications from verified women providers",
    },
    {
      icon: Lock,
      title: "Private Information",
      description: "Control what personal information is shared until you're comfortable",
    },
    {
      icon: Star,
      title: "Community Ratings",
      description: "See detailed ratings and reviews from other women in the community",
    },
    {
      icon: AlertCircle,
      title: "Report System",
      description: "Quick and confidential reporting system with dedicated women safety team",
    },
    {
      icon: Heart,
      title: "Support Network",
      description: "Access to community support groups and safety resources",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Tutor",
      content: "The women safety features make me feel confident accepting tasks. I love being part of a community that prioritizes our safety.",
      rating: 5,
    },
    {
      name: "Amanda K.",
      role: "Home Services",
      content: "As a single mom, knowing that I can request women-only providers for home services gives me peace of mind.",
      rating: 5,
    },
    {
      name: "Lisa T.",
      role: "Caregiver",
      content: "The verification process was thorough but worth it. Now I get more task requests because clients trust the safety badge.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "5,000+", label: "Women Members" },
    { value: "98%", label: "Safety Rating" },
    { value: "24/7", label: "Support Available" },
    { value: "100%", label: "Verified Providers" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-safe/10 to-background -z-10" />
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-safe/10 text-safe border-safe/20">
              <Shield className="w-3 h-3 mr-1" />
              Women Safety First
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Safety is Our
              <br />
              <span className="bg-gradient-to-r from-safe to-safe/70 bg-clip-text text-transparent">
                Top Priority
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              We've built comprehensive safety features to ensure women can confidently participate
              in our community, whether posting tasks or providing services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" variant="outline" className="text-lg">
                  Browse Safe Tasks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-safe">{stat.value}</p>
                <p className="text-sm md:text-base text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Comprehensive Safety Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple layers of protection designed specifically for women's safety
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-all hover:-translate-y-1">
                <div className="h-12 w-12 rounded-lg bg-safe/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-safe" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How Women Safety Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to ensure your safety on our platform
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: "Get Verified",
                  description: "Complete our secure verification process with ID check and background screening",
                },
                {
                  step: 2,
                  title: "Enable Safety Features",
                  description: "Choose women-only options when posting or browsing tasks",
                },
                {
                  step: 3,
                  title: "Connect Safely",
                  description: "Control information sharing and communicate through our secure platform",
                },
                {
                  step: 4,
                  title: "Build Trust",
                  description: "Rate experiences and help maintain a safe community for everyone",
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-safe text-white flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Trusted by Women
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from women in our community
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="h-10 w-10 rounded-full bg-safe/20 flex items-center justify-center font-semibold text-safe">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
