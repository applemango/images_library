import axios from 'axios';
import { getUrl } from "./main"
export async function postImages(files: File[]) {
    if(files.length == 1) {
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await axios.post(
            getUrl("images/post"),
            formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )
        return
    }
    const uploader = Object.keys(files).map(async i => {
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
    const r = await axios.all(uploader)
}

export async function createFolder(folder_name: string, color: string = "ff0000") {
    try {
        const res = await axios.post(getUrl(`folder/create/${folder_name}?color=${color}`))
        return res.data.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function editFolderName(folder_id:number,folder_name: string) {
    try {
        const res = await axios.post(getUrl(`folder/edit/name/${folder_id}/${folder_name}`))
        return res.data.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function imageAddFolder(folder_id: number, image_id: number) {
    try {
        const res = await axios.post(getUrl(`folder/add/${folder_id}/${image_id}`))
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}
export async function imageDeleteFolder(image_id: number) {
    try {
        const res = await axios.post(getUrl(`folder/delete/${image_id}`))
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}

export async function imageLike(image_id: number) {
    try {
        const res = await axios.post(getUrl(`images/like/${image_id}`))
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}

export async function imageUnlike(image_id: number) {
    try {
        const res = await axios.post(getUrl(`images/unlike/${image_id}`))
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}