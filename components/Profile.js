'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Loader2, X } from 'lucide-react'
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

const FormSchema = z.object({
    title: z.string().min(1, {
        message: "Please add a title.",
    }),
    priority: z.string().min(1, {
        message: "Please select a priority.",
    }),
});

const Profile = ({ isLoggedIn, setIsLoggedIn, router }) => {

    const targetDate = new Date('2023-12-02');
    const currentDate = new Date();
    const isAfterTargetDate = currentDate < targetDate;

    const { userData, updateUserData } = useAuth();

    const [wishlist, setWishlist] = useState([])

    const getUserWishlist = async () => {

        const userId = userData.userId;
        const token = localStorage.getItem('secret-santa-login-token');

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/wishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const fetchedWishlist = response.data;
            setWishlist(fetchedWishlist); // Update the state with the fetched data
        } catch (error) {
            console.error('Error fetching user wishlist', error);
        }
    }

    useEffect(() => {
        getUserWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
            priority: "",
            links: []
        },
    })

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
    const [isRemovingFromWishlist, setIsRemovingFromWishlist] = useState(false);

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
        setTimeout(async () => {
            try {
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
                const updatedWishlist = wishlist.filter((item) => item._id !== itemId);
                setIsRemovingFromWishlist(false)
                setWishlist(updatedWishlist);
            } catch (error) {
                console.error('Error deleting wishlist item', error);
                setIsRemovingFromWishlist(false)
            }
        }, 1000);
    };

    const onSubmit = async (data) => {

        data['links'] = links;

        setIsAddingToWishlist(true)

        setTimeout(async () => {
            try {
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

                if (response.status === 201) {
                    const newItem = response.data.data;
                    setWishlist((prevWishlist) => [...prevWishlist, newItem]);
                    setIsAddingToWishlist(false)
                    setIsAddWishlistDialogOpen(false)
                } else {
                    setIsAddingToWishlist(false)
                    console.error('Error adding wishlist item');
                }
            } catch (error) {
                setIsAddingToWishlist(false)
                console.error('Error adding wishlist item', error);
            }
        }, 1000);
    };


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
                            </CardDescription>
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
                                        <Button className="ms-8" variant="outline" onClick={() => setIsAddWishlistDialogOpen(true)}>
                                            Add item
                                        </Button>
                                    </DialogTrigger>
                                ) : null
                            }
                            <DialogContent className="sm:max-w-[425px]">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)}>
                                        <DialogHeader>
                                            <DialogTitle>Add item to your wishlist</DialogTitle>
                                            <DialogDescription>
                                                Enter your desired item and, optionally, links where the item can be bought.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <FormField
                                            control={form.control}
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
                                            control={form.control}
                                            name="priority"
                                            render={({ field }) => (
                                                <FormItem className="mb-2 mt-3">
                                                    <FormLabel className="font-bold">Priority</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Select item priority" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Separator className="mt-5 mb-3" />
                                        <FormLabel className="font-bold">Links</FormLabel>
                                        <div className="flex items-center">
                                            <Input className="mt-2" control={form.control} value={inputLink} onChange={handleInputLinkChange} placeholder="Enter a store link here" />
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
                                                            <Label>Adding to wishlist</Label>
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
                <CardFooter className="flex justify-between mt-5">
                    <Label className="font-light text-xs">
                        {`Note that you won't be able to add a wishlist starting ${targetDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}`}
                    </Label>
                </CardFooter>
            </Card>

            {
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
                                        <p className="font-semibold mt-2">{`${item.title}`}</p>
                                        <Separator className="mt-3 mb-4" />
                                        <p className="text-xs mt-2 font-semibold me-1">Where you can buy:</p>
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
                                                                <Label>Removing from wishlist</Label>
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
            }

        </section >
    )
}

export default Profile