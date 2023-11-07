"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Loader2, Megaphone, XCircle } from "lucide-react"
import { Checkbox } from "../ui/checkbox"
import { useState } from "react"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

const FormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    codeName: z.string().min(4, {
        message: "Code name must be at least 4 characters.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})

const RegistrationForm = () => {

    const router = useRouter()

    const { setIsLoggedIn } = useAuth();

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "Serking de Orayom",
            codeName: "kingdeorayom",
            password: "Serking28;",
        },
    })

    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [registrationError, setRegistrationError] = useState(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const togglePassword = () => setIsPasswordShown(!isPasswordShown);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                setRegistrationSuccess(true);
                setRegistrationError(null);
                setIsSubmitting(false);
                localStorage.setItem('secret-santa-login-token', response.data.token);
                localStorage.setItem('secret-santa-user-data', JSON.stringify(response.data.user));
                setIsLoggedIn(true);
                router.push('/home')
            }
        } catch (error) {
            console.log(error)
            setRegistrationError(error.response.data.message);
            setRegistrationSuccess(false);
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-lg mx-auto">

            {
                registrationSuccess && (
                    <Alert className="mt-5 mb-5">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle className="font-bold">Registration Successful</AlertTitle>
                        <AlertDescription className="">
                            You have successfully registered for an account. Please proceed to login to continue.
                        </AlertDescription>
                    </Alert>
                )
            }

            {
                registrationError && (
                    <Alert className="mt-5 mb-5">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle className="font-bold">Oops!</AlertTitle>
                        <AlertDescription className="">{registrationError}</AlertDescription>
                    </Alert>
                )
            }

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="mb-4">
                                <FormLabel className="font-bold">Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your real name" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs mx-1">
                                    To ensure a smooth Secret Santa process, please provide your real name. It helps in matching participants accurately.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="codeName"
                        render={({ field }) => (
                            <FormItem className="mb-4">
                                <FormLabel className="font-bold">Code Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your code name" {...field} />
                                </FormControl>
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

                    <Alert className="mt-7 mb-5">
                        <Megaphone className="h-4 w-4" />
                        <AlertTitle className="font-bold">Disclaimer</AlertTitle>
                        {/* <AlertDescription>
                            Please note that I, Serking, is not liable for the data you provide, including your password, real name, or code name. Your information is kept secure, your password remain private to you, but you should exercise caution.
                        </AlertDescription> */}
                        <AlertDescription>
                            I am <span className="font-bold">not</span> liable for the data you provide, including your password, real name, or code name. Your information is kept secure, your password <span className="font-bold">remain private to you</span>, but you should exercise caution.
                        </AlertDescription>
                    </Alert>

                    <Button type="submit" className="w-full my-6" disabled={isSubmitting}>
                        {
                            isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Register'
                            )
                        }
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default RegistrationForm