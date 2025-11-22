import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Shield, Clock, Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/browse", label: "Browse Tasks" },
    { to: "/post-task", label: "Post Task" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/women-safety", label: "Women Safety" },
    { to: "/how-it-works", label: "How It Works" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Users className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
              <Shield className="h-4 w-4 text-secondary absolute -right-1 -bottom-1" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              HomeSkill-Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={isActive(link.to) ? "default" : "ghost"}
                  className="transition-all"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
                <Link to="/my-profile">
                  <Button variant="outline" size="sm" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    My Profile
                  </Button>
                </Link>
                <Button variant="outline" onClick={logout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <nav className="container flex flex-col space-y-2 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(link.to) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t">
                {user ? (
                  <>
                    <Link to="/my-profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <UserIcon className="h-4 w-4" />
                        My Profile
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="bg-gradient-to-r from-primary to-secondary w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">HomeSkill-Hub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Building stronger communities through trusted task exchange and skill sharing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/browse" className="hover:text-primary transition-colors">Browse Tasks</Link></li>
                <li><Link to="/post-task" className="hover:text-primary transition-colors">Post a Task</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Safety</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/women-safety" className="hover:text-primary transition-colors">Women Safety</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 HomeSkill-Hub. Built with care for communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
