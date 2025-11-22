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
      icon: Shield,
      title: "Women Safety Verified",
      description: "Special verification for women-only tasks and trusted providers",
      color: "text-safe",
    },
    {
      icon: Clock,
      title: "Urgency Levels",
      description: "Mark urgent tasks for faster community response",
      color: "text-urgent",
    },
    {
      icon: Star,
      title: "Skilled Professionals",
      description: "Find certified experts for specialized tasks",
      color: "text-accent",
    },
    {
      icon: CheckCircle,
      title: "Verified Community",
      description: "All members verified for safety and trust",
      color: "text-secondary",
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
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Users className="w-3 h-3 mr-1" />
                Join 10,000+ Community Members
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Exchange Skills,
                <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Build Community
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Connect with neighbors for trusted task exchange. From home repairs to professional services,
                find help or offer your skills with safety and convenience.
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
            <div className="relative hidden lg:block">
              <div className="relative h-[500px] w-full">
                <Card className="absolute top-0 right-0 p-4 w-72 shadow-large animate-float">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Women Safety</p>
                      <p className="text-sm text-muted-foreground">Verified providers</p>
                    </div>
                  </div>
                </Card>
                <Card className="absolute top-32 left-0 p-4 w-64 shadow-large animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Star className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold">Top Rated</p>
                      <p className="text-sm text-muted-foreground">5,000+ reviews</p>
                    </div>
                  </div>
                </Card>
                <Card className="absolute bottom-16 right-16 p-4 w-56 shadow-large animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-urgent/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-urgent" />
                    </div>
                    <div>
                      <p className="font-semibold">Urgent Task</p>
                      <p className="text-sm text-muted-foreground">Fast response</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm md:text-base text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Features</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Safety & Trust First
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built features that prioritize your safety and ensure trustworthy exchanges
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
            <Badge className="mb-4">Popular Categories</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Common Skills & Jobs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse tasks by category or offer your expertise
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
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join our growing community and start exchanging skills today. It's free to get started!
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
