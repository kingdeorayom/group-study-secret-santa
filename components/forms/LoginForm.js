"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, XCircle } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/context/AuthContext"

const FormSchema = z.object({
    codeName: z.string().min(4, {
        message: "Code name must be at least 4 characters.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 8 characters.",
    }),
})

const LoginForm = () => {

    const router = useRouter()

    const { setIsLoggedIn, updateUserData } = useAuth();

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            codeName: "participant_1",
            password: "Serking28;",
        },
    })

    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const togglePassword = () => setIsPasswordShown(!isPasswordShown);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setLoginError(null);
                setIsSubmitting(false);
                localStorage.setItem('secret-santa-login-token', response.data.token);
                localStorage.setItem('secret-santa-user-data', JSON.stringify(response.data.user));
                const storedUserData = JSON.parse(localStorage.getItem('secret-santa-user-data'));
                updateUserData(storedUserData)
                setIsLoggedIn(true)
                router.push('/home')
            }

        } catch (error) {
            setLoginError(error.response.data.message);
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-lg mx-auto">

            {
                loginError && (
                    <Alert className="mt-5 mb-5">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle className="font-bold">Oops!</AlertTitle>
                        <AlertDescription className="">{loginError}</AlertDescription>
                    </Alert>
                )
            }

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="codeName"
                        render={({ field }) => (
                            <FormItem className="mb-4">
                                <FormLabel className="font-bold">Code Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your code name" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs mx-1">
                                    Code name is case-sensitive. Make sure to enter the code name exactly as you did during registration.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="mb-3">
                                <FormLabel className="font-bold">Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your password" type={isPasswordShown ? "text" : "password"} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="items-top flex justify-start space-x-2 mt-5 mb-5">
                        <Checkbox
                            id="showPassword"
                            onCheckedChange={togglePassword}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="showPassword"
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Show password
                            </label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full my-6" disabled={isSubmitting}>
                        {
                            isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Log in'
                            )
                        }
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default LoginForm