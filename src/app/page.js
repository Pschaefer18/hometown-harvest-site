"use client"; // This is a client component 

import Image from "next/image";
import "./globals.css";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.min.css';
import {db} from "./firebase"
import {collection, addDoc} from 'firebase/firestore';
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Home() {

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
          <h2>Site will be up next year</h2>
          <h3>For now, sign up for the 2024 CSA</h3>
        </div>
        <Link class="sign-up" href="/register"><button class="btn btn-dark">Sign-up Now</button></Link>
      </div>
    </div>
    </>
  );
}
