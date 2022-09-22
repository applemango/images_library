import axios from 'axios';
import { getUrl, post } from "./main"
import { getToken, isLoginAndLogin } from './token';
export async function postImages(files: File[], changeProgress?: Function) {
    if(files.length == 1) {
        const lRes = await isLoginAndLogin()
        if(!lRes) {
            throw "token not found"
        }
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await axios.post(
            getUrl("images/post"),
            formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                    ,"Authorization": "Bearer "+getToken()
                }
            }
        )
        return
    }
    if(changeProgress) changeProgress(0)
    for (let i = 0; i < files.length; i++) {
        const lRes = await isLoginAndLogin()
        if(!lRes) {
            throw "token not found"
        }
        const file = files[Number(i)]
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await axios.post(
                getUrl("images/post"),
                formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                        ,"Authorization": "Bearer "+getToken()
                    }
                }
            )
        } catch (e) {console.log(e)}
        if(changeProgress) {
            changeProgress((n:number) => n+1)
        }
        /*return res*/
    }
    /*const a = async () => {
        Object.keys(files).map(async i => {
            const file = files[Number(i)]
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post(
                getUrl("images/post"),
                formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            )
            if(changeProgress) {
                console.log("a")
                changeProgress((n:number) => n+1)
            }
            return res
        })
    }
    await a()*/
    /*const uploader = Object.keys(files).map(async i => {
        const file = files[Number(i)]
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post(
            getUrl("images/post"),
            formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )
        return res
    })
    const r = await axios.all(uploader).then(() => {
        if(changeProgress) {
            changeProgress((i:number) => i+1)
        }
    })*/
}

export async function createFolder(folder_name: string, color: string = "ff0000") {
    try {
        //const res = await axios.post(getUrl(`folder/create/${folder_name}?color=${color}`))
        const res = await post(
            getUrl(`folder/create/${folder_name}?color=${color}`)
            , {}, {}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function editFolderName(folder_id:number,folder_name: string) {
    try {
        //const res = await axios.post(getUrl(`folder/edit/name/${folder_id}/${folder_name}`))
        const res = await post(
            getUrl(`folder/edit/name/${folder_id}/${folder_name}`)
            , {}, {}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function imageAddFolder(folder_id: number, image_id: number) {
    try {
        //const res = await axios.post(getUrl(`folder/add/${folder_id}/${image_id}`))
        const res = await post(
            getUrl(`folder/add/${folder_id}/${image_id}`)
            , {}, {}, true, true
        )
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function imageDeleteFolder(image_id: number) {
    try {
        //const res = await axios.post(getUrl(`folder/delete/${image_id}`))
        const res = await post(
            getUrl(`folder/delete/${image_id}`)
            , {}, {}, true, true
        )
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}

export async function imageLike(image_id: number) {
    try {
        //const res = await axios.post(getUrl(`images/like/${image_id}`))
        const res = await post(
            getUrl(`images/like/${image_id}`)
            , {}, {}, true, true
        )
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}

export async function imageUnlike(image_id: number) {
    try {
        //const res = await axios.post(getUrl(`images/unlike/${image_id}`))
        const res = await post(
            getUrl(`images/unlike/${image_id}`)
            , {}, {}, true, true
        )
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function postImagesUrl(url: string) {
    try {
        //const res = await axios.post(getUrl('images/post/url'), {body: JSON.stringify({url: url})})
        const res = await post(
            getUrl('images/post/url')
            ,{}, {url: url}, true, true
        )
        return res.data
    } catch (error: any) {
        return undefined
    }
}