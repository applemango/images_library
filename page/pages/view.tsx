import type { NextPage } from 'next'
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import Image from "./components/image"
import { getUrl } from "../lib/main"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from "../styles/view.module.scss"
import Img from "next/image"
import { isLoginAndLogin } from '../lib/token'
const View:NextPage = () => {
    const [scr, setScr] = useState("")
    const router = useRouter()
    useEffect(() => {
        const l = async () => {
            const res = await isLoginAndLogin()
            if(!res) {
                router.replace("/login")
            }
        }
        l()
    },[])
    useEffect(() => {
        if(typeof router.query.id == "string") {
            setScr(router.query.id)
            console.log(router.query.id)
        }
    },[router.query])
    return (
        <div className={styles._}>
            <TransformWrapper
                initialScale={1} 
                minScale={0.3}>
                <TransformComponent>
                    <div className={styles.__}>
                        <img style={{padding: '500px'}} src={getUrl(`images/get/id/${scr}`,true)}/>
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    )
}
export default View