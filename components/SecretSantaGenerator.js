'use client'

import React, { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Terminal } from 'lucide-react'
import { Button } from './ui/button'
import Image from 'next/image'
import { Label } from './ui/label'
import question_flatline from '../public/question-flatline.png'
import drawing from '../public/drawing.gif'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext';


const SecretSantaGenerator = () => {

    const [isPicking, setIsPicking] = useState(false)
    const [hasPicked, setHasPicked] = useState(false)

    const handlePick = () => {

        setIsPicking(true)

        setTimeout(() => {
            setIsPicking(false)
            setHasPicked(true)
        }, 1000);
    }

    const { userData } = useAuth();

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
                                        catastrophic catastrophe
                                    </CardTitle>
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

            {/* {
                hasPicked ? <Alert className="mt-5">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle className="mb-2">Notice: Shuffling Method</AlertTitle>
                    <AlertDescription>
                        The selection of participants has been randomized utilizing the Fisher-Yates shuffle algorithm. This technique ensures an equitable and unbiased arrangement of participants, ensuring that the order of the participants is genuinely random. Be assured that the outcome is not predetermined, and each participant has an equal opportunity to appear in any position.
                    </AlertDescription>
                </Alert> : null
            } */}

            {
                hasPicked ?
                    <Card className="w-full mt-5">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="mb-1">
                                        {"catastrophic catastrophe's wishlist"}
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardFooter className="flex justify-between mt-5">
                            <Label className="font-light text-xs">
                                {"Feel free to periodically check the app while the event hasn't started, as catastrophic catastrophe might update their wishlist if they haven't done so already."}
                            </Label>
                        </CardFooter>
                    </Card> : null
            }

            {
                hasPicked ?
                    <Card className="w-full mt-4">
                        <CardContent className="mt-3">
                            <div className="py-1 rounded-lg">
                                <Badge variant="outline">{`High Priority`}</Badge>
                                <p className="font-semibold mt-2">{`Wishlist 1`}</p>
                                <Separator className="mt-3 mb-4" />
                                <p className="text-xs mt-2 font-semibold me-1">Where you can buy:</p>

                            </div>
                        </CardContent>
                    </Card> : null
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