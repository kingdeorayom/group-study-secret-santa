"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Terminal, XCircle } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { Label } from "../ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Separator } from "../ui/separator"

const LoginSchema = z.object({
    codeName: z.string().min(1, {
        message: "Code name is required.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})

const ForgotPasswordSchema = z.object({
    codeName: z.string().min(1, {
        message: "Code name is required.",
    }),
    newPassword: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
}).superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
        ctx.addIssue({
            code: "custom",
            message: "New password and confirm password do not match.",
            path: ['confirmPassword']
        });
    }
})

const LoginForm = () => {

    const router = useRouter()

    const currentDate = new Date();
    const targetDate = new Date('November 28, 2023');

    const isButtonDisabled = currentDate > targetDate;

    const { setIsLoggedIn, updateUserData } = useAuth();

    const loginForm = useForm({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            codeName: "",
            password: "",
        },
    })

    const forgotPasswordForm = useForm({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            codeName: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const { reset: resetForgotPassword } = forgotPasswordForm

    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [fetchStatus, setFetchStatus] = useState(false);

    const [isPasswordChanging, setIsPasswordChanging] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState(null);
    const [isChangePasswordSuccess, setIsChangePasswordSuccess] = useState(null);

    const togglePassword = () => setIsPasswordShown(!isPasswordShown);

    const onSubmit = async (data) => {
        setIsLoggingIn(true);
        let timeoutId;

        try {

            timeoutId = setTimeout(() => {
                setFetchStatus(true);
            }, 5000);

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Clear the timer as the response is received within 5 seconds
            clearTimeout(timeoutId);

            if (response.status === 200) {
                setLoginError(null);
                setIsLoggingIn(false);
                localStorage.setItem('secret-santa-login-token', response.data.token);
                localStorage.setItem('secret-santa-user-data', JSON.stringify(response.data.user));
                const storedUserData = JSON.parse(localStorage.getItem('secret-santa-user-data'));
                updateUserData(storedUserData)
                setIsLoggedIn(true)
                router.push('/home')
            }

        } catch (error) {
            if (error.response && error.response.data) {
                setLoginError(error.response.data.message);
            } else {
                setLoginError("An error occurred during login.");
            }
            setIsLoggingIn(false);
        } finally {
            clearTimeout(timeoutId);
            setFetchStatus(false);
            setIsLoggingIn(false);
        }
    }

    const onForgotPasswordChange = async (data) => {

        setIsPasswordChanging(true)

        let timeoutId;

        setTimeout(async () => {
            try {

                timeoutId = setTimeout(() => {
                    setFetchStatus(true);
                }, 5000);

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/reset-password`,
                    data
                );

                // Clear the timer as the response is received within 5 seconds
                clearTimeout(timeoutId);

                if (response.status === 200) {
                    setIsPasswordChanging(false)
                    setForgotPasswordError(null);
                    setIsChangePasswordSuccess("Password changed successfully.")
                    resetForgotPassword()
                } else {
                    setIsPasswordChanging(false)
                    console.error('Error changing password');
                }
            } catch (error) {

                if (error.response && error.response.data) {
                    setForgotPasswordError(error.response.data.message);
                } else {
                    setForgotPasswordError("An error occurred while changing your password");
                }
                setIsPasswordChanging(false)
                // console.error('Error adding wishlist item', error);
            } finally {
                clearTimeout(timeoutId);
                setFetchStatus(false);
            }
        }, 1000);

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

            <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onSubmit)}>
                    <FormField
                        control={loginForm.control}
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
                        control={loginForm.control}
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

                    <Button type="submit" className="w-full mt-6 mb-4" disabled={isLoggingIn}>
                        {
                            isLoggingIn ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <Label>{fetchStatus ? 'Taking longer than usual. Please wait...' : 'Logging in'}</Label>
                                </>
                            ) : (
                                'Log in'
                            )
                        }
                    </Button>

                </form>

            </Form>

            <div className="text-center mb-20">
                <Dialog>
                    <DialogTrigger>
                        <Label className="font-normal underline text-xs cursor-pointer">
                            I forgot my password
                        </Label>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        {
                            isButtonDisabled ?
                                <DialogHeader>
                                    <DialogTitle>Forgot your password?</DialogTitle>
                                    <DialogDescription>
                                        Contact the developer for assistance.
                                    </DialogDescription>
                                </DialogHeader> :
                                <Form {...forgotPasswordForm}>
                                    <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordChange)}>
                                        <DialogHeader>
                                            <DialogTitle>Forgot your password?</DialogTitle>
                                            <DialogDescription>
                                                Enhance account security with a strong, unique password. And make sure to remember it the next time!
                                            </DialogDescription>
                                        </DialogHeader>
                                        {
                                            forgotPasswordError && (
                                                <Alert className="mt-5 mb-5">
                                                    <XCircle className="h-4 w-4" />
                                                    <AlertTitle className="font-bold">Oops!</AlertTitle>
                                                    <AlertDescription className="">{forgotPasswordError}</AlertDescription>
                                                </Alert>
                                            )
                                        }
                                        {
                                            isChangePasswordSuccess && (
                                                <Alert className="mt-5 mb-5">
                                                    <Terminal className="h-4 w-4" />
                                                    <AlertTitle className="font-bold">Success!</AlertTitle>
                                                    <AlertDescription className="">{isChangePasswordSuccess}</AlertDescription>
                                                </Alert>
                                            )
                                        }
                                        <FormField
                                            control={forgotPasswordForm.control}
                                            name="codeName"
                                            render={({ field }) => (
                                                <FormItem className="mb-2 mt-3">
                                                    <FormLabel className="font-bold">Code Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter your code name" {...field} />
                                                    </FormControl>
                                                    <FormDescription className="text-xs mx-1">
                                                        Make sure to enter the code name exactly as you did during registration. In case of forgotten code name, ask Serking.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={forgotPasswordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem className="mb-2 mt-3">
                                                    <FormLabel className="font-bold">New Password</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter your new password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={forgotPasswordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem className="mb-2 mt-3">
                                                    <FormLabel className="font-bold">Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Re-enter your new password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Separator className="mt-5 mb-3" />

                                        <FormDescription className="text-xs mx-1">
                                            {"You won't be able to reset your password via code name once the participant picking has started. Please remember your password this time!"}
                                        </FormDescription>

                                        <DialogFooter className="mt-6">
                                            <Button type="submit" className="w-full" disabled={isPasswordChanging}>
                                                {
                                                    isPasswordChanging ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            <Label>{fetchStatus ? 'Taking longer than usual. Please wait...' : 'Updating your password'}</Label>
                                                        </>
                                                    ) : (
                                                        'Submit'
                                                    )
                                                }
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                        }
                    </DialogContent>

                </Dialog>
            </div>

            {
                fetchStatus && (
                    <>
                        <p className="text-xs text-center mb-3">{"Logging in is taking longer than usual. This could be due to the speed of your internet connection or a server problem in general. Please don't close the page and wait patiently."}</p>
                        <p className="text-xs text-center mb-3">For the meantime, why not <Link href="https://speedtest.net" target="_blank" className="text-blue-500 underline">test your internet connection speed</Link>?</p>
                    </>
                )
            }

        </div>
    )
}

export default LoginForm