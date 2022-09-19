import { useState, useEffect, useRef } from "react"
import isUseMouse from "../../lib/components/isUseMouse"
import useWindowSize from "../../lib/components/useWindowSize"

type Props = {
    children: React.ReactNode
    changePositions: Function
}
const Scroll = ({ children, changePositions }:Props) => {
    const eRef:any = useRef(null)
    const [scrollY, setScrollY] = useState(0)
    const [maxScrollY, setMaxScrollY] = useState(Infinity)
    const [width, height] = useWindowSize()
    const [mobile, setMobile] = useState(false)
    const scrollPage = (oldValue:number, changeValue:number) => {
        setMaxScrollY(eRef.current ? eRef.current.clientHeight - window.innerHeight : maxScrollY)
        const newValue = oldValue - changeValue
        if(newValue > 0) {
            return 0
        }
        if(Math.abs(newValue) > maxScrollY) {
            return -maxScrollY
        }
        return newValue
    }
    useEffect(() => {
        setMobile(isUseMouse)
        if(!eRef.current) {
            return
        }
        if(eRef.current.clientHeight < window.innerHeight) {
            setMaxScrollY(0)
            return
        }
        setMaxScrollY(eRef.current ? eRef.current.clientHeight - window.innerHeight : maxScrollY)
    })
    useEffect(() => {
        changePositions(scrollY)
    })
    return (
        <div>
            { mobile ? (
                <div onMouseMove={() => {
                    setMobile(isUseMouse)
                }}>{children}</div>
            ):(
                <div
                    style={{ 
                        overflow: "hidden"
                        ,position:"relative"
                        ,height: "100vh"
                    }}
                    onWheel={(e:any) => {
                        setScrollY((value) => scrollPage(value, e.deltaY))
                    }}
                    onMouseLeave={() => setMobile(isUseMouse)}
                >
                    <div
                        ref={eRef}
                        style={{
                            position:"relative"
                            ,transform: `translateY(${scrollY}px)`
                            ,transition: "transform 1s ease"
                            ,willChange: "transform"
                        }}
                        onWheel={(e:any) => {
                            setScrollY((value) => scrollPage(value, e.deltaY))
                        }}
                    >
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}
export default Scroll