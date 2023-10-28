'use client'

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Terminal } from 'lucide-react'

const SecretSantaGenerator = () => {
    return (
        <section className="max-w-lg mx-auto">

            <Alert>
                <Terminal className="h-4 w-4" />
                {/* <AlertTitle className="mb-2">**Notice: Shuffling Method**</AlertTitle> */}
                <AlertTitle className="mb-2">Notice: Shuffling Method</AlertTitle>
                <AlertDescription>
                    The selection of participants has been randomized utilizing the Fisher-Yates shuffle algorithm. This technique ensures an equitable and unbiased arrangement of items, ensuring that the order of the list is genuinely random. Be assured that the outcome is not predetermined, and each participant has an equal opportunity to appear in any position.
                </AlertDescription>
            </Alert>

        </section>
    )
}

export default SecretSantaGenerator