import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate("/dashboard");
  };

  return (
    <Card className="max-w-md w-full m-2 p-5 h-[38rem] flex flex-col rounded-3xl bg-gradient-to-b from-blue-400 to-blue-700">
        <CardHeader className="space-y-1 mt-24 items-center">
            <CardTitle className="font-bold text-white text-5xl">Welcome!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-around">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Input type="text"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="rounded-3xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="rounded-3xl"
                        />
                    </div>
                    <div className="flex justify-center">
                        <Button className="w-[10rem] text-lg font-extrabold rounded-3xl bg-gradient-to-b from-yellow-400 to-yellow-700 transition-transform transform hover:scale-110" type="submit">
                            LOGIN!
                        </Button>
                    </div>
                </div>
            </form>
        </CardContent>
    </Card>
  )
};

export default LoginForm;
