"use client"; // This is a client component 

import Image from "next/image";
import "./globals.css";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.min.css';
import {db} from "./firebase"
import {collection, addDoc} from 'firebase/firestore';
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Carousel from "../components/Carousel";

export default function Home() {
  const images = [
    { src: '/IMG_1352.JPEG', alt: 'Image 1', title: 'Slide 1', description: 'This is the first slide description' },
    { src: '/IMG_1400.JPEG', alt: 'Image 1', title: 'Slide 1', description: 'This is the first slide description' },
    { src: '/IMG_1224.JPEG', alt: 'Image 1', title: 'Slide 1', description: 'This is the first slide description' },
    { src: '/IMG_1366.JPEG', alt: 'Image 1', title: 'Slide 1', description: 'This is the first slide description' },
    { src: '/IMG_1409.JPEG', alt: 'Image 1', title: 'Slide 1', description: 'This is the first slide description' },
    { src: '/IMG_1414.JPEG', alt: 'Image 1', title: 'Slide 1', description: 'This is the first slide description' }
    // ... other image objects
  ];
  return (
    <>
    <Head>
      <title>Homepage</title>
    <link
      rel="stylesheet"
      href="/page.module.css"
    />
    </Head>
    <div>
      <div class="homepage">
        <div class="container">
          <h2>Website Coming Soon</h2>
          <h4>Register today using the button below</h4>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
        <div class="carousel-container">
          <Carousel images={images} />
        </div>
        <Link class="sign-up" href="/register"><button class="btn btn-dark">CSA Sign-up Form</button></Link>
      </div>
    </div>
    </>
  );
}
