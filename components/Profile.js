'use client'

import React from 'react'
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Terminal } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from './ui/label';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge"
import question_flatline from '../public/question-flatline.png'
import Image from 'next/image';
import { Input } from './ui/input';

const Profile = ({ isLoggedIn, setIsLoggedIn, router }) => {

    const handleLogout = () => {
        if (isLoggedIn) {
            setIsLoggedIn(false);
            localStorage.removeItem('secret-santa-login-token');
            router.push('/');
        } else {
            console.error('Logout failed. User is not logged in.');
        }
    }

    const wishlist = [
        {
            id: 1,
            title: "Redmi Note 12 4+128GB/6+128GB/8+128GB/8+256G Global Version With 1-year Warranty",
            priority: "High",
            links: [
                "https://shopee.ph/Redmi-Note-12-4-128GB-6-128GB-8-128GB-8-256G-Global-Version-With-1-year-Warranty-i.178878153.23836603035?sp_atk=f7db1789-7a5f-4773-a8e6-ca48f05978ac&xptdk=f7db1789-7a5f-4773-a8e6-ca48f05978ac"
            ]
        },
        {
            id: 2,
            title: "TFOE Ring Pure Stainless Steel Eagles Fraternal Ring Luxury Men Military Rhinestones Army Navy Ring",
            priority: "Low",
            links: [
                "https://shopee.ph/Redmi-Note-12-4-128GB-6-128GB-8-128GB-8-256G-Global-Version-With-1-year-Warranty-i.178878153.23836603035?sp_atk=f7db1789-7a5f-4773-a8e6-ca48f05978ac&xptdk=f7db1789-7a5f-4773-a8e6-ca48f05978ac",
                "https://shopee.ph/Redmi-Note-12-4-128GB-6-128GB-8-128GB-8-256G-Global-Version-With-1-year-Warranty-i.178878153.23836603035?sp_atk=f7db1789-7a5f-4773-a8e6-ca48f05978ac&xptdk=f7db1789-7a5f-4773-a8e6-ca48f05978ac"
            ]
        },
        {
            id: 3,
            title: "TFOE Ring Pure Stainless Steel Eagles Fraternal Ring Luxury Men Military Rhinestones Army Navy Ring",
            priority: "Low",
            links: [

            ]
        }
    ]

    return (
        <section className="max-w-lg mx-auto">

            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="mb-1">kingdeorayom</CardTitle>
                            <CardDescription>Serking de Orayom</CardDescription>
                        </div>
                        <Button onClick={handleLogout} className="bg-red-700">Log out</Button>
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
                            <CardTitle className="mb-1">My Wishlist</CardTitle>
                            <CardDescription>A wishlist will assist the participant who picks you in making a thoughtful gift choice.</CardDescription>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="ms-8" variant="outline">Add item</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add item to your wishlist</DialogTitle>
                                    <DialogDescription>
                                        Make changes to your profile here. Click save when you are done.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            defaultValue="Pedro Duarte"
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="username" className="text-right">
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            defaultValue="@peduarte"
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* <Dialog>
                            <DialogTrigger>
                                <Button className="ms-8" variant="outline">Add item</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add item to your wishlist</DialogTitle>
                                    <DialogDescription>
                                        Enter your desired item and, optionally, a purchase link to help your Secret Santa select the perfect gift.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog> */}
                    </div>
                </CardHeader>
            </Card>

            {
                wishlist.map((item) => {
                    return (
                        <Card className="w-full mt-4" key={item.id}>
                            <CardContent className="mt-3">
                                <div className="py-1 rounded-lg">
                                    <Badge variant="outline">{`${item.priority} Priority`}</Badge>
                                    <p className="font-semibold mt-2">{`${item.title}`}</p>
                                    <Separator className="mt-3 mb-4" />
                                    <p className="text-xs mt-2 font-semibold me-1">Purchase options:</p>
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
                                                        className='w-48 h-32 object-cover'
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
                                    <DialogTrigger>
                                        <Button variant='outline' className="">Remove this item</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add item to your wishlist</DialogTitle>
                                            <DialogDescription>
                                                Enter your desired item and, optionally, a purchase link to help your Secret Santa select the perfect gift.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    );
                })
            }

        </section>
    )
}

export default Profile