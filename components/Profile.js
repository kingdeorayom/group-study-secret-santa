'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Loader2, Terminal, X, XCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge"
import no_information_provided from '../public/no_information_provided.png'
import Image from 'next/image';
import { Input } from './ui/input';
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const AddWishlistSchema = z.object({
    title: z.string().min(1, {
        message: "Please add a title.",
    }),
    priority: z.string().min(1, {
        message: "Please select a priority.",
    }),
    description: z.string(),
});

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(8, {
        message: "Password must be at least 8 characters.",
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
});

const Profile = ({ isLoggedIn, setIsLoggedIn, router }) => {

    const targetDate = new Date('2023-12-02');
    const currentDate = new Date();
    const isAfterTargetDate = currentDate < targetDate;

    const { userData, updateUserData } = useAuth();

    const [wishlist, setWishlist] = useState([])
    const [wishlistFetchStatus, setWishlistFetchStatus] = useState(false);
    const [isFetchingWishlist, setIsFetchingWishlist] = useState(false);

    const getUserWishlist = async () => {

        const userId = userData.userId;
        const token = localStorage.getItem('secret-santa-login-token');

        let timeoutId;

        setIsFetchingWishlist(true)

        setTimeout(async () => {
            try {

                timeoutId = setTimeout(() => {
                    setWishlistFetchStatus(true);
                }, 5000);

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/wishlist`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const fetchedWishlist = response.data;
                setWishlist(fetchedWishlist); // Update the state with the fetched data
                setIsFetchingWishlist(false)
            } catch (error) {
                console.error('Error fetching user wishlist', error);
                setIsFetchingWishlist(false)
                // updateUserData(null) // remove if misbehaved
                localStorage.removeItem('secret-santa-login-token');
                localStorage.removeItem('secret-santa-user-data');
                router.push('/') // remove if misbehaved
            } finally {
                clearTimeout(timeoutId);
                setWishlistFetchStatus(false);
                setIsFetchingWishlist(false)
            }
        }, 1000);
    }

    useEffect(() => {
        getUserWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addWishlistForm = useForm({
        resolver: zodResolver(AddWishlistSchema),
        defaultValues: {
            title: "",
            priority: "High",
            description: "",
            links: []
        },
    })

    const changePasswordForm = useForm({
        resolver: zodResolver(ChangePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const { reset: resetAddWishlist } = addWishlistForm

    const { reset: resetChangePassword } = changePasswordForm;

    const handleLogout = () => {
        if (isLoggedIn) {
            setIsLoggedIn(false);
            localStorage.removeItem('secret-santa-login-token');
            localStorage.removeItem('secret-santa-user-data');
            updateUserData(null)
            router.push('/');
        } else {
            console.error('Logout failed. User is not logged in.');
        }
    }

    const [inputLink, setInputLink] = useState("");
    const [isAddWishlistDialogOpen, setIsAddWishlistDialogOpen] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);
    const [isRemovingFromWishlist, setIsRemovingFromWishlist] = useState(false);
    const [fetchStatus, setFetchStatus] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [isChangePasswordSuccess, setIsChangePasswordSuccess] = useState(null);

    const [links, setLinks] = useState([])

    const handleInputLinkChange = (e) => {
        setInputLink(e.target.value);
    };

    const addToLinks = () => {
        const trimmedInput = inputLink.trim();
        if (trimmedInput !== '') {
            setLinks([...links, trimmedInput]);
            setInputLink('');
        } else {
            alert('Invalid input. Please try again.')
        }
    };

    const removeLink = (index) => {
        const updatedLinks = [...links];
        updatedLinks.splice(index, 1);
        setLinks(updatedLinks);
    };

    const removeWishlist = async (itemId) => {
        setIsRemovingFromWishlist(true)
        let timeoutId;

        setTimeout(async () => {
            try {

                timeoutId = setTimeout(() => {
                    setFetchStatus(true);
                }, 5000);

                const userId = userData.userId;
                const token = localStorage.getItem('secret-santa-login-token');
                await axios.delete(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/delete-wishlist/${userId}/${itemId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                // Clear the timer as the response is received within 5 seconds
                clearTimeout(timeoutId);
                const updatedWishlist = wishlist.filter((item) => item._id !== itemId);
                setIsRemovingFromWishlist(false)
                setWishlist(updatedWishlist);
            } catch (error) {
                if (error.response && error.response.data) {
                    console.error(error.response.data.message);
                } else {
                    console.error("An error occurred while removing an item from your wishlist.");
                }
                setIsRemovingFromWishlist(false)
                // console.error('Error deleting wishlist item', error);
            } finally {
                clearTimeout(timeoutId);
                setFetchStatus(false);
            }
        }, 1000);
    };

    const onSubmitWishlist = async (data) => {

        data['links'] = links;

        setIsAddingToWishlist(true)
        let timeoutId;

        setTimeout(async () => {
            try {

                timeoutId = setTimeout(() => {
                    setFetchStatus(true);
                }, 5000);

                const userId = userData.userId;
                const token = localStorage.getItem('secret-santa-login-token');

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/add-wishlist/${userId}`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Clear the timer as the response is received within 5 seconds
                clearTimeout(timeoutId);

                if (response.status === 201) {
                    const newItem = response.data.data;
                    setWishlist((prevWishlist) => [...prevWishlist, newItem]);
                    setIsAddingToWishlist(false)
                    setIsAddWishlistDialogOpen(false)
                    resetAddWishlist()
                    setInputLink("")
                    setLinks([])
                } else {
                    setIsAddingToWishlist(false)
                    console.error('Error adding wishlist item');
                }
            } catch (error) {

                if (error.response && error.response.data) {
                    console.error(error.response.data.message);
                } else {
                    console.error("An error occurred while adding an item to your wishlist.");
                }
                setIsAddingToWishlist(false)
                // console.error('Error adding wishlist item', error);
            } finally {
                clearTimeout(timeoutId);
                setFetchStatus(false);
            }
        }, 1000);
    };

    const onPasswordChange = async (data) => {

        data['userId'] = userData.userId;

        setIsPasswordChanging(true)
        let timeoutId;

        setTimeout(async () => {
            try {

                timeoutId = setTimeout(() => {
                    setFetchStatus(true);
                }, 5000);

                const token = localStorage.getItem('secret-santa-login-token');

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/change-password`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Clear the timer as the response is received within 5 seconds
                clearTimeout(timeoutId);

                if (response.status === 200) {
                    setIsPasswordChanging(false)
                    setPasswordError(null);
                    setIsChangePasswordSuccess("Password changed successfully.")
                    resetChangePassword()
                } else {
                    setIsPasswordChanging(false)
                    console.error('Error changing password');
                }
            } catch (error) {

                if (error.response && error.response.data) {
                    setPasswordError(error.response.data.message);
                } else {
                    setPasswordError("An error occurred while changing your password");
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
        <section className="max-w-lg mx-auto">

            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="mb-1">
                                {userData.codeName}
                            </CardTitle>
                            <CardDescription>
                                {userData.name}
                                {/* <div>
                                    <Label className="font-light text-xs opacity-50">
                                        {`Picker ID: ${userData.userId}`}
                                    </Label>
                                </div> */}
                            </CardDescription>


                            <Dialog>
                                <DialogTrigger asChild>
                                    <Label className="font-normal underline text-xs cursor-pointer mt-2">
                                        Change password
                                    </Label>
                                </DialogTrigger>

                                <DialogContent className="sm:max-w-[425px]">
                                    <Form {...changePasswordForm}>
                                        <form onSubmit={changePasswordForm.handleSubmit(onPasswordChange)}>
                                            <DialogHeader>
                                                <DialogTitle>Change your password</DialogTitle>
                                                <DialogDescription>
                                                    Enhance account security with a strong, unique password.
                                                </DialogDescription>
                                            </DialogHeader>
                                            {
                                                passwordError && (
                                                    <Alert className="mt-5 mb-5">
                                                        <XCircle className="h-4 w-4" />
                                                        <AlertTitle className="font-bold">Oops!</AlertTitle>
                                                        <AlertDescription className="">{passwordError}</AlertDescription>
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
                                                control={changePasswordForm.control}
                                                name="currentPassword"
                                                render={({ field }) => (
                                                    <FormItem className="mb-2 mt-3">
                                                        <FormLabel className="font-bold">Current Password</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter your current password" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={changePasswordForm.control}
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
                                                control={changePasswordForm.control}
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

                                            <DialogFooter className="mt-6">
                                                <Button type="submit" className="w-full" disabled={isPasswordChanging}>
                                                    {
                                                        isPasswordChanging ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                <Label>{fetchStatus ? 'Taking longer than usual. Please wait...' : 'Updating your password'}</Label>
                                                            </>
                                                        ) : (
                                                            'Save changes'
                                                        )
                                                    }
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>



                            </Dialog>






                        </div>
                        <Button onClick={handleLogout} className="bg-red-700 hover:bg-red-800">Log out</Button>
                    </div>
                </CardHeader>
                <Separator />
                <CardFooter className="flex justify-between mt-5">
                    <Label className="font-light text-xs">
                        Editing profile details are prohibited to avoid any possible form of confusion.
                    </Label>
                </CardFooter>
            </Card>

            <Card className="w-full mt-4">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className='flex-1'>
                            <CardTitle className="mb-2">My Wishlist</CardTitle>
                            <CardDescription>{`A wishlist will assist the participant who picks you in making a thoughtful gift choice.`}</CardDescription>
                        </div>

                        <Dialog open={isAddWishlistDialogOpen} onOpenChange={setIsAddWishlistDialogOpen}>
                            {
                                isAfterTargetDate ? (
                                    <DialogTrigger asChild>
                                        <Button
                                            className="ms-8"
                                            variant="outline"
                                            onClick={() => {
                                                setIsAddWishlistDialogOpen(true)
                                                resetAddWishlist()
                                                setInputLink("")
                                                setLinks([])
                                            }
                                            }
                                        >
                                            Add item
                                        </Button>
                                    </DialogTrigger>
                                ) : null
                            }
                            <DialogContent className="sm:max-w-[425px]">
                                <Form {...addWishlistForm}>
                                    <form onSubmit={addWishlistForm.handleSubmit(onSubmitWishlist)}>
                                        <DialogHeader>
                                            <DialogTitle>Add item to your wishlist</DialogTitle>
                                            <DialogDescription>
                                                Enter your desired item and, optionally, links where the item can be bought.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <FormField
                                            control={addWishlistForm.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem className="mb-2 mt-3">
                                                    <FormLabel className="font-bold">Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter title" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={addWishlistForm.control}
                                            name='priority'
                                            render={({ field }) => (
                                                <FormItem className="mb-2 mt-3">
                                                    <FormLabel className="font-bold">Priority</FormLabel>
                                                    <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    {...field}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Select priority</SelectLabel>
                                                                <SelectItem value="High">High</SelectItem>
                                                                <SelectItem value="Medium">Medium</SelectItem>
                                                                <SelectItem value="Low">Low</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={addWishlistForm.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem className="mb-2 mt-3">
                                                    <FormLabel className="font-bold">Description</FormLabel>
                                                    <FormControl>
                                                        {/* <Input placeholder="Enter description" {...field} /> */}
                                                        <Textarea placeholder="Add additional notes about the item such as its color, size, or variant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Separator className="mt-5 mb-3" />
                                        <FormLabel className="font-bold">Links</FormLabel>
                                        <div className="flex items-center">
                                            <Input className="mt-2" control={addWishlistForm.control} value={inputLink} onChange={handleInputLinkChange} placeholder="Enter a store link here" />
                                            <Button type="button" variant="outline" className="mt-2 ms-2" onClick={addToLinks}>
                                                Add link
                                            </Button>
                                        </div>
                                        <div className="mt-4">
                                            <p className='text-xs'>Added links:</p>
                                            {
                                                links.map((item, index) => {
                                                    return (
                                                        <div key={index} className='flex justify-between items-center my-2'>
                                                            <Link
                                                                href={item}
                                                                target='_blank'
                                                            >
                                                                <p className="text-xs text-blue-500 mt-3 hover:underline line-clamp-2">
                                                                    {`${item}`}
                                                                </p>
                                                            </Link>
                                                            <Button variant="outline" size="icon" onClick={() => removeLink(index)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                        <Separator className="mt-5 mb-5" />
                                        <DialogFooter className="mt-6">
                                            <Button type="submit" disabled={isAddingToWishlist}>
                                                {
                                                    isAddingToWishlist ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            <Label>{fetchStatus ? 'Taking longer than usual. Please wait...' : 'Adding to wishlist'}</Label>
                                                        </>
                                                    ) : (
                                                        'Save'
                                                    )
                                                }
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                    </div>
                </CardHeader>
                <Separator />
                <CardFooter className="flex justify-between mt-5 pb-2">
                    <Label className="font-light text-xs">
                        {`Note that you won't be able to add a wishlist starting ${targetDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}`}
                    </Label>
                </CardFooter>
                <CardFooter className="flex justify-between">
                    <Label className="font-light text-xs">
                        {"I apologize for any inconvenience, but currently, you won't be able to edit the details of a wishlist item. If adjustments are needed, I recommend creating a new wishlist item and removing the outdated one. Thank you for your understanding."}
                    </Label>
                </CardFooter>
            </Card>

            {
                isFetchingWishlist ? (
                    <div className='flex justify-center mt-5'>
                        <div className="flex items-center my-5">
                            <div role="status">
                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-slate-800" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                            </div>
                            {
                                wishlistFetchStatus ?
                                    <p className='text-xs font-light ms-3'>Taking longer than usual. Please wait...</p>
                                    : null
                            }
                        </div>
                    </div>
                ) :
                    (
                        wishlist.length === 0 ? (
                            <div className="text-center mt-12 mb-3">
                                <div className='mx-auto'>
                                    <Image
                                        src={no_information_provided}
                                        className='max-w-48 max-h-48 object-contain mb-4'
                                        alt='Question Flatline'
                                    />
                                    <Label className="text-sm font-light">
                                        Your wishlist is empty.
                                    </Label>
                                </div>
                            </div>
                        ) : (
                            wishlist.map((item) => {
                                return (
                                    <Card className="w-full mt-4" key={item._id}>
                                        <CardContent className="mt-3">
                                            <div className="py-1 rounded-lg">
                                                <Badge variant="outline">{`${item.priority} Priority`}</Badge>
                                                <p className="font-semibold mt-2 mb-2">{`${item.title}`}</p>
                                                <p className="text-xs mt-2 mb-1 text-slate-500 font-semibold me-1">Additional note for this item:</p>
                                                <CardDescription className="text-xs text-slate-400">
                                                    {item.description ? item.description : "No information provided"}
                                                </CardDescription>
                                                <Separator className="mt-4 mb-4" />
                                                <p className="text-xs mt-2 font-semibold me-1">Where they can buy this item:</p>
                                                {
                                                    item.links.length > 0 ? (
                                                        item.links.map((link, index) => (
                                                            <Link
                                                                key={index}
                                                                href={link}
                                                                target='_blank'
                                                            >
                                                                <p className="text-xs text-blue-500 mt-3 hover:underline line-clamp-2">
                                                                    {`${link}`}
                                                                </p>
                                                            </Link>
                                                        ))
                                                    ) : (
                                                        <div className="text-center mt-4 mb-3">
                                                            <div className='mx-auto'>
                                                                <Image
                                                                    src={no_information_provided}
                                                                    className='max-w-48 max-h-48 object-contain mb-2'
                                                                    alt='Question Flatline'
                                                                />
                                                                <Label className="text-sm font-light">
                                                                    No information provided
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </CardContent>
                                        <Separator />
                                        <CardFooter className="flex justify-between pt-5 bg-neutral-50">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant='outline' className="">Remove from wishlist</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle className="mb-2">Remove item from your wishlist?</DialogTitle>
                                                        <DialogDescription>
                                                            This action is irreversible. If you wish to have this item restored, you will need to add it again.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button
                                                            onClick={() => removeWishlist(item._id)}
                                                            type="button"
                                                            className="bg-red-700 hover:bg-red-800"
                                                            disabled={isRemovingFromWishlist}
                                                        >
                                                            {
                                                                isRemovingFromWishlist ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        <Label>{fetchStatus ? 'Taking longer than usual. Please wait...' : 'Removing from wishlist'}</Label>
                                                                    </>
                                                                ) : (
                                                                    'Remove'
                                                                )
                                                            }
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </CardFooter>
                                    </Card>
                                );
                            })
                        )
                    )
            }

        </section >
    )
}

export default Profile