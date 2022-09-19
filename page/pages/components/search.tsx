import { useState, useEffect} from 'react';
import styles from "./styles/search.module.scss"
import { getCategoriesData, getFolderList, getLikeData } from "../../lib/get"
type Props = {
    changeFolder: Function
    folder: number
    changeLike: Function
    like: boolean
    changeQuery: Function
    query: string | undefined
    changeTag: Function
    tag: string | undefined
}
const Search = ({ changeQuery, query, changeTag, tag, like, changeLike, folder, changeFolder }:Props) => {
    //const [query, setQuery] = useState<any>(undefined)
    const [q, setQ] = useState<any>("")
    const [categories, setCategories] = useState<[[string,number]]>()
    const [showAllCategories, setShowAllCategories] = useState(false)
    
    const [folders, setFolders] = useState<any>()

    const [likes, setLikes] = useState()

    const get = async (q:string = "",t:string="",l:boolean=false,f:number=0) => {
        const res = await getCategoriesData(q,t,l,f)
        setCategories(res)
    }
    const get2 = async (q:string = "",t:string="",l:boolean=false,f:number=0) => {
        const res = await getFolderList(q,t,l,f)
        setFolders(res)
    }
    const get3 = async (q:string = "",t:string="",l:boolean=false,f:number=0) => {
        const res = await getLikeData(q,t,l,f)
        setLikes(res)
    }
    const otherCategoryCount = () => {
        if(categories) {
            let r = 0
            categories.forEach((d:[string, number], i:number) => {
                if(i > 20) {
                    r += d[1]
                }
            })
            return r
        }
        return 0
    }
    const countAllFolders = (folders:[[string,[number,number]]]) => {
        let r = 0
        folders.forEach((d:[string,[number,number]],i:number) => {
            r += d[1][1]
        })
        return r
    }
    //useEffect(() => {
    //    get()
    //    get2()
    //    get3()
    //},[])
    useEffect(() => {
        get(query,tag,like,folder)
        get2(query,tag,like,folder)
        get3(query,tag,like,folder)
    },[query,tag,like,folder])
    return (
        <div className={styles._}>
            <div className={styles.searchBox}>
                <input className={styles.searchInput} type="text" onChange={(e) => {
                    //changeQuery(e.target.value)
                    setQ(e.target.value)
                }} value={q} onKeyPress={(e) => {
                    if(e.key == "Enter") {
                        e.preventDefault()
                        changeQuery(q)
                    }
                }}  />
                <div className={styles.info}>
                    <button onClick={() => {
                         changeQuery(q)
                    }}>
                        <div className={styles.icon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="#2d2d2d" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <circle cx="10" cy="10" r="7" />
                                <line x1="21" y1="21" x2="15" y2="15" />
                            </svg>
                        </div>
                    </button>
                    <div className={`${styles.label_} ${q ? styles.active : ""}`}>
                        <span className={styles.label}>Tag or Name search</span>
                    </div>
                </div>
            </div>
            { categories && categories.length > 1 &&
                <div className={`${styles.tags} ${showAllCategories ? styles.allCategories : ""}`}>
                    <div className={`${styles.tag} ${tag == "" ? styles.active : ""}`} onClick={() =>{
                        changeTag("")
                    }}><p className={styles.categoryName}>All category</p><p className={styles.categoryNumber}>{categories[0][1]}</p></div>
                    <div className={styles.blank} />
                    { categories.map((c:[string,number], i:number) => c[0] != "All category" && (i<21 || showAllCategories)? (
                        <div key={i} className={`${styles.tag} ${tag == c[0] ? styles.active : ""}`} onClick={() => {
                            if(tag == c[0]) {
                                changeTag("")
                                return
                            }
                            changeTag(c[0])
                        }}>
                            <p className={styles.categoryName}>{c[0]}</p><p className={styles.categoryNumber}>{c[1]}</p>
                        </div>
                    ):"")}
                    { categories.length > 20 && !showAllCategories && (
                        <div className={`${styles.tag} ${styles.active}`} onClick={() => {setShowAllCategories(true)}}>
                            <p className={styles.categoryName}>other category</p><p className={styles.categoryNumber}>{otherCategoryCount().toString()}</p>
                        </div>
                    )}
                </div>
            }
            { !!likes &&
                <div className={`${styles.tag} ${like ? styles.active : ""}`} onClick={() => changeLike((d:boolean) => !d)}><p className={styles.categoryName}>My favorites</p><p className={styles.categoryNumber}>{likes}</p></div>
            }
            { folders && folders.length > 0 &&
                <div className={`${styles.tags}`}>
                    <div className={`${styles.tag} ${folder == -1 ? styles.active : ""}`} onClick={() =>{
                        if(folder == -1) {
                            changeFolder(0)
                            return
                        }
                        changeFolder(-1)
                    }}><p className={styles.categoryName}>All Folder</p><p className={styles.categoryNumber}>{}</p>{countAllFolders(folders)}</div>
                    <div className={styles.blank} />
                    { folders &&
                        folders.map((f:any,i:number) => (
                            <div key={i} className={`${styles.tag} ${folder == f[1][0] ? styles.active : ""}`} onClick={() => {
                                if(folder == f[1][0]) {
                                    changeFolder(0)
                                    return
                                }
                                changeFolder(f[1][0])
                            }}>
                                <p className={styles.categoryName}>{f[0]}</p><p className={styles.categoryNumber}>{f[1][1]}</p>
                            </div>
                        ))}
                </div>
            }
        </div>
    )
}
export default Search