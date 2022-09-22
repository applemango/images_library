import Image from "./image"
import { getUrl } from "../../lib/main"
import styles from "./styles/modal.module.scss"
import { useState, useEffect } from "react"
import { getImageData } from "../../lib/get"
import { useRouter } from "next/router"
import { isLoginAndLogin } from "../../lib/token"
type Props = {
    id: number
}

const Modal = ({id}:Props) => {
    const [data, setData] = useState<any>(null)
    const router = useRouter()
    const get = async () => {
        const res:{
            id: number
            ,path: string
            ,extension: string
            ,timestamp: any
            ,url: string
            ,category: string
            ,width: number
            ,height: number
        } = await getImageData(id)
        setData(res)
    }
    useEffect(() => {
        const l = async () => {
            const res = await isLoginAndLogin()
            if(!res) {
                router.replace("/login")
            }
            get()
        }
        l()
    },[])
    return (
        <div>
            <Image src={getUrl(`images/get/id/${id}`,true)} />
            <div className={styles.info}>
                { data && (
                    <div>
                        <p>{`name : ${data.name}`}</p>
                        <p>{`category : ${data.category}`}</p>
                        <p>{`time : ${data.timestamp}`}</p>
                        <p>{`width : ${data.width}`}</p>
                        <p>{`height: ${data.height}`}</p>
                    </div>
                )}
            </div>
        </div>
    )}
export default Modal