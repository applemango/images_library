import Img from "next/image"
import styles from "./styles/image.module.scss"
import Image from "./image"
import Link from "next/link"
type Props = {
    src: string
    data: {
        id: number
        ,path: string
        ,extension: string
        ,timestamp: any
        ,url: string
        ,category: string
        ,width: number
        ,height: number
    }
}
const ImageInfo = ({src, data}:Props) => {
    return (
        <div className = {styles.imageInfo}>
            <Link href={`/?id=${data.id}`} as={`/?id=${data.id}`}>
                <a>
                    <Image src={src} />
                    <div className={styles.info}>
                        <div className={styles.info_}>
                        </div>
                    </div>
                </a>
            </Link>
        </div>
    )
}
export default ImageInfo