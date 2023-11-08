'use client'

import React, { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Terminal } from 'lucide-react'
import { Button } from './ui/button'
import Image from 'next/image'
import { Label } from './ui/label'
import question_flatline from '../public/question-flatline.png'
import drawing from '../public/drawing.gif'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext';
import axios from "axios"

const SecretSantaGenerator = () => {

    const { userData, updateUserData } = useAuth();

    const [isPicking, setIsPicking] = useState(false)
    const [hasPicked, setHasPicked] = useState(userData.hasPicked)
    const [recipientData, setRecipientData] = useState([])
    const [wishlist, setWishlist] = useState([])

    const getRecipientDetails = async () => {
        const recipientId = userData.recipient._id
        const token = localStorage.getItem('secret-santa-login-token');
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${recipientId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                const fetchedRecipientDetails = response.data;
                setRecipientData(fetchedRecipientDetails)
                setWishlist(fetchedRecipientDetails.wishlists)
            }
        } catch (error) {
            console.error('Error fetching recipient data', error);
        }
    }

    useEffect(() => {
        if (userData && userData.recipient) {
            getRecipientDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handlePick = async () => {

        setIsPicking(true)

        try {
            const userId = userData.userId;
            const token = localStorage.getItem('secret-santa-login-token');

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/users/pick/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setIsPicking(false)
                setHasPicked(true)
                localStorage.setItem('secret-santa-user-data', JSON.stringify(response.data.pickerDetails));
                updateUserData(response.data.pickerDetails)
                setRecipientData(response.data.recipientDetails)
            } else {
                console.error('Error picking.');
                setIsPicking(false)
            }
        } catch (error) {
            console.error('Error picking a participant:', error);
            setIsPicking(false)
        }
    }

    return (
        <section className="max-w-lg mx-auto">

            {
                hasPicked ?
                    <Card className="w-full">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardDescription className="mb-3">
                                        The participant you picked was...
                                    </CardDescription>
                                    <CardTitle className="mb-1">
                                        {`${recipientData.codeName}`}
                                    </CardTitle>
                                    <Dialog>
                                        <DialogTrigger>
                                            <Label className="font-normal underline text-xs cursor-pointer">
                                                Learn more
                                            </Label>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Shuffling Method</DialogTitle>
                                                <DialogDescription>
                                                    The selection of participants has been randomized utilizing the Fisher-Yates shuffle algorithm. This technique ensures an equitable and unbiased arrangement of participants, ensuring that the order of the participants is genuinely random. Be assured that the outcome is not predetermined, and each participant has an equal opportunity to appear in any position.
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardFooter className="flex justify-between mt-5">
                            <Label className="font-light text-xs">
                                {"Be sure to give them a considerate gift, and take a look at their wishlist if they've included one for reference."}
                            </Label>
                        </CardFooter>
                    </Card> : null
            }

            {
                hasPicked ?
                    <Card className="w-full mt-5">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="mb-1">
                                        {`${recipientData.codeName}'s wishlist`}
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardFooter className="flex justify-between mt-5">
                            <Label className="font-light text-xs">
                                {`Feel free to periodically check the app while the event hasn't started, as ${recipientData.codeName} might update their wishlist if they haven't done so already.`}
                            </Label>
                        </CardFooter>
                    </Card> : null
            }

            {
                hasPicked ?
                    (

                        wishlist.length === 0 ? (
                            <div className="flex justify-center text-center mt-12 mb-3">
                                <div>
                                    <Image
                                        src={question_flatline}
                                        className='w-48 h-32 object-cover mb-4'
                                        alt='Question Flatline'
                                    />
                                    <Label className="text-sm font-light">
                                        {`${recipientData.codeName}'s wishlist is empty`}
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
                                    </Card>
                                );
                            })
                        )

                    ) : null
            }

            {
                !hasPicked && !isPicking ? (
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle className="mb-2">Before clicking the button below</AlertTitle>
                        <AlertDescription>
                            Picking a participant is a one-time process and cannot be reverted.
                        </AlertDescription>
                    </Alert>
                ) : null
            }

            {
                isPicking ?
                    (
                        <div className='mt-14 flex justify-center text-center'>
                            <div>
                                <Image
                                    src={drawing}
                                    className='w-64 h-64'
                                    alt='Picking participant'
                                />
                                <p className="text-sm font-light">
                                    Picking a participant. Please wait.
                                </p>
                            </div>
                        </div>
                    ) :
                    (
                        !hasPicked ? <div className='mt-14 flex justify-center text-center'>
                            <div>
                                <Image
                                    src={question_flatline}
                                    className='w-48 h-32 object-cover mb-2'
                                    alt='Question Flatline'
                                />
                                <p className="text-sm font-light mb-8">
                                    {"You haven't picked a participant yet."}
                                </p>

                                <Button onClick={handlePick}>Pick a participant</Button>

                            </div>
                        </div> : null
                    )
            }

        </section>
    )
}

export default SecretSantaGenerator