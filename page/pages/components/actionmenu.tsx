import { createRef, useState } from "react"
import {useEffect, useRef} from 'react';
import { useRouter } from "next/router"
import Link from "next/link"

import useClickAway from "../../lib/components/useClickAway"
import styles from "./styles/actionmenu.module.scss"

type Props = {
    children: React.ReactNode
    icon: React.ReactNode
    className?: any
    classNameMain?: any
    show?: boolean
    setShow?: Function
}
const ActionMenu = ({ children, icon, className, classNameMain, show, setShow = () => false }:Props) => {
    const [s, setS] = useState(false)
    const [hover, setHover] = useState(false)
    const ref = useRef(null)
    useClickAway(ref, () => {
        if(hover) return
        setS(false)
        setShow(false)
    })
    return (
        <>
            <div className={`${className}`}>
                <button
                    onClick={() => {
                        if(s) {
                            setS(false)
                            setShow(false)
                            return
                        }
                        setS(true)
                        setShow(true)
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    {icon}
                </button>
            </div>
            {s && (
                <div ref={ref} className={classNameMain}>
                    {children}
                </div>
            )}
        </>
    )
}
export default ActionMenu