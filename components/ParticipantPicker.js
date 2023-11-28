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
    const [recipientDataFetchStatus, setRecipientDataFetchStatus] = useState(false);
    const [isFetchingRecipientData, setIsFetchingRecipientData] = useState(false);

    const currentDate = new Date();
    const targetDate = new Date('November 28, 2023');

    const isButtonDisabled = currentDate < targetDate;

    const getRecipientDetails = async () => {
        const recipientId = userData.recipient._id
        const token = localStorage.getItem('secret-santa-login-token');
        let timeoutId;
        setIsFetchingRecipientData(true)
        setTimeout(async () => {
            try {
                timeoutId = setTimeout(() => {
                    setRecipientDataFetchStatus(true);
                }, 5000);

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${recipientId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Clear the timer as the response is received within 5 seconds
                clearTimeout(timeoutId);

                if (response.status === 200) {
                    const fetchedRecipientDetails = response.data;
                    clearTimeout(timeoutId);
                    setRecipientDataFetchStatus(false);
                    setRecipientData(fetchedRecipientDetails)
                    setWishlist(fetchedRecipientDetails.wishlists)
                    setIsFetchingRecipientData(false)
                }
            } catch (error) {
                console.error('Error fetching recipient data', error);
                setIsFetchingRecipientData(false)
                // updateUserData(null) // remove if misbehaved
                localStorage.removeItem('secret-santa-login-token');
                localStorage.removeItem('secret-santa-user-data');
                router.push('/') // remove if misbehaved
            } finally {
                clearTimeout(timeoutId);
                setRecipientDataFetchStatus(false);
                setIsFetchingRecipientData(false)
            }
        }, 1000);
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
                    setWishlist(response.data.recipientDetails.wishlists)
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
                                    {
                                        isFetchingRecipientData ? (
                                            <div className="flex items-center my-5">
                                                <div role="status">
                                                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-slate-800" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                    </svg>
                                                </div>
                                                {
                                                    recipientDataFetchStatus ?
                                                        <p className='text-xs font-light ms-3'>Taking longer than usual. Please wait...</p>
                                                        : null
                                                }
                                            </div>
                                        ) : (
                                            recipientData && recipientData.codeName && (
                                                <CardTitle className="mb-1">
                                                    {`${recipientData.codeName}`}
                                                    <div>
                                                        <Label className="font-light text-xs opacity-50">
                                                            {`Picker ID (You): ${userData.userId}`}
                                                        </Label>
                                                    </div>
                                                </CardTitle>
                                            )
                                        )
                                    }
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
                                                    {"The selection of participants has been randomized utilizing the Fisher-Yates shuffle algorithm. This technique ensures an equitable and unbiased arrangement of participants, ensuring that the order of the participants is genuinely random. Be assured that the outcome is not predetermined, and each participant has an equal opportunity to appear in any position. A print of the picker's id, which is you, is also shown for reference should any confusion arise during the event."}
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
                hasPicked &&
                (isFetchingRecipientData ? (
                    <div className="flex justify-center items-center mt-10">
                        <div role="status">
                            <svg
                                aria-hidden="true"
                                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-slate-800"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                        </div>
                        {
                            recipientDataFetchStatus ?
                                <p className='text-xs font-light ms-3'>Taking longer than usual. Please wait...</p>
                                : null
                        }
                    </div>
                ) : (
                    <Card className="w-full mt-5">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="">
                                        {`${recipientData.codeName}'s wishlist`}
                                        <div>
                                            <Label className="font-light text-xs opacity-1">
                                                {`Mutually agreed price: PHP 1,000.00`}
                                            </Label>
                                        </div>
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardFooter className="flex justify-between mt-5 pb-2">
                            <Label className="font-light text-xs">
                                {`Feel free to periodically check the app while the event hasn't started, as ${recipientData.codeName} might update their wishlist if they haven't done so already.`}
                            </Label>
                        </CardFooter>
                        <CardFooter className="flex justify-between pb-2">
                            <Label className="font-light text-xs">
                                {`Also note that the cost of wishlist items may vary, and not all items will amount to PHP 1,000. Participants have the flexibility to divide the agreed-upon price among multiple items as needed.`}
                            </Label>
                        </CardFooter>
                        <CardFooter className="flex justify-between">
                            <Label className="font-light text-xs">
                                {`Make sure to read and understand each item's description for reference.`}
                            </Label>
                        </CardFooter>
                    </Card>
                ))
            }

            {
                hasPicked &&
                (isFetchingRecipientData ? (
                    null
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
                                                {/* <p className="font-semibold mt-2">{`${item.title}`}</p>
                                                <Separator className="mt-3 mb-4" />
                                                <p className="text-xs mt-2 font-semibold me-1">Where you can buy:</p> */}
                                                <p className="font-semibold mt-2 mb-2">{`${item.title}`}</p>
                                                <p className="text-xs mt-2 mb-1 text-slate-500 font-semibold me-1">Additional note for this item:</p>
                                                <CardDescription className="text-xs text-slate-400">
                                                    {item.description ? item.description : "No information provided"}
                                                </CardDescription>
                                                <Separator className="mt-4 mb-4" />
                                                <p className="text-xs mt-2 font-semibold me-1">Where you can buy this item:</p>
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

                    )
                )
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
                                                        })} to ensure a fair and unbiased drawing process. Allowing at least one user to pick earlier before the other participants create their account might lead to an insufficient number of available participants, potentially disrupting the intended randomness of the selection. By waiting until the specified date, we aim to maximize participation and maintain the integrity of the participant drawing.`}
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