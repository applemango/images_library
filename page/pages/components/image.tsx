import Img from "next/image"
import styles from "./styles/image.module.scss"
type Props = {
    src: string
}
const Image = ({src}:Props) => {
    const loader = ({scr}:any) => {
        return src
    }
    return (
        <div className={styles.imageContainer}>
            <Img layout='fill' objectFit='contain' src={src} loader={loader}/>
        </div>
    )
}
export default Image