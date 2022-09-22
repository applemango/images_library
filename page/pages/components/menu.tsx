import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import useClickAway from "../../lib/components/useClickAway"
import { logout } from "../../lib/token"
import styles from "./styles/menu.module.scss"
import { useRouter } from "next/router"
const Menu = () => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const router = useRouter()
    useClickAway(ref, () => {
        setOpen(false)
    })
    return (
        <div className={styles._}>
            <div className={`${styles.main} ${open ? styles.open : ""}`} ref={ref}>
                <button className={styles.toggle} onClick={() => {setOpen((data) => !data)}}></button>
                {
                    /*<div>
                        <Link href={"/like"}>
                            <a className={styles.link_button}>
                                <svg style={{fill: "#EC407A"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M14 20.408c-.492.308-.903.546-1.192.709-.153.086-.308.17-.463.252h-.002a.75.75 0 01-.686 0 16.709 16.709 0 01-.465-.252 31.147 31.147 0 01-4.803-3.34C3.8 15.572 1 12.331 1 8.513 1 5.052 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262A31.146 31.146 0 0114 20.408z"></path></svg>
                                { open && (
                                    <p>My favorites</p>
                                )}
                            </a>
                        </Link>
                    </div>*/
                }
                { open &&
                    <div>
                        <button onClick={() => {
                        const l2= async () => {
                            const res = await logout()
                            router.replace("/login")
                        }
                        l2()
                        }}>logout</button>
                    </div>
                }
            </div>
            {open && (
                <div className={styles.block}></div>
            )}
        </div>
    )
}
export default Menu