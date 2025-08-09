import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const [location, setLocation] = useLocation();
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    managerCode: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);
    // Validation: managerCode is required
    if (!form.managerCode) {
      setError("Manager code is required for manager registration.");
      setIsPending(false);
      return;
    }
    // TODO: Call API to register
    setTimeout(() => {
      setSuccess("Registration successful! Please login.");
      setIsPending(false);
    }, 1000);
  };

  return (
  <div className="min-h-screen flex items-center justify-center cosmic-bg py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
<style jsx global>{`
  .cosmic-bg {
    position: relative;
    background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
    min-height: 100vh;
    overflow: hidden;
  }
  .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
    opacity: 0.8;
    animation: twinkle 2s infinite ease-in-out;
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.2; }
  }
`}</style>
{Array.from({ length: 60 }).map((_, i) => (
  <div
    key={i}
    className="star"
    style={{
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
    }}
  />
))}
      <div className="max-w-lg w-full space-y-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-primary rounded-xl flex items-center justify-center mb-8">
            <i className="fas fa-user-plus text-white text-4xl"></i>
          </div>
          <h2 className="text-4xl font-extrabold text-white drop-shadow-md">Manager Registration</h2>
          <p className="mt-4 text-lg text-gray-200 font-medium drop-shadow">Only managers can register an account</p>
        </div>
        <Card className="bg-black/70 backdrop-blur-md border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold">Sign Up</CardTitle>
            <CardDescription className="text-base text-gray-200 font-medium">Fill in the details to register as a manager</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="success">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-lg text-white font-semibold">Username</Label>
                  <Input id="username" type="text" value={form.username} onChange={handleChange("username")} required className="mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-lg text-white font-semibold">Password</Label>
                  <Input id="password" type="password" value={form.password} onChange={handleChange("password")} required className="mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60" />
                </div>
                <div>
                  <Label htmlFor="fullName" className="text-lg text-white font-semibold">Full Name</Label>
                  <Input id="fullName" type="text" value={form.fullName} onChange={handleChange("fullName")} required className="mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-lg text-white font-semibold">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={handleChange("email")} required className="mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60" />
                </div>
                <div>
                  <Label htmlFor="managerCode" className="text-lg text-white font-semibold">Manager Code</Label>
                  <Input id="managerCode" type="text" value={form.managerCode} onChange={handleChange("managerCode")} required className="mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60" />
                  <p className="text-base text-gray-300 mt-2">A valid manager code is required to register.</p>
                </div>
              </div>
              <Button type="submit" className="w-full text-lg py-3 bg-primary text-white font-bold hover:bg-primary/90" disabled={isPending}>
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing up...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Register
                  </>
                )}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <Button variant="link" type="button" className="text-lg text-primary font-bold" onClick={() => setLocation("/login")}>Already have an account? Login</Button>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
          <p className="text-base text-gray-200 font-medium">Arnifi Face Recognition Attendance System</p>
        </div>
      </div>
    </div>
  );
}
