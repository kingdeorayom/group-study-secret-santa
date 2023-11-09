import Link from 'next/link'
import React from 'react'

const Footer = () => {
    return (
        <footer className="text-center my-6 space-y-2">
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
            {/* <p className='font-light text-xs'>Lorem ipsum dolor sit amet</p> */}
        </footer>
    )
}

export default Footer