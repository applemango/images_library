import { useState, useEffect } from "react";
import styles from "./styles/form_image.module.scss"
import stylesSearch from "./styles/search.module.scss"
type Props = {
    multiple? : boolean
    setSelectedFile : Function
    selectedFile : any
    submit? : Function
    changeLoading ? : Function
    loading?: boolean
    loading_text?: string
    url?: string
    changeUrl? : Function
    submitUrl?: Function
}
const FormImage = ({multiple = false, setSelectedFile, selectedFile, submit, changeLoading, loading, loading_text, url, submitUrl, changeUrl}:Props) => {
    //const [selectedFile, setSelectedFile]:any = useState(null);
    function fileSelect(event: any) {setSelectedFile(event.target.files)}
    useEffect(() => {
        if(!selectedFile || !selectedFile[0]) {
            setSelectedFile(null)
        }
    })
    return (
        <div>
            <div className = {styles.main__ }>
                { changeUrl && submitUrl &&
                    <div style={{marginBottom: '10px'}}>
                        <div className={stylesSearch.searchBox}>
                            <input className={stylesSearch.searchInput} type="text" onChange={(e) => {
                                changeUrl(e.target.value)
                            }} value={url} onKeyPress={(e) => {
                                if(e.key == "Enter") {
                                    e.preventDefault()
                                    submitUrl()
                                }
                            }}  />
                            <div className={stylesSearch.info}>
                                <button onClick={() => {
                                }}>
                                    <div className={stylesSearch.icon}>
                                        <svg style={{fill: '#2d2d2d'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M4.97 11.03a.75.75 0 111.06-1.06L11 14.94V2.75a.75.75 0 011.5 0v12.19l4.97-4.97a.75.75 0 111.06 1.06l-6.25 6.25a.75.75 0 01-1.06 0l-6.25-6.25zm-.22 9.47a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H4.75z"></path></svg>
                                    </div>
                                </button>
                                <div className={`${stylesSearch.label_} ${url ? stylesSearch.active : ""}`}>
                                    <span className={stylesSearch.label}>download url</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <input className = {styles.input_file} name="file" type="file" onChange = {fileSelect} accept=".png, .jpg .jpeg" multiple = {multiple} />
                <div className = {styles.input_file_}>
                    <div className = {styles.input_file__}>
                        <div>
                            { selectedFile && selectedFile[0] ?(
                                <div className={submit ? styles.submits : ""}>
                                    <div style={{display: 'inline-flex'}}>
                                        <div className = {styles.logo}></div>
                                        <p className = {styles.active}>{(selectedFile.length > 1 ? (`${selectedFile.length} file`):selectedFile[0].name)}</p>
                                    </div>
                                    { loading && loading_text &&
                                        <p style={{margin:"0"}} className = {styles.active}>{loading_text}</p>
                                    }
                                    { submit && (
                                        <div className={styles.submit} style={{display:loading ? "none" : "block"}}>
                                            <button onClick={() => {
                                                if(changeLoading) changeLoading(true)
                                                submit()
                                            }}>submit</button>
                                        </div>
                                    )}
                                </div>
                            ): (
                                <div style={{display: 'inline-flex'}}>
                                    <p>Drag and drop image or</p>
                                    <button>Upload</button>
                                </div>
                            )}
                            {
                                /*<div>
                                    <p className = { selectedFile ? (styles.active) : ("")}>{selectedFile ? (selectedFile.name) : ("Drag and drop image or")}</p>
                                    { !selectedFile && (
                                        <button>Upload</button>
                                    )}
                                </div>*/
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default FormImage