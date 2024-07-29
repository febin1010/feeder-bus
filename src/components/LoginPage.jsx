import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-6 bg-white shadow-md rounded-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-semibold">Login</CardTitle>
          <CardDescription className="text-sm sm:text-base md:text-lg">
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm sm:text-base md:text-lg">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:px-4 sm:py-3 md:px-5 md:py-4"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm sm:text-base md:text-lg">Password</Label>
            <Input
              id="password"
              type="password"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:px-4 sm:py-3 md:px-5 md:py-4"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full py-2 sm:py-3 md:py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
