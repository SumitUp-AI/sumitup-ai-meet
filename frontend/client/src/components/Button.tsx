import React from "react"

export default function Button({children} : {children: React.ReactNode}) {
    return (
        <button className="px-3 py-2 bg-gray-950 rounded-md cursor-pointer text-white hover:bg-cyan-900 transition-all ease-in-out">
            {children}
        </button>
    )
}