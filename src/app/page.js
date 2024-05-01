"use client"; // This is a client component 

import Image from "next/image";
import "./globals.css";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.min.css';
import {db} from "./firebase"
import {collection, addDoc} from 'firebase/firestore';
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import bootstrap from 'bootstrap';
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
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    />
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
        <div class="carousel-container">
          <Carousel images={images} />
        </div>
        <Link class="sign-up" href="/register"><button class="btn btn-dark">CSA Sign-up Form</button></Link>
      </div>
    </div>
    </>
  );
}
