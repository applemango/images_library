import Image from "./image"
import { getUrl } from "../../lib/main"
import styles from "./styles/modal.module.scss"
import { useState, useEffect } from "react"
import { getImageData } from "../../lib/get"
type Props = {
    id: number
}

const Modal = ({id}:Props) => {
    const [data, setData] = useState<any>(null)
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
        get()
    },[])
    return (
        <div>
            <Image src={getUrl(`images/get/id/${id}`)} />
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