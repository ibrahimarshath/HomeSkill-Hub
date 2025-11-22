import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Users,
  Shield,
  Clock,
  Star,
  CheckCircle,
  TrendingUp,
  Heart,
  Briefcase,
  Home as HomeIcon,
  Wrench,
  BookOpen,
  Palette,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: CheckCircle,
      title: "Quick & Easy",
      description: "Post a task in seconds and get help within hours",
      color: "text-secondary",
    },
    {
      icon: Shield,
      title: "Safe & Trusted",
      description: "Verified members with ratings and reviews",
      color: "text-safe",
    },
    {
      icon: Star,
      title: "Top Rated Buddies",
      description: "Find skilled professionals verified by community",
      color: "text-accent",
    },
    {
      icon: Clock,
      title: "Always Available",
      description: "Urgent or flexible - we have buddies for all timelines",
      color: "text-urgent",
    },
  ];

  const skillCategories = [
    { icon: Briefcase, name: "Professional Services", count: "234 tasks" },
    { icon: HomeIcon, name: "Home & Garden", count: "189 tasks" },
    { icon: Wrench, name: "Repair & Maintenance", count: "156 tasks" },
    { icon: BookOpen, name: "Teaching & Tutoring", count: "142 tasks" },
    { icon: Palette, name: "Creative Services", count: "98 tasks" },
    { icon: Heart, name: "Care & Support", count: "87 tasks" },
  ];

  const stats = [
    { value: "10K+", label: "Active Members" },
    { value: "5K+", label: "Tasks Completed" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Community Support" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-20 md:py-32">
        <div className="container px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-2">
                  <img src="/logo.svg" alt="logo" className="h-8 w-8 rounded-full object-cover" />
                  <img src="/icon-ready.svg" alt="badge" className="h-6 w-6 rounded-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-primary">Join the community</span>
                  <span className="text-xs text-muted-foreground">Trusted helpers, verified profiles</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Got a Task?
                <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Get a Buddy
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Help is just a click away. Hire a buddy for any task. From home repairs to professional services,
                find trusted help when you need it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/browse">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg w-full sm:w-auto">
                    Browse Tasks
                  </Button>
                </Link>
                <Link to="/post-task">
                  <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto">
                    Post a Task
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-full h-[500px] perspective">
                {/* Animated rotating cards */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Card 1 - Rotating */}
                    <Card className="absolute top-1/4 right-0 p-6 w-72 shadow-2xl hover:shadow-none transition-all duration-300 hover:scale-110 hover:-rotate-2 cursor-pointer group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-transform">
                          <img src="/feature-target.svg" alt="target" className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Easy Posting</p>
                          <p className="text-sm text-muted-foreground">Post your task in seconds</p>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Card 2 - Rotating */}
                    <Card className="absolute top-0 left-0 p-6 w-64 shadow-2xl hover:shadow-none transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer group bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20" style={{ animation: 'float 4s ease-in-out infinite 1s' }}>
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-transform">
                          <img src="/feature-star.svg" alt="star" className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-bold text-secondary">Find Experts</p>
                          <p className="text-sm text-muted-foreground">Vetted professionals</p>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Card 3 - Rotating */}
                    <Card className="absolute bottom-0 right-12 p-6 w-56 shadow-2xl hover:shadow-none transition-all duration-300 hover:scale-110 hover:-rotate-1 cursor-pointer group bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20" style={{ animation: 'float 4s ease-in-out infinite 2s' }}>
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-accent to-urgent flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-transform">
                          <img src="/feature-chat.svg" alt="chat" className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-bold text-accent">Get Connected</p>
                          <p className="text-sm text-muted-foreground">Chat and coordinate</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Stats Section */}
      <section className="py-16 border-y bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white/50 backdrop-blur border border-primary/10 hover:border-primary/30 transition-all group cursor-pointer hover:-translate-y-1 hover:shadow-lg">
              <img src="/icon-lightning.svg" alt="lightning" className="h-10 w-10 mb-2" />
              <p className="text-sm font-semibold text-primary mb-1">Lightning Fast</p>
              <p className="text-xs text-muted-foreground">Get matched instantly</p>
            </div>
            <div className="p-6 rounded-xl bg-white/50 backdrop-blur border border-secondary/10 hover:border-secondary/30 transition-all group cursor-pointer hover:-translate-y-1 hover:shadow-lg">
              <img src="/icon-secure.svg" alt="secure" className="h-10 w-10 mb-2" />
              <p className="text-sm font-semibold text-secondary mb-1">Super Secure</p>
              <p className="text-xs text-muted-foreground">Your data is protected</p>
            </div>
            <div className="p-6 rounded-xl bg-white/50 backdrop-blur border border-accent/10 hover:border-accent/30 transition-all group cursor-pointer hover:-translate-y-1 hover:shadow-lg">
              <img src="/icon-prices.svg" alt="prices" className="h-10 w-10 mb-2" />
              <p className="text-sm font-semibold text-accent mb-1">Best Prices</p>
              <p className="text-xs text-muted-foreground">Fair and transparent</p>
            </div>
            <div className="p-6 rounded-xl bg-white/50 backdrop-blur border border-urgent/10 hover:border-urgent/30 transition-all group cursor-pointer hover:-translate-y-1 hover:shadow-lg">
              <img src="/icon-ready.svg" alt="ready" className="h-10 w-10 mb-2" />
              <p className="text-sm font-semibold text-urgent mb-1">Always Ready</p>
              <p className="text-xs text-muted-foreground">24/7 buddy support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Why TaskBuddy</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Find Help or Earn Money
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, safe, and fast task matching
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-all hover:-translate-y-1">
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Browse Tasks</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Tasks for Every Skill
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find your perfect task or job
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-all hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <category.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/browse">
              <Button size="lg" variant="outline">
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Don't Do It Alone
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Find your buddy today. Get help with any task or offer your skills to earn. It's free to get started!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg">
              Sign Up Now
            </Button>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
