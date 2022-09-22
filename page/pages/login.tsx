import { NextPage } from "next";

import stylesIndex from '../styles/index.module.scss'
import styles from "../styles/login.module.scss"
import Menu from "./components/menu";

import { useEffect, useState } from "react"
import { login, signUp } from "../lib/token"
import { useRouter } from "next/router";
import Link from "next/link";

const Login: NextPage = () => {
    const [signup, setSignUp] = useState(false)

    const [pass,setPassword] = useState("")
    const [passC, setPasswordC] = useState("")
    const [name, setUsername] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const router = useRouter()
    const su = async () => {
        if(pass != passC) {
            setErrorMsg("password mismatch")
            return
        }
        const res = await signUp(name, pass)
        if(res.msg == "success") {
            router.replace("/")
            return
        }
        setErrorMsg(res.text)
    }
    const li = async () => {
        const res = await login(name, pass)
        if(res.msg == "success") {
            router.replace("/")
            return
        }
        setErrorMsg(res.text)
    }
    useEffect(() => {
        if(router.query.create) {
            setSignUp(true)
        }
    },[router.query])
    return (
        <div className={stylesIndex.main}>
            <Menu />
            <div className={`${stylesIndex.container} ${styles.main}`} style={{transform: 'translateX(40px)',marginBottom: '10px'}}>
                <div className={styles.main_}>
                    { signup && 
                        <div>
                            <form id="login">
                                <div className = { styles.text }><p>Username</p></div>
                                <input type="text" autoComplete="username" value={name} onChange={(e) => setUsername(e.target.value)} />
                                <div className = { styles.text } ><p>Password</p></div>
                                <input type="password" autoComplete="new-password" value={pass} onChange={(e) => setPassword(e.target.value)}/>
                                <div className = { styles.text } ><p>for confirmation</p></div>
                                <input type="password" autoComplete="new-password" value={passC} onChange={(e) => setPasswordC(e.target.value)}/>
                            </form>
                            <button onClick={() => {
                                su()
                            }}>
                                Sign Up
                            </button>
                        </div>
                    }
                    { !signup && 
                        <div>
                            <form id="login">
                                <div className = { styles.text }><p>Username</p></div>
                                <input type="text" autoComplete="username" value={name} onChange={(e) => setUsername(e.target.value)} />
                                <div className = { styles.text } ><p>Password</p></div>
                                <input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPassword(e.target.value)}/>
                            </form>
                            <button onClick={() => {
                                li()
                            }}>
                                Log In
                            </button>
                        </div>
                    }
                    { errorMsg && 
                        <div>
                            <p>{errorMsg}</p>
                        </div>
                    }
                    <div className = { styles.hone_Sign }>
                        <Link href="/"><a>Home</a></Link>
                        <p>/</p>
                        { signup ? 
                            (<a className = { styles.changeMode } onClick = { () => {
                                setSignUp(false)
                                setErrorMsg("")
                            }}>Login</a>):
                            (<a className = { styles.changeMode } onClick = { () => {
                                setSignUp(true)
                                setErrorMsg("")
                            }}>Sign Up</a>)
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Login