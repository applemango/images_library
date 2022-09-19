import Img from "next/image"
import styles from "./styles/image.module.scss"
import Image from "./image"
import Link from "next/link"
import ActionMenu from "./actionmenu"
import { useState, useEffect, useRef } from "react"
import { imageLike, imageUnlike, createFolder, editFolderName, imageAddFolder, imageDeleteFolder } from "../../lib/post"
import { getFolderListV1 } from "../../lib/get"
import useClickAway from "../../lib/components/useClickAway"
import { deleteFolder, deleteImage } from "../../lib/delete"
import { useRouter } from "next/router"
type Props = {
    src: string
    data: {
        id: number
        ,name: string
        ,path: string
        ,extension: string
        ,timestamp: any
        ,url: string
        ,category: string
        ,width: number
        ,height: number
        ,like: boolean
        ,folder_id: number
        ,folder_name: string
        ,folder_color: string
    }
}
const ImageInfo = ({src, data}:Props) => {
    const [isLike, setIsLike] = useState(data.like)
    const [show, setShow] = useState(false)
    const [folders, setFolders] = useState<any>([])
    const [isEdit, setIsEdit] = useState(false)
    const [editNumber, setEditNumber] = useState(0)
    const [editText, setEditText] = useState("")
    const ref = useRef(null)

    const [folderId, setFolderId] = useState(data.folder_id)
    const [folderName, setFolderName] = useState(data.folder_name)
    const [folderColor, setFolderColor] = useState(data.folder_color)

    const [deleted, setDeleted] = useState(false)

    const router = useRouter()

    const getFolders = async () => {
        const res = await getFolderListV1()
        setFolders(res)
    }
    const random_color = () => {
        const colors = ["F44336","E91E63","9C27B0","673AB7","3F51B5","2196F3","03A9F4","00BCD4","009688","4CAF50","8BC34A","FFEB3B","FFC107","FF9800","FF5722","795548"]
        return colors[Math.floor(Math.random() * colors.length)]
    }
    const create_folder = async () => {
        const res = await createFolder("new folder",random_color())
        setFolders([...folders,res])
    }
    const change_Name = async () => {
        setIsEdit(false)
        let t = folders
        t[editNumber].name = editText
        setFolders(t)
        const res = await editFolderName(folders[editNumber].id, editText)
    }
    const image_add_folder = async (n:number,folder_id:number, image_id:number) => {
        if(folder_id == folderId) {
            setFolderId(0)
            setFolderName("")
            setFolderColor("")
            let t = folders
            t[n].count -= 1
            setFolders(t)
            const res = await imageDeleteFolder(image_id)
        } else {
            let t = folders
            for (let i = 0; i < t.length; i++) {
                if(t[i].id == folderId) {
                    t[i].count -= 1
                    break;
                }
            }
            t[n].count += 1
            setFolderId(folder_id)
            setFolderName(folders[n].name)
            setFolderColor(folders[n].color)
            setFolders(t)
            const res = await imageAddFolder(folder_id, image_id)
        }
    }
    const delete_folder = async (n:number,folder_id: number) => {
        setFolderId(0)
        setFolderName("")
        setFolderColor("")
        let t = folders
        let r:any = []
        t.forEach((t:any,i:number) => {
            if(n != i) {
                r.push(t)
            }
        })
        setFolders(r)
        const res = await deleteFolder(folder_id)
    }
    const delete_image = async (image_id:number) => {
        setDeleted(true)
        setShow(false)
        const res = await deleteImage(image_id)
    }
    useEffect(() => {
        if(show) {
            getFolders()
        }
    },[show])
    useClickAway(ref, () => {
        if(isEdit) {
            change_Name()
        }
    })
    return (
        <div className = {styles.imageInfo}>
            <Link href={`/?id=${data.id}`} as={`/?id=${data.id}`}>
                <a>
                    <Image src={src} />
                </a>
            </Link>
            <div className={`${styles.info} ${show ? styles.active : ""}`}>
                <div className={styles.info_}>
                    <div className={styles.like}>
                        <button className={styles.like_button} onClick={() => {
                            if(!isLike) {
                                const l = async () => {
                                    const res = await imageLike(data.id)
                                    if(res) {
                                        setIsLike(true)
                                    }
                                }
                                l()
                            } else {
                                const ul = async () => {
                                    const res = await imageUnlike(data.id)
                                    if(res) {
                                        setIsLike(false)
                                    }
                                }
                                ul()
                            }
                        }}>
                            { isLike ? (
                                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M14 20.408c-.492.308-.903.546-1.192.709-.153.086-.308.17-.463.252h-.002a.75.75 0 01-.686 0 16.709 16.709 0 01-.465-.252 31.147 31.147 0 01-4.803-3.34C3.8 15.572 1 12.331 1 8.513 1 5.052 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262A31.146 31.146 0 0114 20.408z"></path></svg>
                            ) : (
                                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fillRule="evenodd" d="M6.736 4C4.657 4 2.5 5.88 2.5 8.514c0 3.107 2.324 5.96 4.861 8.12a29.66 29.66 0 004.566 3.175l.073.041.073-.04c.271-.153.661-.38 1.13-.674.94-.588 2.19-1.441 3.436-2.502 2.537-2.16 4.861-5.013 4.861-8.12C21.5 5.88 19.343 4 17.264 4c-2.106 0-3.801 1.389-4.553 3.643a.75.75 0 01-1.422 0C10.537 5.389 8.841 4 6.736 4zM12 20.703l.343.667a.75.75 0 01-.686 0l.343-.667zM1 8.513C1 5.053 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262a31.146 31.146 0 01-5.233 3.576l-.025.013-.007.003-.002.001-.344-.666-.343.667-.003-.002-.007-.003-.025-.013A29.308 29.308 0 0110 20.408a31.147 31.147 0 01-3.611-2.632C3.8 15.573 1 12.332 1 8.514z"></path></svg>
                            )}
                        </button>
                    </div>
                    <div className={styles.file}>
                        <ActionMenu className={styles.fileMenu} setShow={setShow} icon={
                            folderId ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fillRule="evenodd" d="M1.75 2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H7.5c-.55 0-1.07-.26-1.4-.7l-.9-1.2a.25.25 0 00-.2-.1H1.75zM0 2.75C0 1.784.784 1 1.75 1H5c.55 0 1.07.26 1.4.7l.9 1.2a.25.25 0 00.2.1h6.75c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75z"></path></svg>
                            )
                        }>
                            <div className={styles.fileMenu_main}>
                                { folders.length > 0 &&
                                    <div className={styles.fileMenu_folders}>
                                        { folders.map((f:any, i:number) => (
                                            <div key={i} className={`${styles.fileMenu_folder_} ${f.id == folderId ? styles.active : ""}`}>
                                                <div className={styles.fileMenu_folder} onClick={() => {
                                                    image_add_folder(i,f.id, data.id)
                                                }}>
                                                    <div className={styles.fileMenu_color}>
                                                        <div style={{backgroundColor: "#" + f.color}} />
                                                    </div>
                                                    <div className={styles.fileMenu_data}>
                                                        { isEdit && i == editNumber ? (
                                                            <input className={styles.input} ref={ref} type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyPress={(e) => {
                                                                if(e.key == "Enter") {
                                                                    e.preventDefault()
                                                                    if(isEdit) {
                                                                        change_Name()
                                                                    }
                                                                }}}
                                                            />
                                                        ):(
                                                            <>
                                                                <p style={{color: f.id == folderId ? "#" + f.color : ""}}>{f.name}</p>
                                                                <p style={{color: f.id == folderId ? "#" + f.color : ""}}>{f.count}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles.icons}>
                                                    <button className={styles.fileMenu_folder_button} onClick={() => {
                                                        setIsEdit(true)
                                                        setEditNumber(i)
                                                        setEditText(f.name)
                                                    }}>
                                                        <svg className={styles.edit_icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fillRule="evenodd" d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"></path></svg>
                                                    </button>
                                                    <button className={styles.fileMenu_folder_button} onClick={() => {
                                                        delete_folder(i, f.id)
                                                    }}>
                                                        <svg className={styles.delete_icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fillRule="evenodd" d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }
                                { folders.length > 0 && (
                                    <div className={styles.fileMenu_blank} />
                                )}
                                <div className={styles.fileMenu_create} onClick={() => {create_folder()}}><p>Create folder</p></div>
                                { /*folderId &&
                                    <>
                                        <div className={styles.fileMenu_blank} />
                                        <div className={styles.fileMenu_remove}><p>Remove from folder</p></div>
                                    </>*/
                                }
                            </div>
                        </ActionMenu>
                    </div>
                    <div className={styles.file}>
                        <ActionMenu className={styles.fileMenu} setShow={setShow} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M8 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM1.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
                        }>
                            <div className={styles.fileMenu_main}>
                                <div><Link href={`/view?id=${data.id}`}><a target="_blank"><p>view</p></a></Link></div>
                                <div className={styles.fileMenu_remove} onClick={() => delete_image(data.id)}><p>delete image</p></div>
                            </div>
                        </ActionMenu>
                    </div>
                </div>
            </div>
            { deleted && 
            <div style={{
                width: "100%"
                ,height: "calc(100% + 6px)"
                ,backgroundColor: "#fff"
                ,zIndex: 2
                ,position: "absolute"
                ,top: "-3px"
            }}></div>}
        </div>
    )
}
export default ImageInfo