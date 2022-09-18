import type { NextPage } from 'next'
import { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/index.module.scss'
import { useRouter } from "next/router"

import FormImage from "./components/form_image"
import InfinityImage from './components/infinity_image';
import { postImages } from "../lib/post"

import Modal from 'react-modal'
import M from "./components/modal"
Modal.setAppElement('#__next')

import Menu from "./components/menu"
import Search from "./components/search"

import axios from "axios"
import { getUrl } from "../lib/main"
import { imageLike, imageUnlike } from "../lib/post"

const Home: NextPage = () => {
    const [selectedFile, setSelectedFile]:any = useState(null);
    const [query, setQuery] = useState("");
    const [tag, setTag] = useState("");
    const [like, setLike] = useState(false)
    const [folder, setFolder] = useState(0)
    const send = () => {
        postImages(selectedFile)
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
                <div className={styles.container}>
                    <h2 style={{marginLeft:20,color:"#2d2d2d"}}>Image Library</h2>
                    <Search changeFolder={setFolder} folder={folder} changeLike={setLike} like={like} changeQuery={setQuery} query={query} changeTag={setTag} tag={tag} />
                    <FormImage selectedFile={selectedFile} setSelectedFile={setSelectedFile} multiple={true} submit={send}/>
                    <InfinityImage folder={folder} like={like} query={query} tag={tag}/>
                </div>
            </div>
        </>
    )
}

export default Home
