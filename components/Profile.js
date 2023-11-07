'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge"
import question_flatline from '../public/question-flatline.png'
import Image from 'next/image';
import { Input } from './ui/input';
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
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

    const { userData } = useAuth();

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
            title: "Wishlist 1",
            priority: "High",
            links: []
        },
    })

    const handleLogout = () => {
        if (isLoggedIn) {
            setIsLoggedIn(false);
            localStorage.removeItem('secret-santa-login-token');
            localStorage.removeItem('secret-santa-user-data');
            router.push('/');
        } else {
            console.error('Logout failed. User is not logged in.');
        }
    }

    const [inputLink, setInputLink] = useState("");

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
        try {
            // Make an axios DELETE request to the server to delete the wishlist item by its _id
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

            // If the request is successful, update the state by filtering out the deleted wishlist item
            const updatedWishlist = wishlist.filter((item) => item._id !== itemId);
            setWishlist(updatedWishlist);
        } catch (error) {
            // Handle any errors, e.g., network issues or API errors
            console.error('Error deleting wishlist item', error);
        }
    };



    const onSubmit = async (data) => {

        data['links'] = links;

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
            } else {
                console.error('Error adding wishlist item');
            }
        } catch (error) {
            console.error('Error adding wishlist item', error);
        }
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
                            {/* <CardDescription className="mt-2">{`Note that you won't be able to add a wishlist five days before the event date.`}</CardDescription> */}
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="ms-8" variant="outline">Add item</Button>
                            </DialogTrigger>
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
                                        <Separator className="mt-5 mb-3" />
                                        <DialogFooter className="mt-6">
                                            <Button type="submit">Save</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                    </div>
                </CardHeader>
            </Card>

            {
                wishlist.length === 0 ? (
                    <div className="flex justify-center text-center mt-12 mb-3">
                        <div>
                            <Image
                                src={question_flatline}
                                className='w-48 h-32 object-cover mb-4'
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
                                                <div className="flex justify-center text-center mt-4 mb-3">
                                                    <div>
                                                        <Image
                                                            src={question_flatline}
                                                            className='w-48 h-32 object-cover mb-2'
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
                                    {/* <Button onClick={() => removeWishlist(index)} variant='outline' className="">Remove from wishlist</Button> */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant='outline' className="">Remove from wishlist</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Remove item from your wishlist?</DialogTitle>
                                                <DialogDescription>
                                                    This action is irreversible. If you wish to have this item restored, you will need to add it again.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button onClick={() => removeWishlist(item._id)} type="button" className="bg-red-700 hover:bg-red-800">Remove</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>
                        );
                    })
                )
            }

        </section>
    )
}

export default Profile