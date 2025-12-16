import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-services.jpg";
import { Zap, Shield, Clock, Star } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Zap,
      title: "Quick Booking",
      description: "Find and book services in minutes with our easy-to-use platform",
    },
    {
      icon: Shield,
      title: "Trusted Providers",
      description: "All service providers are verified and rated by real customers",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Book services anytime, anywhere at your convenience",
    },
    {
      icon: Star,
      title: "Quality Assured",
      description: "Top-rated professionals ensuring excellent service quality",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Find Trusted Local Services Near You
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect with skilled professionals for all your service needs - from electricians to tutors, we've got you covered.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <img 
                src={heroImage} 
                alt="Local Services" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Smart Service Hub?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We make finding and booking local services simple, safe, and convenient
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their service needs
          </p>
          <Button asChild size="lg" className="shadow-lg">
            <Link to="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
