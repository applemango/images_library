import { useState, useEffect, useRef } from "react"
import useClickAway from "../../lib/components/useClickAway"
import styles from "./styles/menu.module.scss"
const Menu = () => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    useClickAway(ref, () => {
        setOpen(false)
    })
    return (
        <div className={styles._}>
            <div className={`${styles.main} ${open ? styles.open : ""}`} ref={ref}>
                <button className={styles.toggle} onClick={() => {setOpen((data) => !data)}}></button>
            </div>
            {open && (
                <div className={styles.block}></div>
            )}
        </div>
    )
}
export default Menu