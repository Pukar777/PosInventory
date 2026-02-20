import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await login({ email, password })
            navigate("/")
        } catch (error) {
            console.error("Login failed", error)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-accent/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

            <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/70 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-4 pt-8">
                    <div className="flex justify-center mb-2">
                        <span
                            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-200 drop-shadow-md pb-4 pt-1 px-2"
                            style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive" }}
                        >
                            {import.meta.env.VITE_APP_NAME || 'Digital Waiter!'}
                        </span>
                    </div>
                    <CardTitle className="text-center text-2xl font-semibold tracking-tight">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email" className="sr-only">Email</Label>
                                <Input id="email" placeholder="Email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="bg-background/50" />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password" className="sr-only">Password</Label>
                                <Input id="password" type="password" placeholder="Password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} className="bg-background/50" />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col content-center space-y-4 pb-6">
                    <div className="w-full flex justify-start pl-1">
                        <a href="#" className="text-sm text-primary hover:underline transition-colors">Forgot Password?</a>
                    </div>
                    <Button type="submit" onClick={handleSubmit} className="w-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-semibold">Login</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
