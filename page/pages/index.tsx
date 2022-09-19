import type { NextPage } from 'next'
import { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/index.module.scss'
import { useRouter } from "next/router"

import FormImage from "./components/form_image"
import InfinityImage from './components/infinity_image';
import { postImages, postImagesUrl } from "../lib/post"

import Modal from 'react-modal'
import M from "./components/modal"
Modal.setAppElement('#__next')

import Menu from "./components/menu"
import Search from "./components/search"

import axios from "axios"
import { getUrl } from "../lib/main"
import { imageLike, imageUnlike } from "../lib/post"

import SmoothScroll from "./components/scroll"

const Home: NextPage = () => {
    const [selectedFile, setSelectedFile]:any = useState(null);
    const [query, setQuery] = useState("");
    const [tag, setTag] = useState("");
    const [like, setLike] = useState(false)
    const [folder, setFolder] = useState(0)
    const [loading, setLoading] = useState(false)
    const [position, setPositions] = useState(0)
    const [url, setUrl] = useState("")
    const [now, setNow] = useState(0)
    const [reload, setReload] = useState(0)
    const send = async () => {
        const res = await postImages(selectedFile,setNow)
        setLoading(false)
        setReload(Math.random())
    }
    const send_ = async () => {
        setUrl("loading...")
        const res = await postImagesUrl(url)
        setLoading(false)
        setUrl("")
        setReload(Math.random())
    }
    const router = useRouter()
    useEffect(() => {
    })
    return (
        <>
            <Modal
                className={styles.modal}
                style={{
                    overlay: {
                        backgroundColor: "rgb(0 0 0 / 45%)"
                        ,zIndex: 100
                    }
                    ,content: {}
                }}
                isOpen={!!router.query.id}
                onRequestClose={() => router.push("/")}
                contentLabel="modal"
            >
                <div>
                    <M id={Number(router.query.id)} />
                </div>
            </Modal>
            <div className={styles.main}>
                <Menu />
                <SmoothScroll changePositions={setPositions}>
                    <div className={styles.container} style={{transform: 'translateX(40px)',marginBottom: '10px'}}>
                        <h2 style={{marginLeft:20,color:"#2d2d2d"}}>Image Library</h2>
                        <Search changeFolder={setFolder} folder={folder} changeLike={setLike} like={like} changeQuery={setQuery} query={query} changeTag={setTag} tag={tag} />
                        <FormImage loading_text={selectedFile && selectedFile.length > 1 ? `${now}/${selectedFile.length}` : "loading..."} loading={loading} changeLoading={setLoading} selectedFile={selectedFile} setSelectedFile={setSelectedFile} multiple={true} submit={send} url={url} submitUrl={send_} changeUrl={setUrl}/>
                        <InfinityImage reload={reload} reloadScroll={position} folder={folder} like={like} query={query} tag={tag}/>
                    </div>
                </SmoothScroll>
            </div>
        </>
    )
}

export default Home
