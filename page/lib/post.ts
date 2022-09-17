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