import Link from 'next/link'
import React from 'react'

const Footer = () => {
    return (
        <footer className="text-center mt-6 mb-10 space-y-2">
            <h6 className="text-sm text-gray-400">
                Developed by{" "}
                <Link
                    href='https://github.com/kingdeorayom'
                    className='underline text-slate-500'
                    target='_blank'
                >
                    Serking
                </Link>
                .
            </h6>
            {/* <p className='font-light text-xs'>&copy; 2023 Serking de Orayom</p> */}
            <p className='font-light text-xs'>&copy; {new Date().getFullYear()} Serking de Orayom</p>
        </footer>
    )
}

export default Footer