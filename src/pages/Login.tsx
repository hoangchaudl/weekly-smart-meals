import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState(""); // <--- 1. New State for Name
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 2. Save the name to Supabase metadata
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      });
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isLoginMode && email && password) {
        handleLogin();
      } else if (
        !isLoginMode &&
        email &&
        password &&
        confirmPassword &&
        fullName
      ) {
        handleSignup();
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setConfirmPassword("");
    setFullName(""); // Clear name on toggle
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-[380px] border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLoginMode
              ? "Enter your credentials to access your account"
              : "Enter your details to get started"}
          </p>
        </div>

        <div className="space-y-4">
          {/* 3. Name Input (Only shows in Signup Mode) */}
          {!isLoginMode && (
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {!isLoginMode && (
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}

          <Button
            className="w-full font-semibold mt-2"
            onClick={isLoginMode ? handleLogin : handleSignup}
            disabled={
              loading ||
              !email ||
              !password ||
              (!isLoginMode && (!confirmPassword || !fullName)) // Require name for signup
            }
          >
            {loading ? "Processing..." : isLoginMode ? "Sign In" : "Sign Up"}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">
            {isLoginMode
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            className="text-primary font-bold hover:underline focus:outline-none"
            onClick={toggleMode}
          >
            {isLoginMode ? "Sign up" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
