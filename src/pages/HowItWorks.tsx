import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Search,
  MessageSquare,
  CheckCircle,
  Star,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up & Get Verified",
      description: "Create your free account and complete verification for trusted community access",
      color: "from-primary to-primary/80",
    },
    {
      icon: Search,
      title: "Browse or Post Tasks",
      description: "Find tasks that match your skills or post what you need help with",
      color: "from-secondary to-secondary/80",
    },
    {
      icon: MessageSquare,
      title: "Connect & Discuss",
      description: "Chat securely with community members to discuss task details",
      color: "from-accent to-accent/80",
    },
    {
      icon: CheckCircle,
      title: "Complete & Review",
      description: "Finish the task, exchange payment, and leave reviews to build trust",
      color: "from-safe to-safe/80",
    },
  ];

  const forTaskPosters = [
    {
      icon: Clock,
      title: "Set Your Timeline",
      description: "Choose urgency levels from flexible to urgent based on your needs",
    },
    {
      icon: Shield,
      title: "Control Safety",
      description: "Enable women-only options and verified providers filters",
    },
    {
      icon: DollarSign,
      title: "Fair Pricing",
      description: "Set your budget and negotiate directly with providers",
    },
  ];

  const forProviders = [
    {
      icon: Star,
      title: "Build Reputation",
      description: "Earn ratings and reviews to attract more tasks",
    },
    {
      icon: Shield,
      title: "Work Safely",
      description: "All clients are verified members of the community",
    },
    {
      icon: DollarSign,
      title: "Earn Fairly",
      description: "Set your rates and work on your own schedule",
    },
  ];

  const faqs = [
    {
      question: "How much does it cost?",
      answer: "Creating an account and browsing tasks is completely free. We only charge a small service fee when a task is completed.",
    },
    {
      question: "How do payments work?",
      answer: "Payments are handled securely through our platform. Funds are held in escrow and released when both parties confirm task completion.",
    },
    {
      question: "What if something goes wrong?",
      answer: "We have a dispute resolution team and comprehensive insurance coverage. Our community guidelines ensure fair treatment for all members.",
    },
    {
      question: "How is safety ensured?",
      answer: "All members undergo verification. We offer special women safety features, and our trust & safety team monitors the platform 24/7.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4">Getting Started</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              How HomeSkill-Hub
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Works
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Simple, safe, and effective community task exchange in four easy steps
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-12">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute left-8 top-24 w-0.5 h-32 bg-gradient-to-b from-border to-transparent" />
                  )}
                  <Card className="p-8 hover:shadow-large transition-all">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className={`flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center`}>
                        <step.icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            Step {index + 1}
                          </Badge>
                          <h3 className="text-2xl font-bold">{step.title}</h3>
                        </div>
                        <p className="text-lg text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Task Posters & Providers */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Task Posters */}
            <div>
              <div className="mb-8">
                <Badge className="mb-4 bg-primary/10 text-primary">For Task Posters</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Need Help?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Post your task and connect with skilled community members
                </p>
              </div>
              <div className="space-y-4">
                {forTaskPosters.map((item, index) => (
                  <Card key={index} className="p-6 hover:shadow-medium transition-all">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Link to="/post-task">
                <Button size="lg" className="mt-6 w-full md:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Post a Task
                </Button>
              </Link>
            </div>

            {/* Providers */}
            <div>
              <div className="mb-8">
                <Badge className="mb-4 bg-secondary/10 text-secondary">For Providers</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Offer Your Skills
                </h2>
                <p className="text-lg text-muted-foreground">
                  Find tasks that match your expertise and earn on your schedule
                </p>
              </div>
              <div className="space-y-4">
                {forProviders.map((item, index) => (
                  <Card key={index} className="p-6 hover:shadow-medium transition-all">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Link to="/browse">
                <Button size="lg" className="mt-6 w-full md:w-auto" variant="outline">
                  Browse Tasks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4">FAQs</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Common Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know to get started
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Join?
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Create your free account today and become part of our thriving community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg">
              Sign Up Now
            </Button>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 text-lg">
                Explore Tasks
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
