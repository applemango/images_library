import { useState, useEffect } from "react";
import styles from "./styles/form_image.module.scss"
type Props = {
    multiple? : boolean
    setSelectedFile : Function
    selectedFile : any
    submit? : Function
}
const FormImage = ({multiple = false, setSelectedFile, selectedFile, submit}:Props) => {
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
                                    { submit && (
                                        <div className={styles.submit}>
                                            <button onClick={() => submit()}>submit</button>
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