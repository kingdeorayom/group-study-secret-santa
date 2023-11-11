'use client'

import React, { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Terminal } from 'lucide-react'
import { Button } from './ui/button'
import Image from 'next/image'
import { Label } from './ui/label'
import no_information_provided from '../public/no_information_provided.png'
import picking_not_allowed from '../public/picking_not_allowed.png'
import question from '../public/question.png'
import drawing from '../public/drawing.gif'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext';
import axios from "axios"
import { useRouter } from 'next/navigation'

const ParticipantPicker = () => {

    const router = useRouter()

    const { userData, updateUserData } = useAuth();

    const [isPicking, setIsPicking] = useState(false)
    const [hasPicked, setHasPicked] = useState(userData.hasPicked)
    const [recipientData, setRecipientData] = useState([])
    const [wishlist, setWishlist] = useState([])
    const [fetchStatus, setFetchStatus] = useState(false);

    const currentDate = new Date();
    const targetDate = new Date('November 10, 2023');

    const isButtonDisabled = currentDate < targetDate;

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
            // updateUserData(null) // remove if misbehaved
            localStorage.removeItem('secret-santa-login-token');
            localStorage.removeItem('secret-santa-user-data');
            router.push('/') // remove if misbehaved
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
        let timeoutId;

        setTimeout(async () => {

            try {
                timeoutId = setTimeout(() => {
                    setFetchStatus(true);
                }, 5000);

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

                // Clear the timer as the response is received within 5 seconds
                clearTimeout(timeoutId);

                if (response.status === 200) {
                    setIsPicking(false)
                    setHasPicked(true)
                    localStorage.setItem('secret-santa-user-data', JSON.stringify(response.data.pickerDetails));
                    updateUserData(response.data.pickerDetails)
                    setRecipientData(response.data.recipientDetails)
                    clearTimeout(timeoutId);
                    setFetchStatus(false);
                } else {
                    console.error('Error picking.');
                    setIsPicking(false)
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    console.error('Error picking a participant:', error);
                } else {
                    console.error("An error occurred while picking a participant.");
                }
                setIsPicking(false)
            } finally {
                clearTimeout(timeoutId);
                setFetchStatus(false);
                setIsPicking(false);
            }
        }, 5000);
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
                                                <DialogTitle className="mb-2">Shuffling Method</DialogTitle>
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
                            <div className="text-center mt-12 mb-3">
                                <div className='mx-auto'>
                                    <Image
                                        src={no_information_provided}
                                        className='max-w-48 max-h-48 object-contain mb-4'
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
                                                                    src={no_information_provided}
                                                                    className='w-48 h-48 object-cover mb-2'
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
                        <div className='mt-14 text-center flex items-center'>
                            <div className='mx-auto'>
                                <Image
                                    src={drawing}
                                    className='w-48 h-48 object-contain'
                                    alt='Picking participant'
                                />

                                {
                                    fetchStatus ?
                                        <>
                                            <p className="text-sm font-light mb-2">
                                                {"Taking longer than usual. Please be patient..."}
                                            </p>
                                            <p className="text-sm font-light">{"Don't close the page as it may interrupt the picking process."}</p>
                                        </> :
                                        <p className="text-sm font-light">
                                            Picking a participant. Please wait...
                                        </p>
                                }
                            </div>
                        </div>
                    ) :
                    (
                        !hasPicked ? <div className='mt-14 text-center'>
                            <div className='mx-auto'>
                                <Image
                                    src={isButtonDisabled ? picking_not_allowed : question}
                                    className='max-w-48 max-h-48 object-contain mb-2'
                                    alt='Question Flatline'
                                />
                                <p className="text-sm font-light mb-2">
                                    {
                                        isButtonDisabled ? `Picking a participant is not allowed until ${targetDate.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}.` : `You haven't picked a participant yet.`
                                    }
                                </p>

                                {
                                    isButtonDisabled ?
                                        <p className="text-sm font-light mb-2">For the meantime, why not add some items to your wishlist?</p> :
                                        null
                                }

                                <div className='my-5'>
                                    <Button
                                        onClick={handlePick}
                                        disabled={isButtonDisabled}
                                    >
                                        Pick a participant
                                    </Button>
                                </div>

                                {
                                    isButtonDisabled ?
                                        <Dialog>
                                            <DialogTrigger>
                                                <Label className="font-normal underline text-xs cursor-pointer">
                                                    Why picking a participant is not yet allowed?
                                                </Label>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className="mb-2">Why picking a participant is not yet allowed?</DialogTitle>
                                                    <DialogDescription>
                                                        {`Picking participants is not allowed until ${targetDate.toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })} to ensure a fair and unbiased drawing process. Allowing at least one user to pick earlier might lead to an insufficient number of available participants, potentially disrupting the intended randomness of the selection. By waiting until the specified date, we aim to maximize participation and maintain the integrity of the participant drawing.`}
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </DialogContent>
                                        </Dialog> : null
                                }

                            </div>
                        </div> : null
                    )
            }

        </section>
    )
}

export default ParticipantPicker