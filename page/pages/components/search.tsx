import { useState, useEffect} from 'react';
import styles from "./styles/search.module.scss"
import { getCategoriesData } from "../../lib/get"
type Props = {
    changeQuery: Function
    query: string | undefined
    changeTag: Function
    tag: string | undefined
}
const Search = ({ changeQuery, query, changeTag, tag }:Props) => {
    //const [query, setQuery] = useState<any>(undefined)
    const [categories, setCategories] = useState<[[string,number]]>()
    const get = async (q:string = "") => {
        const res = await getCategoriesData(q)
        setCategories(res)
    }
    useEffect(() => {
        get()
    },[])
    useEffect(() => {
        get(query)
    },[query])
    return (
        <div className={styles._}>
            <div className={styles.searchBox}>
                <input className={styles.searchInput} type="text" onChange={(e) => {
                    changeQuery(e.target.value)
                }} value={query}  />
                <div className={styles.info}>
                    <div className={styles.icon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="#000000" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <circle cx="10" cy="10" r="7" />
                            <line x1="21" y1="21" x2="15" y2="15" />
                        </svg>
                    </div>
                    <div className={`${styles.label_} ${query ? styles.active : ""}`}>
                        <span className={styles.label}>Tag or Name search</span>
                    </div>
                </div>
            </div>
            { categories &&
                <div className={styles.tags}>
                    <div className={`${styles.tag} ${tag == "" ? styles.active : ""}`} onClick={() =>{
                        changeTag("")
                    }}><p className={styles.categoryName}>All category</p><p className={styles.categoryNumber}>{categories[0][1]}</p></div>
                    <div className={styles.blank} />
                    { categories.map((c:[string,number], i:number) => i!=0 && i<21? (
                        <div key={i} className={`${styles.tag} ${tag == c[0] ? styles.active : ""}`} onClick={() => {
                            changeTag(c[0])
                        }}>
                            <p className={styles.categoryName}>{c[0]}</p><p className={styles.categoryNumber}>{c[1]}</p>
                        </div>
                    ):"")}
                </div>
            }
        </div>
    )
}
export default Search